import 'dotenv/config'

// Configure environment variables
export const config = {
  port: process.env.PORT || 3001,
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  storage: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  }
}

// Validate required environment variables
const validateConfig = () => {
  const required = ['SUPABASE_URL', 'SUPABASE_KEY', 'OPENAI_API_KEY']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

validateConfig()
