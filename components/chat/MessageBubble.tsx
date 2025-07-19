"use client";

import { useState } from 'react';
import { ChatMessage } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCircle, FileText, Image, Download, Clock, Check, CheckCheck, Reply, Pencil, Trash2 } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  onStartReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onEdit: (message: ChatMessage) => void;
}

export default function MessageBubble({ message, isCurrentUser, onStartReply, onDelete, onEdit }: MessageBubbleProps) {
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

  const handleActionClick = (action: () => void) => {
    action();
    setShowActions(false);
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} px-2`}>
      <div className={`max-w-[85%] sm:max-w-sm flex ${isCurrentUser ? "flex-row-reverse" : ""}`}>
        <div className="flex-shrink-0 pt-1">
          {message.senderAvatar ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={message.senderAvatar} alt={message.senderName} />
              <AvatarFallback>{message.senderName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          ) : (
            <UserCircle className="w-8 h-8 text-primary" />
          )}
        </div>

        <div className={`mx-2 flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{isCurrentUser ? "Anda" : message.senderName}</span>
            <Badge variant="outline" className={`${getRoleColor(message.senderRole)} text-xs`}>
              {getRoleText(message.senderRole)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          
          <div className="relative flex items-center">
            {isCurrentUser && (
              <div className={`relative transition-all duration-200 ease-in-out flex items-center mr-2 ${showActions ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleActionClick(() => onDelete(message.id))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleActionClick(() => onEdit(message))}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleActionClick(() => onStartReply(message))}><Reply className="w-4 h-4" /></Button>
              </div>
            )}

            <div 
              onClick={() => setShowActions(!showActions)}
              className={`cursor-pointer relative rounded-xl p-3 text-base ${isCurrentUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white dark:bg-gray-800 rounded-tl-none shadow-sm"}`}
            >
              {message.reply_to && message.replied_message && (
                <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Membalas {message.replied_message.senderName}</p>
                  <p className="text-sm text-muted-foreground break-words line-clamp-1">{message.replied_message.message}</p>
                </div>
              )}

              {message.type === 'file' ? (
                <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="break-words">{message.fileName}</p>
                        <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
                    </div>
                    {message.fileUrl && <Button size="sm" variant="ghost" className="p-1 h-auto" onClick={() => window.open(message.fileUrl, '_blank')}><Download className="w-3 h-3" /></Button>}
                </div>
              ) : message.type === 'image' ? (
                <div className="space-y-2">
                    {message.fileUrl && <img src={message.fileUrl} alt={message.fileName || "image"} className="max-w-full h-auto rounded cursor-pointer" onClick={() => window.open(message.fileUrl, '_blank')} />}
                    <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="break-words">{message.fileName}</p>
                            <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
                        </div>
                    </div>
                </div>
              ) : (
                <div className="break-words">
                    {message.message}
                    {message.edited && <span className="text-xs opacity-70 ml-1">(diedit)</span>}
                </div>
              )}
            </div>

            {!isCurrentUser && (
              <div className={`relative transition-all duration-200 ease-in-out flex items-center ml-2 ${showActions ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleActionClick(() => onStartReply(message))}><Reply className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
          {isCurrentUser && <div className="mt-1 text-xs text-muted-foreground">{getMessageStatus(message.status)}</div>}
        </div>
      </div>
    </div>
  );
}
