import React, { useState } from 'react';
import { MessageType } from '../types';
import { User, Bot, Play, Pause } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      utterance.onstart = () => setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech is not supported in your browser');
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speak(message.content);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
          isUser ? 'bg-blue-100 ml-3' : 'bg-gray-100 mr-3'
        }`}>
          {isUser ? (
            <User className="h-5 w-5 text-blue-600" />
          ) : (
            <Bot className="h-5 w-5 text-gray-600" />
          )}
        </div>
        
        <div className={`relative px-4 py-3 rounded-lg ${
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="flex items-start space-x-2">
            <p className="whitespace-pre-wrap flex-grow">{message.content}</p>
            {!isUser && (
              <button
                onClick={togglePlay}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
                title={isPlaying ? "Stop speaking" : "Play message"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;