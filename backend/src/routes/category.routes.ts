import { Router, Request, Response } from 'express'
import { prisma } from '../server.js'

const router = Router()

// GET /api/categories - Get all categories
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

// GET /api/categories/:slug/products - Get products by category
router.get('/:slug/products', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    const { page = '1', limit = '12', sort = 'createdAt', order = 'desc' } = req.query

    const category = await prisma.category.findUnique({
      where: { slug }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          categoryId: category.id,
          status: 'ACTIVE'
        },
        include: {
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1 }
        },
        orderBy: { [sort as string]: order },
        skip,
        take
      }),
      prisma.product.count({
        where: {
          categoryId: category.id,
          status: 'ACTIVE'
        }
      })
    ])

    res.json({
      category,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching category products:', error)
    res.status(500).json({ error: 'Failed to fetch category products' })
  }
})

export default router
