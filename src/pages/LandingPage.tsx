import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import { Upload, FileText, Briefcase } from 'lucide-react'
import { uploadResume, uploadJobDescription } from '../services/uploadService'
import toast from 'react-hot-toast'

const LandingPage: React.FC = () => {
  const { setResumeData, setJobDescriptionData, startNewInterview } = useInterview()
  const navigate = useNavigate()

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescFile, setJobDescFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const handleJobDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJobDescFile(e.target.files[0])
    }
  }

  const handleStartInterview = async () => {
    if (!resumeFile || !jobDescFile) {
      toast.error('Please upload both resume and job description')
      return
    }

    setIsLoading(true)

    try {
      const resumeData = await uploadResume(resumeFile)
      const jobDescData = await uploadJobDescription(jobDescFile)

      setResumeData(resumeData)
      setJobDescriptionData(jobDescData)

      await startNewInterview(resumeData, jobDescData)

      navigate('/interview')
    } catch (error) {
      console.error('Error starting interview:', error)
      toast.error('Failed to start interview. Please try again.')
    } finally {
      setIsLoading(false)
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

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-5xl text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-6">
            AI-Powered Interview Practice
          </h1>
          <p className="text-xl text-blue-100">
            Upload your resume and job description to start a personalized interview with our AI interviewer.
          </p>
        </div>

        <div className="max-w-2xl mx-auto glass-effect rounded-2xl p-8 mb-12">
          <div className="space-y-6">
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">Upload Your Resume</label>
              <div className="border-2 border-dashed border-blue-400/30 rounded-xl p-6 text-center hover:border-blue-400/50 transition-colors cursor-pointer bg-white/5">
                <input
                  type="file"
                  id="resume"
                  onChange={handleResumeChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor="resume" className="cursor-pointer">
                  {resumeFile ? (
                    <div className="flex items-center justify-center space-x-2 text-blue-200">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <span>{resumeFile.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-blue-400 mx-auto" />
                      <p className="text-sm text-blue-200">Click to upload or drag and drop</p>
                      <p className="text-xs text-blue-300/70">PDF, DOC, or DOCX (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">Upload Job Description</label>
              <div className="border-2 border-dashed border-blue-400/30 rounded-xl p-6 text-center hover:border-blue-400/50 transition-colors cursor-pointer bg-white/5">
                <input
                  type="file"
                  id="jobDesc"
                  onChange={handleJobDescChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <label htmlFor="jobDesc" className="cursor-pointer">
                  {jobDescFile ? (
                    <div className="flex items-center justify-center space-x-2 text-blue-200">
                      <Briefcase className="h-5 w-5 text-blue-400" />
                      <span>{jobDescFile.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-blue-400 mx-auto" />
                      <p className="text-sm text-blue-200">Click to upload or drag and drop</p>
                      <p className="text-xs text-blue-300/70">PDF, DOC, DOCX, or TXT (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleStartInterview}
                disabled={!resumeFile || !jobDescFile || isLoading}
                className={`w-full py-4 px-6 rounded-xl font-medium transition-all transform hover:scale-[1.02] ${
                  resumeFile && jobDescFile && !isLoading
                    ? 'btn-primary'
                    : 'bg-gray-700/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Preparing Interview...' : 'Start Interview'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="text-blue-400 font-semibold mb-2">Step 1</div>
            <h3 className="text-lg font-medium text-white mb-2">Upload Documents</h3>
            <p className="text-blue-200">Upload your resume and the job description you're applying for.</p>
          </div>
          <div className="card p-6">
            <div className="text-blue-400 font-semibold mb-2">Step 2</div>
            <h3 className="text-lg font-medium text-white mb-2">Complete Interview</h3>
            <p className="text-blue-200">Answer questions from our AI interviewer based on your documents.</p>
          </div>
          <div className="card p-6">
            <div className="text-blue-400 font-semibold mb-2">Step 3</div>
            <h3 className="text-lg font-medium text-white mb-2">Get Feedback</h3>
            <p className="text-blue-200">
              Receive detailed feedback on your responses to improve your interview skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
