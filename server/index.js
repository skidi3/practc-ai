import express from 'express'
import cors from 'cors'
import cluster from 'node:cluster'
import { cpus } from 'node:os'
import { config } from './config/index.js'
import routes from './routes/index.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'

if (cluster.isPrimary) {
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
} else {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json())
  app.use(rateLimiter)

  // Routes
  app.use('/api', routes)

  // Error handling middleware
  app.use(errorHandler)

  // Start server
  app.listen(config.port, () => {
    console.log(`Worker ${process.pid} started on port ${config.port}`)
    console.log('Environment variables loaded:', {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_KEY: !!process.env.SUPABASE_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      REDIS_URL: !!process.env.REDIS_URL
    })
  })
}
