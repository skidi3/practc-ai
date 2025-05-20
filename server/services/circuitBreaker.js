class CircuitBreaker {
  constructor(requestFn, options = {}) {
    this.requestFn = requestFn
    this.state = 'CLOSED'
    this.failureCount = 0
    this.failureThreshold = options.failureThreshold || 5
    this.resetTimeout = options.resetTimeout || 60000
    this.lastFailureTime = null
  }

  async fire(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF-OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const response = await this.requestFn(...args)
      this.success()
      return response
    } catch (error) {
      this.failure()
      throw error
    }
  }

  success() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }

  failure() {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }
}

export default CircuitBreaker
