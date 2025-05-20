import React, { useState, useEffect } from 'react'
import { MessageType } from '../types'
import { User, Bot, Play, StopCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettings } from '../context/SettingsContext'

interface ChatMessageProps {
  message: MessageType
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<SpeechSynthesisUtterance | null>(null)
  const { settings } = useSettings()

  useEffect(() => {
    if (!isUser && settings.autoPlayResponses && message.content) {
      speak(message.content)
    }

    return () => {
      if (audioElement) {
        window.speechSynthesis.cancel()
      }
    }
  }, [message, settings.autoPlayResponses])

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)

      utterance.onend = () => {
        setIsPlaying(false)
        setAudioElement(null)
      }

      utterance.onstart = () => {
        setIsPlaying(true)
        setAudioElement(utterance)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        setAudioElement(null)
        toast.error('Failed to play audio')
      }

      window.speechSynthesis.speak(utterance)
    } else {
      toast.error('Text-to-speech is not supported in your browser')
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setAudioElement(null)
    } else {
      speak(message.content)
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 fadeIn`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
        <div className={`flex items-center justify-center h-10 w-10 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div
            className={`p-2 rounded-xl bg-gradient-to-br ${
              isUser
                ? 'from-blue-500/20 to-blue-600/20 border border-blue-500/30'
                : 'from-blue-600/20 to-blue-700/20 border border-blue-600/30'
            }`}
          >
            {isUser ? <User className="h-5 w-5 text-blue-400" /> : <Bot className="h-5 w-5 text-blue-400" />}
          </div>
        </div>

        <div
          className={`relative px-5 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-br from-blue-600/90 to-blue-700/90 text-white'
              : 'glass-effect border border-blue-500/20 text-blue-100'
          }`}
        >
          <div className="flex items-start space-x-3">
            <p className="whitespace-pre-wrap flex-grow leading-relaxed">{message.content}</p>
            {!isUser && (
              <button
                onClick={togglePlay}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isPlaying ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'hover:bg-blue-900/20 text-blue-400'
                }`}
                title={isPlaying ? 'Stop speaking' : 'Play message'}
              >
                {isPlaying ? <StopCircle className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
