import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImage(filePath: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.upload(filePath, {
    folder: 'shop-hub',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  })
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

export { cloudinary }
