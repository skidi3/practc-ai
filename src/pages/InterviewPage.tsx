import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff, Loader } from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { sendMessage, endInterview } from '../services/interviewService';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import toast from 'react-hot-toast';
import ChatMessage from '../components/ChatMessage';

const InterviewPage: React.FC = () => {
  const { 
    interview, 
    messages, 
    addMessage, 
    setFeedback,
    isInterviewActive
  } = useInterview();
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!isInterviewActive) {
      navigate('/');
    } else if (messages.length === 0) {
      handleInitialQuestion();
    }
  }, [isInterviewActive, navigate, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!listening && transcript) {
      setUserInput(transcript);
      resetTranscript();
    }
  }, [listening, transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInitialQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await sendMessage(interview.id, '', true);
      addMessage({
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: response.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting initial question:', error);
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMessage);
    setUserInput('');
    setIsLoading(true);
    
    try {
      const response = await sendMessage(interview.id, userInput);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.message,
        timestamp: new Date().toISOString()
      };
      
      addMessage(aiMessage);

      // Automatically play AI response
      const utterance = new SpeechSynthesisUtterance(response.message);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    setIsEndingInterview(true);
    try {
      const response = await endInterview(interview.id);
      setFeedback(response.feedback);
      navigate('/feedback');
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Failed to end interview. Please try again.');
    } finally {
      setIsEndingInterview(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = async () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    if (!listening) {
      try {
        resetTranscript();
        await SpeechRecognition.startListening({ continuous: true });
        toast.success('Recording started! Speak now...');
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast.error('Failed to start recording. Please check microphone permissions.');
      }
    } else {
      SpeechRecognition.stopListening();
      toast.success('Recording stopped! Your response is ready to send.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-white rounded-lg shadow-md flex flex-col flex-grow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Interview Session</h2>
            <p className="text-sm text-gray-500">Answer the questions naturally - you can type or speak</p>
          </div>
          <button
            onClick={handleEndInterview}
            disabled={isEndingInterview || messages.length < 2}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isEndingInterview || messages.length < 2
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            } transition-colors`}
          >
            {isEndingInterview ? 'Generating Feedback...' : 'End Interview'}
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader className="h-5 w-5 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="relative">
            {/* Live transcript display */}
            {listening && (
              <div className="absolute bottom-full left-0 right-0 mb-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-600">Recording...</span>
                </div>
                <p className="text-sm text-gray-700">
                  {transcript || 'Listening... Start speaking'}
                </p>
              </div>
            )}
            
            <div className="flex space-x-2">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer or click the microphone to speak..."
                className="flex-grow border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                disabled={isLoading || listening}
              />
              
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-md transition-colors ${
                  listening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                }`}
                title={listening ? "Stop recording" : "Start recording"}
              >
                {listening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
                className={`p-3 rounded-md ${
                  !userInput.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;