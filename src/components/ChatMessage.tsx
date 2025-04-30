
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import AudioPlayer from './AudioPlayer';
import { Avatar } from '@/components/ui/avatar';

interface ChatMessageProps {
  message: ChatMessageType;
  avatarUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, avatarUrl }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 flex-shrink-0">
          <Avatar className="w-8 h-8 border border-chatbot-border">
            <img 
              src={avatarUrl || "https://ui-avatars.com/api/?name=AI&background=2A2A2A&color=fff"} 
              alt="AI" 
              className="w-full h-full object-cover" 
            />
          </Avatar>
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div 
          className={`p-3 rounded-2xl ${
            isUser 
              ? 'bg-chatbot-message-user text-white rounded-tr-none'
              : 'bg-chatbot-message-bot text-white rounded-tl-none'
          }`}
        >
          {message.content}
        </div>
        
        {message.audioUrl && message.role === 'assistant' && (
          <div className="mt-2">
            <AudioPlayer audioUrl={message.audioUrl} />
          </div>
        )}
        
        <div className="text-xs text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      {isUser && (
        <div className="ml-2 flex-shrink-0">
          <Avatar className="w-8 h-8 border border-chatbot-border">
            <img 
              src="https://ui-avatars.com/api/?name=User&background=0AB0CC&color=fff" 
              alt="User" 
              className="w-full h-full object-cover" 
            />
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
