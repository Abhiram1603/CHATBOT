import React, { useRef, useEffect } from 'react';
import { Message, User } from '../../types';
import ChatMessage from './ChatMessage';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isSearchEnabled?: boolean;
  currentUser: User;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, isSearchEnabled, currentUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg, index) => (
        <ChatMessage 
          key={msg.id} 
          message={msg}
          isLoading={isLoading && index === messages.length - 1}
          isSearchEnabled={isSearchEnabled}
          currentUser={currentUser}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
