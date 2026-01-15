import { Router, Request, Response } from 'express'
import { prisma } from '../../server.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

// GET /api/admin/stats - Get dashboard statistics
router.get('/', async (_req: Request, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      ordersToday,
      ordersThisMonth,
      pendingOrders,
      totalCategories,
      revenueResult,
      revenueThisMonthResult,
      recentOrders
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.category.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: thisMonth }
        }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true
        }
      })
    ])

    const totalRevenue = revenueResult._sum.total || 0
    const revenueThisMonth = revenueThisMonthResult._sum.total || 0

    res.json({
      products: {
        total: totalProducts,
        active: activeProducts
      },
      orders: {
        total: totalOrders,
        today: ordersToday,
        thisMonth: ordersThisMonth,
        pending: pendingOrders
      },
      categories: {
        total: totalCategories
      },
      revenue: {
        total: Number(totalRevenue),
        thisMonth: Number(revenueThisMonth)
      },
      recentOrders
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
