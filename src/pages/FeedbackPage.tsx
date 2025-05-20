import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { Download, CheckCircle, AlertTriangle, HelpCircle, ArrowLeft } from 'lucide-react';

const FeedbackPage: React.FC = () => {
  const { feedback, messages, interview, resetInterview } = useInterview();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!feedback) {
      navigate('/');
    }
  }, [feedback, navigate]);
  
  if (!feedback) {
    return null;
  }
  
  const handleStartNew = () => {
    resetInterview();
    navigate('/');
  };
  
  const handleDownloadTranscript = () => {
    const transcript = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Interviewer'}: ${msg.content}`
    ).join('\n\n');
    
    const fullText = `
Interview Transcript
-------------------
Date: ${new Date(interview.createdAt).toLocaleDateString()}

${transcript}

Feedback
-------------------
${feedback.overallFeedback}

Strengths:
${feedback.strengths.map(s => `- ${s}`).join('\n')}

Areas for Improvement:
${feedback.areasForImprovement.map(a => `- ${a}`).join('\n')}

Overall Score: ${feedback.score}/10
`;
    
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-feedback-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleStartNew}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> 
            Start New Interview
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Your Interview Feedback</h1>
            <p className="text-blue-100">
              Completed on {new Date(interview.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Overall Impression</h2>
              <p className="text-gray-700 whitespace-pre-line">{feedback.overallFeedback}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700 flex">
                      <span className="mr-2">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {feedback.areasForImprovement.map((area, index) => (
                    <li key={index} className="text-gray-700 flex">
                      <span className="mr-2">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Question-by-Question Analysis</h2>
              <div className="space-y-4">
                {feedback.questionAnalysis && feedback.questionAnalysis.map((analysis, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                      <p className="text-gray-900 font-medium">{analysis.question}</p>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-500">Your Answer</span>
                      <p className="text-gray-700">{analysis.answer}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Feedback</span>
                      <p className="text-gray-700">{analysis.feedback}</p>
                    </div>
                  </div>
                ))}
                
                {!feedback.questionAnalysis && (
                  <div className="flex items-center justify-center py-6 text-gray-500">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    <span>Question analysis not available</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
                  <p className="text-gray-600">Based on your interview performance</p>
                </div>
                <div className="text-4xl font-bold text-blue-600">{feedback.score}/10</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleDownloadTranscript}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Interview Transcript
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;