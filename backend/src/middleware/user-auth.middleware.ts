import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface UserRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export function userAuthMiddleware(req: UserRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      email: string
      type: string
    }

    if (decoded.type !== 'user') {
      return res.status(401).json({ error: 'Invalid token type' })
    }

    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function optionalUserAuth(req: UserRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      email: string
      type: string
    }

    if (decoded.type === 'user') {
      req.user = { id: decoded.id, email: decoded.email }
    }
  } catch {
    // Invalid token, continue without user
  }

  next()
}
