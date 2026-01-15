import { Router, Request, Response } from 'express'
import { prisma } from '../../server.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import slugify from 'slugify'
import { z } from 'zod'

const router = Router()

router.use(authMiddleware)

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  status: z.enum(['ACTIVE', 'DRAFT', 'OUT_OF_STOCK']).default('ACTIVE'),
  categoryId: z.string().uuid(),
  images: z.array(z.object({
    url: z.string().url(),
    position: z.number().int().nonnegative().default(0)
  })).optional()
})

// GET /api/admin/products - List all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search, status, categoryId } = req.query

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } }
      ]
    }
    if (status) where.status = status
    if (categoryId) where.categoryId = categoryId

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { position: 'asc' } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.product.count({ where })
    ])

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/admin/products/:id - Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } }
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST /api/admin/products - Create product
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = productSchema.parse(req.body)

    let slug = slugify(data.name, { lower: true, strict: true })

    // Ensure unique slug
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        sku: data.sku,
        stock: data.stock,
        status: data.status,
        categoryId: data.categoryId,
        images: data.images ? {
          create: data.images.map((img, idx) => ({
            url: img.url,
            position: img.position ?? idx
          }))
        } : undefined
      },
      include: {
        category: true,
        images: true
      }
    })

    res.status(201).json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error creating product:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT /api/admin/products/:id - Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = productSchema.partial().parse(req.body)

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // If name changed, update slug
    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      slug = slugify(data.name, { lower: true, strict: true })
      const slugExists = await prisma.product.findFirst({
        where: { slug, id: { not: id } }
      })
      if (slugExists) {
        slug = `${slug}-${Date.now().toString(36)}`
      }
    }

    // Update images if provided
    if (data.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      await prisma.productImage.createMany({
        data: data.images.map((img, idx) => ({
          productId: id,
          url: img.url,
          position: img.position ?? idx
        }))
      })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        sku: data.sku,
        stock: data.stock,
        status: data.status,
        categoryId: data.categoryId
      },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } }
      }
    })

    res.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error updating product:', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /api/admin/products/:id - Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' })
    }

    await prisma.product.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
