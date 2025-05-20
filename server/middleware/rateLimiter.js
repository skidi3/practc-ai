import Redis from 'ioredis'

// In-memory fallback for rate limiting
const inMemoryLimiter = new Map()
let redisClient = null
let usingFallback = false

// Initialize Redis with better connection handling
const initRedis = () => {
  if (!process.env.REDIS_URL) {
    console.log('No Redis URL provided, using memory rate limiter only')
    usingFallback = true
    return null
  }

  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) {
        usingFallback = true
        return null // Stop retrying after 3 attempts
      }
      return Math.min(times * 100, 3000)
    }
  })

  client.on('error', (err) => {
    if (!usingFallback) {
      console.warn('Rate limiter Redis error, using memory fallback:', err.message)
      usingFallback = true
    }
  })

  client.on('connect', () => {
    console.log('Rate limiter Redis connected')
    usingFallback = false
  })

  return client
}

redisClient = initRedis()

const memoryRateLimit = (ip, limit, window) => {
  const now = Date.now()
  const windowMs = window * 1000
  const userRequests = inMemoryLimiter.get(ip) || { count: 0, start: now }

  if (now - userRequests.start > windowMs) {
    userRequests.count = 0
    userRequests.start = now
  }

  userRequests.count++
  inMemoryLimiter.set(ip, userRequests)

  return userRequests.count <= limit
}

export const rateLimiter = async (req, res, next) => {
  const key = `ratelimit:${req.ip}`
  const limit = 100 // requests
  const window = 3600 // 1 hour in seconds

  // Use memory rate limiting if Redis is unavailable
  if (usingFallback || !redisClient) {
    const allowed = memoryRateLimit(req.ip, limit, window)
    if (!allowed) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      })
    }
    return next()
  }

  try {
    const current = await redisClient.incr(key)

    if (current === 1) {
      await redisClient.expire(key, window)
    }

    if (current > limit) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      })
    }

    next()
  } catch (error) {
    // Fallback to memory rate limiting on error
    const allowed = memoryRateLimit(req.ip, limit, window)
    if (!allowed) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      })
    }
    next()
  }
}
