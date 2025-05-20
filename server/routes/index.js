import express from 'express'
import multer from 'multer'
import { uploadResume, uploadJobDescription } from '../controllers/uploadController.js'
import { startInterview, sendMessage, endInterview } from '../controllers/interviewController.js'

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Upload routes
router.post('/resume', upload.single('file'), uploadResume)
router.post('/job-description', upload.single('file'), uploadJobDescription)

// Interview routes
router.post('/interviews', startInterview)
router.post('/interviews/:interviewId/messages', sendMessage)
router.post('/interviews/:interviewId/end', endInterview)

export default router
