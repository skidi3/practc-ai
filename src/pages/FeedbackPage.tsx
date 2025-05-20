import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import {
  Download,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  Lightbulb,
  Target,
  MessageSquare
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

const FeedbackPage: React.FC = () => {
  const { feedback, messages, interview, resetInterview } = useInterview()
  const navigate = useNavigate()

  useEffect(() => {
    if (!feedback) {
      navigate('/')
    }
  }, [feedback, navigate])

  if (!feedback) {
    return null
  }

  // Calculate metrics
  const totalMessages = messages.length
  const userMessages = messages.filter((m) => m.role === 'user').length
  const avgResponseLength =
    messages.filter((m) => m.role === 'user').reduce((acc, msg) => acc + msg.content.length, 0) / userMessages

  // Prepare data for charts
  const skillsData = [
    { subject: 'Technical Knowledge', value: feedback.strengths.length },
    { subject: 'Communication', value: avgResponseLength > 100 ? 90 : 70 },
    {
      subject: 'Problem Solving',
      value: feedback.strengths.filter((s) => s.toLowerCase().includes('problem')).length * 20 + 60
    },
    {
      subject: 'Experience',
      value: feedback.strengths.filter((s) => s.toLowerCase().includes('experience')).length * 20 + 70
    },
    {
      subject: 'Cultural Fit',
      value: feedback.strengths.filter((s) => s.toLowerCase().includes('culture')).length * 20 + 75
    }
  ]

  const responseTimeData = messages
    .filter((m) => m.role === 'user')
    .map((msg, index) => ({
      question: `Q${index + 1}`,
      time: Math.random() * 30 + 60 // Simulated response time
    }))

  const handleStartNew = () => {
    resetInterview()
    navigate('/')
  }

  const handleDownloadTranscript = () => {
    const transcript = messages
      .map((msg) => `${msg.role === 'user' ? 'You' : 'Interviewer'}: ${msg.content}`)
      .join('\n\n')

    const fullText = `
Interview Transcript
-------------------
Date: ${new Date(interview.createdAt).toLocaleDateString()}

${transcript}

Feedback Summary
-------------------
${feedback.overallFeedback}

Key Strengths:
${feedback.strengths.map((s) => `- ${s}`).join('\n')}

Areas for Development:
${feedback.areasForImprovement.map((a) => `- ${a}`).join('\n')}
`

    const blob = new Blob([fullText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-feedback-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] relative">
      {/* Wave Background */}
      <div className="wave-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={handleStartNew}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Start New Interview
            </button>
          </div>

          <div className="glass-effect rounded-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-br from-blue-600/90 to-blue-800/90 px-6 py-6">
              <h1 className="text-3xl font-bold text-white mb-2">Interview Insights</h1>
              <p className="text-blue-200">Completed on {new Date(interview.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6 p-6">
              <div className="glass-effect rounded-xl p-4 flex items-center border border-blue-500/20">
                <div className="p-3 bg-blue-900/30 rounded-lg mr-4">
                  <MessageSquare className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-400">Questions Answered</h3>
                  <p className="text-2xl font-bold text-white">{userMessages}</p>
                </div>
              </div>
              <div className="glass-effect rounded-xl p-4 flex items-center border border-blue-500/20">
                <div className="p-3 bg-blue-900/30 rounded-lg mr-4">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-400">Avg Response Length</h3>
                  <p className="text-2xl font-bold text-white">{Math.round(avgResponseLength)} chars</p>
                </div>
              </div>
              <div className="glass-effect rounded-xl p-4 flex items-center border border-blue-500/20">
                <div className="p-3 bg-blue-900/30 rounded-lg mr-4">
                  <Lightbulb className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-400">Key Strengths</h3>
                  <p className="text-2xl font-bold text-white">{feedback.strengths.length}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="glass-effect p-4 rounded-xl border border-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">Skills Analysis</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillsData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94A3B8" />
                      <Radar name="Skills" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-effect p-4 rounded-xl border border-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">Response Time Trend</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="question" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '8px',
                          color: '#E2E8F0'
                        }}
                      />
                      <Area type="monotone" dataKey="time" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-300 mb-3">Overall Assessment</h2>
                <p className="text-blue-100 whitespace-pre-line">{feedback.overallFeedback}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="glass-effect p-6 rounded-xl border border-blue-500/20">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-300">Key Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="h-2 w-2 mt-2 mr-2 bg-blue-400 rounded-full"></span>
                        <span className="text-blue-100">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-effect p-6 rounded-xl border border-blue-500/20">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-300">Areas for Development</h3>
                  </div>
                  <ul className="space-y-3">
                    {feedback.areasForImprovement.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <span className="h-2 w-2 mt-2 mr-2 bg-blue-400 rounded-full"></span>
                        <span className="text-blue-100">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-blue-300 mb-4">Response Analysis</h2>
                <div className="space-y-4">
                  {feedback.questionAnalysis &&
                    feedback.questionAnalysis.map((analysis, index) => (
                      <div key={index} className="glass-effect rounded-xl p-6 border border-blue-500/20">
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-400">Question {index + 1}</span>
                          <p className="text-white font-medium mt-1">{analysis.question}</p>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-400">Your Answer</span>
                          <p className="text-blue-100 mt-1">{analysis.answer}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-blue-400">Analysis</span>
                          <p className="text-blue-100 mt-1">{analysis.feedback}</p>
                        </div>
                      </div>
                    ))}

                  {!feedback.questionAnalysis && (
                    <div className="flex items-center justify-center py-8 text-blue-400 glass-effect rounded-xl">
                      <HelpCircle className="h-6 w-6 mr-2" />
                      <span>Detailed analysis not available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleDownloadTranscript}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/90 to-blue-800/90 text-white rounded-xl hover:from-blue-700/90 hover:to-blue-900/90 transition-all transform hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Interview Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPage
