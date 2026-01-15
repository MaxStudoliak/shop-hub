import { Router, Response } from 'express'
import { prisma } from '../../server.js'
import { userAuthMiddleware, UserRequest } from '../../middleware/user-auth.middleware.js'

const router = Router()

router.use(userAuthMiddleware)

// GET /api/favorites - Get user's favorites
router.get('/', async (req: UserRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { position: 'asc' }, take: 1 }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(favorites.map(f => f.product))
  } catch (error) {
    console.error('Error fetching favorites:', error)
    res.status(500).json({ error: 'Failed to fetch favorites' })
  }
})

// POST /api/favorites/:productId - Add to favorites
router.post('/:productId', async (req: UserRequest, res: Response) => {
  try {
    const { productId } = req.params

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId
        }
      }
    })

    if (existing) {
      return res.json({ success: true, message: 'Already in favorites' })
    }

    await prisma.favorite.create({
      data: {
        userId: req.user!.id,
        productId
      }
    })

    res.status(201).json({ success: true })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    res.status(500).json({ error: 'Failed to add to favorites' })
  }
})

// DELETE /api/favorites/:productId - Remove from favorites
router.delete('/:productId', async (req: UserRequest, res: Response) => {
  try {
    const { productId } = req.params

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user!.id,
        productId
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    res.status(500).json({ error: 'Failed to remove from favorites' })
  }
})

// GET /api/favorites/check/:productId - Check if product is in favorites
router.get('/check/:productId', async (req: UserRequest, res: Response) => {
  try {
    const { productId } = req.params

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId
        }
      }
    })

    res.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error('Error checking favorite:', error)
    res.status(500).json({ error: 'Failed to check favorite' })
  }
})

export default router
