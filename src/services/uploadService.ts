import axios from 'axios'
import { ResumeData, JobDescriptionData } from '../types'

const API_URL = import.meta.env.VITE_API_URL

export const uploadResume = async (file: File): Promise<ResumeData> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await axios.post(`${API_URL}/api/resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    console.error('Error uploading resume:', error)
    throw new Error('Failed to upload resume')
  }
}

export const uploadJobDescription = async (file: File): Promise<JobDescriptionData> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await axios.post(`${API_URL}/api/job-description`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    console.error('Error uploading job description:', error)
    throw new Error('Failed to upload job description')
  }
}
