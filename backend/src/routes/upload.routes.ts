import { Router, Request, Response } from 'express'
import multer from 'multer'
import { uploadImage } from '../services/cloudinary.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import fs from 'fs'

const router = Router()

const upload = multer({ dest: 'uploads/' })

// POST /api/upload - Upload image (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const result = await uploadImage(req.file.path)

    // Clean up temp file
    fs.unlinkSync(req.file.path)

    res.json({
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

export default router
