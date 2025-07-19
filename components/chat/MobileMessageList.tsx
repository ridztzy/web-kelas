"use client";

import React, { useRef, useEffect } from 'react';
import { ChatMessage, User } from '@/lib/types';
import MobileMessageBubble from './MobileMessageBubble';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type TypingUser = Pick<User, "id" | "name" | "avatar_url" | "role">;

interface MobileMessageListProps {
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  currentUser: User | null;
  onStartReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onEdit: (message: ChatMessage) => void; 
}

export default function MobileMessageList({ 
  messages, 
  typingUsers, 
  currentUser, 
  onStartReply, 
  onDelete, 
  onEdit 
}: MobileMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
      {messages.map((msg, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showAvatar = !prevMessage || prevMessage.senderId !== msg.senderId;
        const isLastFromSender = index === messages.length - 1 || 
          (index < messages.length - 1 && messages[index + 1].senderId !== msg.senderId);
        
        return (
          <MobileMessageBubble
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderId === currentUser?.id}
            showAvatar={showAvatar}
            isLastFromSender={isLastFromSender}
            onStartReply={onStartReply}
            onDelete={onDelete} 
            onEdit={onEdit} 
          />
        );
      })}

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 px-2">
          <div className="flex -space-x-2">
            {typingUsers.slice(0, 3).map((typingUser) => (
              <Avatar key={typingUser.id} className="w-6 h-6 border-2 border-background">
                <AvatarImage src={typingUser.avatar_url || ''} alt={typingUser.name} />
                <AvatarFallback className="text-xs">
                  {typingUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}