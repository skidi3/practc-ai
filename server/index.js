import express from 'express'
import cors from 'cors'
import cluster from 'node:cluster'
import { cpus } from 'node:os'
import { config } from './config/index.js'
import routes from './routes/index.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'

const isVercel = !!process.env.VERCEL
const app = express()

// Middleware

const corsOptions = {
  origin: ['https://practc-hnmcv422e-skidi3s-projects.vercel.app'], // allow your frontend domain
  credentials: true // allow cookies or Authorization headers
};

app.use(cors(corsOptions));
app.use(express.json())
app.use(rateLimiter)

// Routes
app.use('/api', routes)

// Error handling middleware
app.use(errorHandler)

if (!isVercel && cluster.isPrimary) {
  const numCPUs = cpus().length
  console.log(`Primary ${process.pid} is running`)
  console.log(`Setting up ${numCPUs} workers...`)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`)
    cluster.fork()
  })
} else if (!isVercel) {
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`)
    console.log('Environment variables loaded:', {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_KEY: !!process.env.SUPABASE_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      REDIS_URL: !!process.env.REDIS_URL
    })
  })
}

export default app  
