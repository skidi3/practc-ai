import axios from 'axios';
import { FeedbackType } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

export const sendMessage = async (
  interviewId: string, 
  message: string,
  isFirstMessage: boolean = false
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/api/interviews/${interviewId}/messages`, {
      message,
      isFirstMessage
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};

export const endInterview = async (interviewId: string): Promise<{ feedback: FeedbackType }> => {
  try {
    const response = await axios.post(`${API_URL}/api/interviews/${interviewId}/end`);
    return response.data;
  } catch (error) {
    console.error('Error ending interview:', error);
    throw new Error('Failed to end interview');
  }
};

export const startInterview = async (resumeId: string, jobDescriptionId: string): Promise<{ id: string }> => {
  try {
    const response = await axios.post(`${API_URL}/api/interviews`, {
      resumeId,
      jobDescriptionId
    });
    return response.data;
  } catch (error) {
    console.error('Error starting interview:', error);
    throw new Error('Failed to start interview');
  }
};