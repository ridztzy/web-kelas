"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { insertMessage, uploadFile, updateMessage } from '@/lib/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, Loader2, Image, FileText, X, Save, Plus } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileMessageInputProps {
  replyingTo: ChatMessage | null;
  setReplyingTo: (message: ChatMessage | null) => void;
  editingMessage: ChatMessage | null;
  setEditingMessage: (message: ChatMessage | null) => void;
}

export default function MobileMessageInput({ 
  replyingTo, 
  setReplyingTo, 
  editingMessage, 
  setEditingMessage 
}: MobileMessageInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const emojis = ["😀", "😂", "😊", "😍", "🤔", "👍", "👎", "❤️", "🔥", "💯", "🎉", "👏", "🙏", "💪", "✨", "🌟"];

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.message || "");
      inputRef.current?.focus();
    } else if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [editingMessage, replyingTo]);

  const handleCancelAction = () => {
    setEditingMessage(null);
    setReplyingTo(null);
    setMessage("");
  };

  const handleSubmit = async () => {
    if (!message.trim() || !user || isProcessing) return;
    setIsProcessing(true);

    try {
      if (editingMessage) {
        await updateMessage(editingMessage.id, {
          message: message.trim(),
          edited: true,
        });
      } else {
        await insertMessage({
          message: message.trim(),
          sender_id: user.id,
          type: "text",
          reply_to: replyingTo ? replyingTo.id : null,
        });
      }
      handleCancelAction();
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = event.target.files?.[0];
    if (!file || !user || isProcessing) return;
    setIsProcessing(true);
    try {
      const fileUrl = await uploadFile(file, user.id);
      await insertMessage({
        message: `📎 ${file.name}`,
        sender_id: user.id,
        type: type,
        file_name: file.name,
        file_size: file.size,
        file_url: fileUrl,
        reply_to: replyingTo ? replyingTo.id : null,
      });
      setReplyingTo(null);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsProcessing(false);
      if (event.target) event.target.value = "";
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };
 
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEditing = editingMessage !== null;

  return (
    <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 safe-area-pb">
      {/* Reply/Edit indicator */}
      {isEditing ? (
        <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-sm flex justify-between items-center">
          <div>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">Mode Edit</p>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-1">{editingMessage.message}</p>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={handleCancelAction}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : replyingTo && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm flex justify-between items-center">
          <div>
            <p className="font-semibold text-blue-600 dark:text-blue-400">Membalas {replyingTo.senderName}</p>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-1">{replyingTo.message}</p>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={handleCancelAction}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="grid grid-cols-8 gap-2">
            {emojis.map((emoji, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                size="sm" 
                onClick={() => addEmoji(emoji)} 
                className="text-lg p-2 h-auto rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}
 
      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full w-10 h-10 flex-shrink-0" 
              disabled={isEditing}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Lampiran</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4 py-6">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-600" />
                )}
                <span className="text-sm">Dokumen</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 rounded-xl"
                onClick={() => imageInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Image className="w-6 h-6 text-green-600" />
                )}
                <span className="text-sm">Gambar</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Message input */}
        <div className="flex-1 relative">
          <Input 
            ref={inputRef} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyPress={handleKeyPress} 
            placeholder="Ketik pesan..." 
            className="rounded-full pr-20 py-3 border-2 focus:border-primary" 
            maxLength={500} 
            disabled={isProcessing} 
          />
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button 
          onClick={handleSubmit} 
          disabled={!message.trim() || isProcessing} 
          size="icon" 
          className={`rounded-full w-12 h-12 flex-shrink-0 shadow-lg ${
            isEditing ? 'bg-green-500 hover:bg-green-600' : ''
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isEditing ? (
            <Save className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileUpload(e, 'file')} 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={imageInputRef} 
        onChange={(e) => handleFileUpload(e, 'image')} 
        className="hidden" 
        accept="image/*" 
      />
    </div>
  );
}