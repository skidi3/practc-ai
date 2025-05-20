import { v4 as uuidv4 } from 'uuid'

// Session storage key
const SESSION_KEY = 'interview_session_id'

export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY)

  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem(SESSION_KEY, sessionId)
  }

  return sessionId
}

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY)
}
