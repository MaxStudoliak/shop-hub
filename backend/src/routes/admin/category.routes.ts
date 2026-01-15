import { Router, Request, Response } from 'express'
import { prisma } from '../../server.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import slugify from 'slugify'
import { z } from 'zod'

const router = Router()

router.use(authMiddleware)

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable()
})

// GET /api/admin/categories - List all categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/admin/categories/:id - Get category by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

// POST /api/admin/categories - Create category
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = categorySchema.parse(req.body)

    let slug = slugify(data.name, { lower: true, strict: true })

    // Ensure unique slug
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image
      }
    })

    res.status(201).json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// PUT /api/admin/categories/:id - Update category
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = categorySchema.partial().parse(req.body)

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' })
    }

    // If name changed, update slug
    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      slug = slugify(data.name, { lower: true, strict: true })
      const slugExists = await prisma.category.findFirst({
        where: { slug, id: { not: id } }
      })
      if (slugExists) {
        slug = `${slug}-${Date.now().toString(36)}`
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image
      }
    })

    res.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error updating category:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// DELETE /api/admin/categories/:id - Delete category
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Category not found' })
    }

    if (existing._count.products > 0) {
      return res.status(400).json({
        error: 'Cannot delete category with products. Move or delete products first.'
      })
    }

    await prisma.category.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router
