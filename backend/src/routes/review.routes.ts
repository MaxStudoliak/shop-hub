import { Router, Request, Response } from 'express'
import { prisma } from '../server.js'
import { userAuthMiddleware, UserRequest } from '../middleware/user-auth.middleware.js'
import { z } from 'zod'

const router = Router()

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000)
})

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params
    const { page = '1', limit = '10' } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true
      })
    ])

    res.json({
      reviews,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

// POST /api/reviews/product/:productId - Create review
router.post('/product/:productId', userAuthMiddleware, async (req: UserRequest, res: Response) => {
  try {
    const { productId } = req.params
    const data = reviewSchema.parse(req.body)

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if user already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId
        }
      }
    })

    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product' })
    }

    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId: req.user!.id,
        productId
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    })

    res.status(201).json(review)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error creating review:', error)
    res.status(500).json({ error: 'Failed to create review' })
  }
})

// PUT /api/reviews/:id - Update review
router.put('/:id', userAuthMiddleware, async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = reviewSchema.parse(req.body)

    const existing = await prisma.review.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Review not found' })
    }

    if (existing.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating: data.rating,
        comment: data.comment
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    })

    res.json(review)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error updating review:', error)
    res.status(500).json({ error: 'Failed to update review' })
  }
})

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', userAuthMiddleware, async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params

    const existing = await prisma.review.findUnique({
      where: { id }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Review not found' })
    }

    if (existing.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await prisma.review.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    res.status(500).json({ error: 'Failed to delete review' })
  }
})

export default router
