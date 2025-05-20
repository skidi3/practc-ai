import { supabase, ensureBucketExists } from './supabase.js'

export const uploadToStorage = async (file, bucketName) => {
  try {
    await ensureBucketExists(bucketName)

    const timestamp = Date.now()
    const fileExt = file.originalname.split('.').pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600'
    })

    if (error) throw error

    const {
      data: { publicUrl }
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    return {
      path: fileName,
      publicUrl
    }
  } catch (error) {
    console.error(`Error uploading to ${bucketName}:`, error)
    throw error
  }
}
