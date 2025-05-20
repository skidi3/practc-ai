import { useState, useCallback } from 'react'

export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false)
  const supported = 'speechSynthesis' in window

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!supported) return

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => {
        setSpeaking(false)
        if (onEnd) onEnd()
      }
      utterance.onerror = () => {
        setSpeaking(false)
        if (onEnd) onEnd()
      }

      window.speechSynthesis.speak(utterance)
    },
    [supported]
  )

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return {
    speak,
    cancel,
    speaking,
    supported
  }
}
