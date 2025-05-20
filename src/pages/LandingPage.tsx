import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { Upload, FileText, Briefcase } from 'lucide-react';
import { uploadResume, uploadJobDescription } from '../services/uploadService';
import toast from 'react-hot-toast';

const LandingPage: React.FC = () => {
  const { setResumeData, setJobDescriptionData, startNewInterview } = useInterview();
  const navigate = useNavigate();
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleJobDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJobDescFile(e.target.files[0]);
    }
  };

  const handleStartInterview = async () => {
    if (!resumeFile || !jobDescFile) {
      toast.error('Please upload both resume and job description');
      return;
    }

    setIsLoading(true);
    
    try {
      // Upload files and get their data
      const resumeData = await uploadResume(resumeFile);
      const jobDescData = await uploadJobDescription(jobDescFile);
      
      // Set the data in context
      setResumeData(resumeData);
      setJobDescriptionData(jobDescData);
      
      // Initialize new interview
      await startNewInterview(resumeData, jobDescData);
      
      // Navigate to interview page
      navigate('/interview');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Interview Practice
        </h1>
        <p className="text-xl text-gray-600">
          Upload your resume and job description to start a personalized interview with our AI interviewer.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Upload Your Resume
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="file"
                id="resume"
                onChange={handleResumeChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
              <label htmlFor="resume" className="cursor-pointer">
                {resumeFile ? (
                  <div className="flex items-center justify-center space-x-2 text-gray-700">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>{resumeFile.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOC, or DOCX (Max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Upload Job Description
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="file"
                id="jobDesc"
                onChange={handleJobDescChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <label htmlFor="jobDesc" className="cursor-pointer">
                {jobDescFile ? (
                  <div className="flex items-center justify-center space-x-2 text-gray-700">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <span>{jobDescFile.name}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOC, DOCX, or TXT (Max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleStartInterview}
              disabled={!resumeFile || !jobDescFile || isLoading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                resumeFile && jobDescFile && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {isLoading ? 'Preparing Interview...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-blue-600 font-semibold mb-2">Step 1</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 text-sm">
            Upload your resume and the job description you're applying for.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-blue-600 font-semibold mb-2">Step 2</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Interview</h3>
          <p className="text-gray-600 text-sm">
            Answer questions from our AI interviewer based on your documents.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-blue-600 font-semibold mb-2">Step 3</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Get Feedback</h3>
          <p className="text-gray-600 text-sm">
            Receive detailed feedback on your responses to improve your interview skills.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;