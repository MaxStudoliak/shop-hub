import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../server.js'
import { userAuthMiddleware, UserRequest } from '../../middleware/user-auth.middleware.js'
import { z } from 'zod'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body)

    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name
      },
      select: { id: true, email: true, name: true }
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    res.status(201).json({ user, token })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error registering user:', error)
    res.status(500).json({ error: 'Failed to register' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(data.password, user.password)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// GET /api/auth/me
router.get('/me', userAuthMiddleware, async (req: UserRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        city: true,
        zip: true,
        country: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// PUT /api/auth/profile
router.put('/profile', userAuthMiddleware, async (req: UserRequest, res: Response) => {
  try {
    const { name, phone, address, city, zip, country } = req.body

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone, address, city, zip, country },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        city: true,
        zip: true,
        country: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// PUT /api/auth/password
router.put('/password', userAuthMiddleware, async (req: UserRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Invalid password' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)

    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

export default router
