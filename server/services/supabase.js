import { createClient } from '@supabase/supabase-js'
import { config } from '../config/index.js'

export const supabase = createClient(config.supabase.url, config.supabase.key)

export const ensureBucketExists = async (bucketName) => {
  try {
    const { data: bucket, error } = await supabase.storage.getBucket(bucketName)

    if (error && error.message === 'Bucket not found') {
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: config.storage.allowedMimeTypes,
        fileSizeLimit: config.storage.maxFileSize
      })

      if (createError) throw createError
      return data
    } else if (error) {
      throw error
    }

    return bucket
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error)
    throw error
  }
}
