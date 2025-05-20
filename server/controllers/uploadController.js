import { supabase } from '../services/supabase.js'
import { uploadToStorage } from '../services/storage.js'
import { extractTextFromFile } from '../services/fileParser.js'
import { config } from '../config/index.js'

export const uploadResume = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (!config.storage.allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.' })
    }

    const text = await extractTextFromFile(file.buffer, file.mimetype)
    const { path: storagePath, publicUrl } = await uploadToStorage(file, 'resumes')

    const { data, error } = await supabase
      .from('resumes')
      .insert([
        {
          file_name: file.originalname,
          file_path: file.originalname,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.mimetype,
          content: text,
          public_url: publicUrl
        }
      ])
      .select()

    if (error) throw error

    return res.status(200).json({
      id: data[0].id,
      fileName: file.originalname,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      content: text
    })
  } catch (error) {
    console.error('Error uploading resume:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

export const uploadJobDescription = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const text = await extractTextFromFile(file.buffer, file.mimetype)
    const { path: storagePath, publicUrl } = await uploadToStorage(file, 'job_descriptions')

    const { data, error } = await supabase
      .from('job_descriptions')
      .insert([
        {
          file_name: file.originalname,
          file_path: file.originalname,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.mimetype,
          content: text,
          public_url: publicUrl
        }
      ])
      .select()

    if (error) throw error

    return res.status(200).json({
      id: data[0].id,
      fileName: file.originalname,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      content: text
    })
  } catch (error) {
    console.error('Error uploading job description:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
