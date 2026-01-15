import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../server.js'
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware.js'

const router = Router()

// POST /api/admin/auth/login - Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// GET /api/admin/auth/me - Get current admin
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.id },
      select: { id: true, email: true, name: true }
    })

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' })
    }

    res.json(admin)
  } catch (error) {
    console.error('Error fetching admin:', error)
    res.status(500).json({ error: 'Failed to fetch admin' })
  }
})

export default router
