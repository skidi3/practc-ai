import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Mic, StopCircle, Loader, Settings, Share2 } from 'lucide-react'
import { useInterview } from '../context/InterviewContext'
import { useSettings } from '../context/SettingsContext'
import { sendMessage, endInterview } from '../services/interviewService'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import toast from 'react-hot-toast'
import ChatMessage from '../components/ChatMessage'
import SettingsModal from '../components/SettingsModal'

const InterviewPage: React.FC = () => {
  const { interview, messages, addMessage, setFeedback, isInterviewActive } = useInterview()

  const { settings } = useSettings()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEndingInterview, setIsEndingInterview] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [streak, setStreak] = useState(0)

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    if (!isInterviewActive) {
      navigate('/')
    } else if (messages.length === 0) {
      handleInitialQuestion()
    }
  }, [isInterviewActive, navigate, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!listening && transcript && settings.autoSend) {
      handleSendMessage(transcript)
      resetTranscript()
      setUserInput('')
    } else if (!listening && transcript && !settings.autoSend) {
      setUserInput(transcript)
    }
  }, [listening, transcript, settings.autoSend])

  useEffect(() => {
    if (listening) {
      window.speechSynthesis.cancel()
    }
  }, [listening])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInitialQuestion = async () => {
    setIsLoading(true)
    try {
      const response = await sendMessage(interview.id, '', true)
      const message = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: response.message,
        timestamp: new Date().toISOString()
      }
      addMessage(message)

      if (settings.autoPlayResponses) {
        const utterance = new SpeechSynthesisUtterance(response.message)
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Error getting initial question:', error)
      toast.error('Failed to start interview. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || userInput
    if (!messageToSend.trim() || isLoading) return

    window.speechSynthesis.cancel()

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: messageToSend,
      timestamp: new Date().toISOString()
    }

    addMessage(userMessage)
    setUserInput('')
    resetTranscript()
    setIsLoading(true)

    try {
      if (settings.useResponseDelay) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const response = await sendMessage(interview.id, messageToSend)

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.message,
        timestamp: new Date().toISOString()
      }

      addMessage(aiMessage)

      if (messageToSend.length > 20 && !settings.useResponseDelay) {
        setStreak((prev) => prev + 1)
        if (streak > 0 && streak % 3 === 0) {
          toast.success(`🔥 ${streak + 1} Quick Responses! Keep it up!`, {
            icon: '🎯',
            duration: 2000
          })
        }
      }

      if (settings.autoPlayResponses) {
        const utterance = new SpeechSynthesisUtterance(response.message)
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to get response. Please try again.')
      setStreak(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndInterview = async () => {
    setIsEndingInterview(true)
    try {
      const response = await endInterview(interview.id)
      setFeedback(response.feedback)
      navigate('/feedback')
    } catch (error) {
      console.error('Error ending interview:', error)
      toast.error('Failed to end interview. Please try again.')
    } finally {
      setIsEndingInterview(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const shareInterview = async () => {
    try {
      await navigator.share({
        title: 'My AI Interview Practice',
        text: 'Check out this amazing AI interviewer that helps you practice for job interviews!',
        url: window.location.href
      })
      toast.success('Thanks for sharing! 🙌')
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  const toggleRecording = async () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser')
      return
    }

    window.speechSynthesis.cancel()

    if (!listening) {
      try {
        resetTranscript()
        setUserInput('')
        await SpeechRecognition.startListening({ continuous: true })
        toast.success('Recording started! Speak now...', {
          icon: '🎤',
          duration: 2000
        })
      } catch (error) {
        console.error('Speech recognition error:', error)
        toast.error('Failed to start recording. Please check microphone permissions.')
      }
    } else {
      SpeechRecognition.stopListening()
      if (!settings.autoSend) {
        toast.success('Recording stopped! Your response is ready to send.', {
          icon: '✅',
          duration: 2000
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] relative">
      {/* Wave Background */}
      <div className="wave-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-64px)] flex flex-col relative z-10">
        <div className="glass-effect rounded-2xl flex flex-col flex-grow overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-900/20 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-blue-300">AI Interview Session</h2>
              <p className="text-sm text-blue-400/70">Answer the questions naturally - you can type or speak</p>
            </div>
            <div className="flex items-center space-x-4">
              {streak > 0 && (
                <div className="px-3 py-1 bg-gradient-to-r from-orange-400/90 to-red-500/90 text-white rounded-full flex items-center">
                  <span className="mr-1">🔥</span>
                  <span className="font-medium">{streak}</span>
                </div>
              )}
              <button
                onClick={shareInterview}
                className="p-2 hover:bg-blue-900/20 rounded-full transition-colors"
                title="Share Interview"
              >
                <Share2 className="h-5 w-5 text-blue-400" />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-blue-900/20 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-blue-400" />
              </button>
              <button
                onClick={handleEndInterview}
                disabled={isEndingInterview || messages.length < 2}
                className={`px-4 py-2 rounded-xl text-white font-medium transition-all ${
                  isEndingInterview || messages.length < 2
                    ? 'bg-red-500/30 cursor-not-allowed'
                    : 'bg-red-500/90 hover:bg-red-600/90 hover:scale-105'
                }`}
              >
                {isEndingInterview ? 'Generating Feedback...' : 'End Interview'}
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-400/70">
                <Loader className="h-5 w-5 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 py-4 border-t border-blue-900/20">
            <div className="relative">
              {/* Live transcript display */}
              {listening && (
                <div
                  className={`absolute bottom-full left-0 right-0 mb-4 p-4 glass-effect rounded-xl ${
                    settings.autoSend ? 'border-red-500/30' : 'border-blue-500/30'
                  } ${settings.autoSend ? 'animate-pulse' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-400">Recording...</span>
                  </div>
                  <p className="text-sm text-blue-200">{transcript || 'Listening... Start speaking'}</p>
                </div>
              )}

              <div className="flex space-x-2">
                {!settings.autoSend ? (
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer or click the microphone to speak..."
                    className="flex-grow glass-effect border border-blue-500/30 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500/50 resize-none text-blue-200 placeholder-blue-400/50"
                    rows={2}
                    disabled={isLoading || listening}
                  />
                ) : (
                  <div className="flex-grow flex items-center justify-between px-4 py-2 glass-effect rounded-xl border border-blue-500/30">
                    <span className="text-blue-400/70">
                      {listening ? (
                        <span className="text-red-400">Recording... Speech will be sent automatically</span>
                      ) : (
                        'Click the microphone to start speaking'
                      )}
                    </span>
                  </div>
                )}

                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl transition-all ${
                    listening
                      ? 'bg-red-500/90 hover:bg-red-600/90 text-white'
                      : 'glass-effect border border-blue-500/30 text-blue-400 hover:border-blue-500/50'
                  }`}
                  title={listening ? 'Stop recording' : 'Start recording'}
                >
                  {listening ? <StopCircle className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                </button>

                {!settings.autoSend && (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!userInput.trim() || isLoading}
                    className={`p-3 rounded-xl transition-all ${
                      !userInput.trim() || isLoading
                        ? 'bg-blue-900/30 text-blue-400/50 cursor-not-allowed'
                        : 'bg-blue-600/90 text-white hover:bg-blue-700/90 hover:scale-105'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </div>
  )
}

export default InterviewPage
