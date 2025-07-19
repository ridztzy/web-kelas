"use client";

import { useState } from 'react';
import { ChatMessage } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCircle, FileText, Image, Download, Clock, Check, CheckCheck, Reply, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileMessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  showAvatar: boolean;
  isLastFromSender: boolean;
  onStartReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onEdit: (message: ChatMessage) => void;
}

export default function MobileMessageBubble({ 
  message, 
  isCurrentUser, 
  showAvatar, 
  isLastFromSender,
  onStartReply, 
  onDelete, 
  onEdit 
}: MobileMessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "ketua_kelas": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "sekretaris": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "ketua_kelas": return "Ketua Kelas";
      case "sekretaris": return "Sekretaris";
      default: return "Mahasiswa";
    }
  };

  const getMessageStatus = (status?: string) => {
    switch (status) {
      case "sent": return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered": return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read": return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} px-2`}>
      <div className={`max-w-[85%] flex ${isCurrentUser ? "flex-row-reverse" : ""} items-end space-x-2`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {showAvatar && !isCurrentUser ? (
            message.senderAvatar ? (
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                <AvatarFallback>{message.senderName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            ) : (
              <UserCircle className="w-8 h-8 text-primary" />
            )
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} space-y-1`}>
          {/* Sender info */}
          {showAvatar && !isCurrentUser && (
            <div className="flex items-center space-x-2 px-2">
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {message.senderName}
              </span>
              <Badge variant="outline" className={`${getRoleColor(message.senderRole)} text-xs`}>
                {getRoleText(message.senderRole)}
              </Badge>
            </div>
          )}
          
          {/* Message bubble */}
          <div className="relative group">
            <div 
              className={`rounded-2xl p-3 max-w-xs shadow-sm ${
                isCurrentUser 
                  ? "bg-primary text-primary-foreground rounded-br-md" 
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Reply indicator */}
              {message.reply_to && message.replied_message && (
                <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Membalas {message.replied_message.senderName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 break-words line-clamp-1">
                    {message.replied_message.message}
                  </p>
                </div>
              )}

              {/* Message content */}
              {message.type === 'file' ? (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="break-words text-sm">{message.fileName}</p>
                    <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
                  </div>
                  {message.fileUrl && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="p-1 h-auto" 
                      onClick={() => window.open(message.fileUrl, '_blank')}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ) : message.type === 'image' ? (
                <div className="space-y-2">
                  {message.fileUrl && (
                    <img 
                      src={message.fileUrl} 
                      alt={message.fileName || "image"} 
                      className="max-w-full h-auto rounded-lg cursor-pointer" 
                      onClick={() => window.open(message.fileUrl, '_blank')} 
                    />
                  )}
                  <div className="flex items-center space-x-2">
                    <Image className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="break-words text-sm">{message.fileName}</p>
                      <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="break-words text-sm">
                  {message.message}
                  {message.edited && (
                    <span className="text-xs opacity-70 ml-1">(diedit)</span>
                  )}
                </div>
              )}
            </div>

            {/* Message actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onStartReply(message)}>
                  <Reply className="w-4 h-4 mr-2" />
                  Balas
                </DropdownMenuItem>
                {isCurrentUser && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(message)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Message time and status */}
          <div className={`flex items-center space-x-1 px-2 ${isCurrentUser ? "flex-row-reverse space-x-reverse" : ""}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString("id-ID", { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </span>
            {isCurrentUser && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getMessageStatus(message.status)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}