import Redis from 'ioredis'

// In-memory fallback cache
const memoryCache = new Map()
let redisClient = null
let usingFallback = false

// Initialize Redis with better connection handling
const initRedis = () => {
  if (!process.env.REDIS_URL) {
    console.log('No Redis URL provided, using memory cache only')
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
    },
    reconnectOnError: (err) => {
      const targetError = 'READONLY'
      if (err.message.includes(targetError)) {
        return true
      }
      return false
    }
  })

  client.on('error', (err) => {
    if (!usingFallback) {
      console.warn('Redis error, using memory cache:', err.message)
      usingFallback = true
    }
  })

  client.on('connect', () => {
    console.log('Redis connected')
    usingFallback = false
  })

  return client
}

redisClient = initRedis()

export const cacheGet = async (key) => {
  if (usingFallback || !redisClient) {
    return memoryCache.get(key) || null
  }

  try {
    const value = await redisClient.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    return memoryCache.get(key) || null
  }
}

export const cacheSet = async (key, value, expireSeconds = 3600) => {
  // Always set in memory cache as backup
  memoryCache.set(key, value)
  setTimeout(() => memoryCache.delete(key), expireSeconds * 1000)

  if (usingFallback || !redisClient) {
    return
  }

  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', expireSeconds)
  } catch (error) {
    // Error already logged by error handler
  }
}

export const cacheDelete = async (key) => {
  memoryCache.delete(key)

  if (usingFallback || !redisClient) {
    return
  }

  try {
    await redisClient.del(key)
  } catch (error) {
    // Error already logged by error handler
  }
}
