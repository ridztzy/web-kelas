"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { insertMessage, uploadFile, updateMessage } from '@/lib/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, Loader2, Image, FileText, X, Save } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

interface MessageInputProps {
  replyingTo: ChatMessage | null;
  setReplyingTo: (message: ChatMessage | null) => void;
  editingMessage: ChatMessage | null;
  setEditingMessage: (message: ChatMessage | null) => void;
}

export default function MessageInput({ replyingTo, setReplyingTo, editingMessage, setEditingMessage }: MessageInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentMenu, setAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const emojis = ["😀", "😂", "😊", "😍", "🤔", "👍", "👎", "❤️", "🔥", "💯"];

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
        setAttachmentMenu(false);
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
    <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-gray-800">
      {isEditing ? (
        <div className="mb-2 p-2 pr-1 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-sm flex justify-between items-center">
          <div>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">Mode Edit</p>
            <p className="text-muted-foreground line-clamp-1">{editingMessage.message}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={handleCancelAction}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : replyingTo && (
        <div className="mb-2 p-2 pr-1 bg-gray-100 dark:bg-gray-900/50 rounded-lg text-sm flex justify-between items-center">
          <div>
            <p className="font-semibold text-blue-500">Membalas {replyingTo.senderName}</p>
            <p className="text-muted-foreground line-clamp-1">{replyingTo.message}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={handleCancelAction}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

       {showEmojiPicker && (
         <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-wrap gap-2">
           {emojis.map((emoji, index) => <Button key={index} variant="ghost" size="sm" onClick={() => addEmoji(emoji)} className="text-lg p-1 h-auto">{emoji}</Button>)}
         </div>
       )}
       {attachmentMenu && (
         <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex space-x-2">
           <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="flex items-center space-x-1">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}<span>Dokumen</span></Button>
           <Button variant="ghost" size="sm" onClick={() => imageInputRef.current?.click()} disabled={isProcessing} className="flex items-center space-x-1">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}<span>Gambar</span></Button>
         </div>
       )}
 
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setAttachmentMenu(!attachmentMenu)} className="h-10 w-10 rounded-full" disabled={isEditing}><Paperclip className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="h-10 w-10 rounded-full"><Smile className="w-5 h-5" /></Button>
        </div>
        <div className="flex-1 relative">
          <Input ref={inputRef} id="message-input" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ketik pesan..." className="min-h-[40px] py-2 px-3 rounded-full" maxLength={500} disabled={isProcessing} />
        </div>
        <Button onClick={handleSubmit} disabled={!message.trim() || isProcessing} size="icon" className={`h-10 w-10 rounded-full ${isEditing ? 'bg-green-500 hover:bg-green-600' : ''}`}>
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? <Save className="w-5 h-5" /> : <Send className="w-5 h-5" />)}
        </Button>
      </div>

      <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'file')} className="hidden" />
      <input type="file" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'image')} className="hidden" accept="image/*" />
    </div>
  );
}
