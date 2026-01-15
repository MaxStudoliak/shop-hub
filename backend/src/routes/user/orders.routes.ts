import { Router, Response } from 'express'
import { prisma } from '../../server.js'
import { userAuthMiddleware, UserRequest } from '../../middleware/user-auth.middleware.js'

const router = Router()

router.use(userAuthMiddleware)

// GET /api/user/orders - Get user's orders
router.get('/', async (req: UserRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user!.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.order.count({ where: { userId: req.user!.id } })
    ])

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET /api/user/orders/:id - Get order details
router.get('/:id', async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user!.id
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

export default router
