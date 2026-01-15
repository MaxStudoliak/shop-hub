import { Router, Request, Response } from 'express'
import { prisma } from '../../server.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { z } from 'zod'

const router = Router()

router.use(authMiddleware)

// GET /api/admin/orders - List all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      paymentStatus,
      search
    } = req.query

    const where: any = {}
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { customerEmail: { contains: search as string, mode: 'insensitive' } },
        { customerName: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.order.count({ where })
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

// GET /api/admin/orders/:id - Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
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

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
})

// PUT /api/admin/orders/:id/status - Update order status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = updateStatusSchema.parse(req.body)

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true
      }
    })

    res.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error updating order status:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

export default router
