import pdf from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'

export const extractTextFromFile = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer)
      return data.text
    } else if (mimetype.includes('word') || mimetype.includes('docx')) {
      const result = await mammoth.extractRawText({ buffer: buffer })
      return result.value
    } else if (mimetype === 'text/plain') {
      return buffer.toString('utf-8')
    }
    throw new Error('Unsupported file type')
  } catch (error) {
    console.error('Error extracting text:', error)
    throw new Error(`Failed to extract text from file: ${error.message}`)
  }
}
