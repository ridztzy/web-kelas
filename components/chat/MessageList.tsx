"use client";

import React, { useRef, useEffect } from 'react';
import { ChatMessage, User } from '@/lib/types';
import MessageBubble from './MessageBubble';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TypingUser = Pick<User, "id" | "name" | "avatar_url" | "role">;

// 1. Perbarui Interface
interface MessageListProps {
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  currentUser: User | null;
  onStartReply: (message: ChatMessage) => void;
    onDelete: (messageId: string) => void;
  onEdit: (message: ChatMessage) => void; 
}

// 2. Terima Prop
export default function MessageList({ messages, typingUsers, currentUser, onStartReply, onDelete, onEdit }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        // 3. Teruskan Prop
        <MessageBubble
          key={msg.id}
          message={msg}
          isCurrentUser={msg.senderId === currentUser?.id}
          onStartReply={onStartReply}
          onDelete={onDelete} 
          onEdit={onEdit} 
        />
      ))}

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
          <div className="flex -space-x-2">
            <TooltipProvider>
              {typingUsers.slice(0, 3).map((typingUser) => (
                <Tooltip key={typingUser.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={typingUser.avatar_url || ''} alt={typingUser.name} />
                      <AvatarFallback className="text-xs">
                        {typingUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{typingUser.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
          <span className="animate-pulse">
            {typingUsers.length === 1
              ? `${typingUsers[0].name} sedang mengetik...`
              : `${typingUsers.length} orang sedang mengetik...`}
          </span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}