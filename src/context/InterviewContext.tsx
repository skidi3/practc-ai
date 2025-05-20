import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InterviewType, MessageType, FeedbackType, ResumeData, JobDescriptionData } from '../types';
import { startInterview as startInterviewAPI } from '../services/interviewService';
import toast from 'react-hot-toast';

interface InterviewContextType {
  interview: InterviewType;
  messages: MessageType[];
  feedback: FeedbackType | null;
  resumeData: ResumeData | null;
  jobDescriptionData: JobDescriptionData | null;
  isInterviewActive: boolean;
  setResumeData: (data: ResumeData) => void;
  setJobDescriptionData: (data: JobDescriptionData) => void;
  startNewInterview: (resumeData: ResumeData, jobDescData: JobDescriptionData) => Promise<void>;
  addMessage: (message: MessageType) => void;
  setFeedback: (feedback: FeedbackType) => void;
  resetInterview: () => void;
}

const defaultInterview: InterviewType = {
  id: '',
  userId: '',
  resumeId: '',
  jobDescriptionId: '',
  status: 'pending',
  createdAt: '',
  updatedAt: ''
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [interview, setInterview] = useState<InterviewType>(defaultInterview);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [feedback, setFeedbackState] = useState<FeedbackType | null>(null);
  const [resumeData, setResumeDataState] = useState<ResumeData | null>(null);
  const [jobDescriptionData, setJobDescriptionDataState] = useState<JobDescriptionData | null>(null);

  const isInterviewActive = interview.id !== '';

  const setResumeData = (data: ResumeData) => {
    setResumeDataState(data);
  };

  const setJobDescriptionData = (data: JobDescriptionData) => {
    setJobDescriptionDataState(data);
  };

  const startNewInterview = async (resumeData: ResumeData, jobDescData: JobDescriptionData) => {
    try {
      const response = await startInterviewAPI(resumeData.id, jobDescData.id);
      
      const newInterview: InterviewType = {
        id: response.id,
        userId: 'user-1', // This should come from auth context in a real app
        resumeId: resumeData.id,
        jobDescriptionId: jobDescData.id,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setInterview(newInterview);
      setMessages([]);
      setFeedbackState(null);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview. Please try again.');
      throw error;
    }
  };

  const addMessage = (message: MessageType) => {
    setMessages(prev => [...prev, message]);
  };

  const setFeedback = (newFeedback: FeedbackType) => {
    setFeedbackState(newFeedback);
    setInterview(prev => ({ ...prev, status: 'completed' }));
  };

  const resetInterview = () => {
    setInterview(defaultInterview);
    setMessages([]);
    setFeedbackState(null);
  };

  return (
    <InterviewContext.Provider
      value={{
        interview,
        messages,
        feedback,
        resumeData,
        jobDescriptionData,
        isInterviewActive,
        setResumeData,
        setJobDescriptionData,
        startNewInterview,
        addMessage,
        setFeedback,
        resetInterview
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = (): InterviewContextType => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};