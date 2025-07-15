"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage, User } from "@/lib/types";
import {
  fetchMessages,
  insertMessage,
  subscribeToMessages,
  uploadFile,
} from "@/lib/messages";
import { supabase } from "@/lib/supabase";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  UserCircle,
  MessageSquare,
  Users,
  Search,
  Menu,
  X,
  Image,
  FileText,
  Download,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Reply,
} from "lucide-react";

// Define types for typing indicators and online members
type TypingUser = Pick<User, "id" | "name" | "avatar_url" | "role">;

type OnlineMember = {
  id: string;
  name: string;
  role: string;
  status: "online" | "away" | "offline";
  avatar_url?: string;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentMenu, setAttachmentMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages and setup subscriptions
  useEffect(() => {
    let messageChannel: any;
    let typingChannel: any;

    const loadData = async () => {
      try {
        const fetchedMessages = await fetchMessages();
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Setup message subscriptions
    messageChannel = subscribeToMessages(
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      },
      (updatedMessage) =>
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        ),
      (deletedId) =>
        setMessages((prev) => prev.filter((msg) => msg.id !== deletedId))
    );

    // Setup typing indicators channel
    if (user) {
      typingChannel = supabase.channel("chat-typing-indicators");

      typingChannel
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (payload.id !== user.id) {
            setTypingUsers((currentTypers) => {
              // Add user if not already in the list
              if (!currentTypers.some((u) => u.id === payload.id)) {
                return [...currentTypers, payload];
              }
              return currentTypers;
            });

            // Clear existing timeout if any
            if (typingTimeoutRef.current.has(payload.id)) {
              clearTimeout(typingTimeoutRef.current.get(payload.id));
            }

            // Set new timeout to remove user after 3 seconds
            const newTimeout = setTimeout(() => {
              setTypingUsers((currentTypers) =>
                currentTypers.filter((u) => u.id !== payload.id)
              );
              typingTimeoutRef.current.delete(payload.id);
            }, 3000);

            typingTimeoutRef.current.set(payload.id, newTimeout);
          }
        })
        .subscribe();
    }

    return () => {
      if (messageChannel) messageChannel.unsubscribe();
      if (typingChannel) supabase.removeChannel(typingChannel);
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [user]);

  // Broadcast typing event when user is typing
  useEffect(() => {
    if (!user) return;

    let typingChannel: any;
    const debounceTimer = setTimeout(() => {
      if (message.length > 0) {
        typingChannel = supabase.channel("chat-typing-indicators");
        typingChannel.send({
          type: "broadcast",
          event: "typing",
          payload: { 
            id: user.id, 
            name: user.name, 
            avatar_url: user.avatar_url,
            role: user.role 
          },
        });
      }
    }, 500); // Debounce to prevent too many events

    return () => {
      clearTimeout(debounceTimer);
      if (typingChannel) supabase.removeChannel(typingChannel);
    };
  }, [message, user]);

  const handleStartReply = (message: ChatMessage) => {
    setReplyingTo(message);
    const input = document.getElementById('message-input');
    if (input) input.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || sendingMessage) return;

    setSendingMessage(true);
    try {
      await insertMessage({
        message: message.trim(),
        sender_id: user.id,
        type: "text",
        reply_to: replyingTo ? replyingTo.id : null,
      });
      setMessage("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || uploadingFile) return;

    setUploadingFile(true);
    try {
      const fileUrl = await uploadFile(file, user.id);

      await insertMessage({
        message: `📎 ${file.name}`,
        sender_id: user.id,
        type: "file",
        file_name: file.name,
        file_size: file.size,
        file_url: fileUrl,
        reply_to: replyingTo ? replyingTo.id : null,
      });

      setAttachmentMenu(false);
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || uploadingFile) return;

    setUploadingFile(true);
    try {
      const fileUrl = await uploadFile(file, user.id);

      await insertMessage({
        message: `🖼️ ${file.name}`,
        sender_id: user.id,
        type: "image",
        file_name: file.name,
        file_size: file.size,
        file_url: fileUrl,
        reply_to: replyingTo ? replyingTo.id : null,
      });

      setAttachmentMenu(false);
      setReplyingTo(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "ketua_kelas":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "sekretaris":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "ketua_kelas":
        return "Ketua Kelas";
      case "sekretaris":
        return "Sekretaris";
      default:
        return "Mahasiswa";
    }
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.senderName && msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sample online members data - in a real app, this would come from your backend
  const onlineMembers: OnlineMember[] = [
    { id: "1", name: "Ahmad Rizki", role: "admin", status: "online" },
    { id: "2", name: "Siti Nurhaliza", role: "ketua_kelas", status: "online" },
    { id: "3", name: "Budi Santoso", role: "sekretaris", status: "away" },
    { id: "4", name: "Dewi Sartika", role: "mahasiswa", status: "online" },
    { id: "5", name: "Rina Wati", role: "mahasiswa", status: "online" },
    { id: "6", name: "Fajar Nugraha", role: "mahasiswa", status: "offline" },
  ];

  const emojis = ["😀", "😂", "😊", "😍", "🤔", "👍", "👎", "❤️", "🔥", "💯"];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Memuat pesan...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowSidebar(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Chat Kelas</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {onlineMembers.filter((m) => m.status === "online").length}{" "}
                  anggota online
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari pesan..."
                  className="pl-10 w-48"
                />
              </div>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user?.id ? "justify-end" : "justify-start"
                  } px-2 group`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-sm flex ${
                      msg.senderId === user?.id ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 pt-1">
                      {msg.senderAvatar ? (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                          <AvatarFallback>
                            {msg.senderName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <UserCircle className="w-8 h-8 text-primary" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`mx-2 flex flex-col ${
                        msg.senderId === user?.id ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender Info - Always show for messages, including replies */}
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {msg.senderId === user?.id ? "Anda" : msg.senderName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`${getRoleColor(
                            msg.senderRole
                          )} text-xs`}
                        >
                          {getRoleText(msg.senderRole)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`relative rounded-xl p-3 text-base ${
                          msg.senderId === user?.id
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-white dark:bg-gray-800 rounded-tl-none shadow-sm"
                        }`}
                      >
                        {/* Reply Preview */}
                        {msg.reply_to && msg.replied_message && (
                          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              Membalas {msg.replied_message.senderName}
                            </p>
                            <p className="text-sm text-muted-foreground break-words">
                              {msg.replied_message.message}
                            </p>
                          </div>
                        )}

                        {/* Message Content */}
                        {msg.type === "file" ? (
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="break-words">{msg.fileName}</p>
                              <p className="text-xs opacity-70">
                                {formatFileSize(msg.fileSize || 0)}
                              </p>
                            </div>
                            {msg.fileUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-auto flex-shrink-0"
                                onClick={() =>
                                  window.open(msg.fileUrl, "_blank")
                                }
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ) : msg.type === "image" ? (
                          <div className="space-y-2">
                            {msg.fileUrl && (
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName || "Uploaded image"}
                                className="max-w-full h-auto rounded cursor-pointer"
                                onClick={() =>
                                  window.open(msg.fileUrl, "_blank")
                                }
                              />
                            )}
                            <div className="flex items-center space-x-2">
                              <Image className="w-4 h-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="break-words">{msg.fileName}</p>
                                <p className="text-xs opacity-70">
                                  {formatFileSize(msg.fileSize || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="break-words">
                            {msg.message}
                            {msg.edited && (
                              <span className="text-xs opacity-70 ml-1">
                                (diedit)
                              </span>
                            )}
                          </div>
                        )}

                        {/* Reply Button */}
                        <div 
                          className={`absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 dark:bg-gray-900/50 rounded-full backdrop-blur-sm shadow-lg ${
                            msg.senderId === user?.id 
                              ? "right-full mr-2" 
                              : "left-full ml-2"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => handleStartReply(msg)}
                          >
                            <Reply className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Message Status */}
                      {msg.senderId === user?.id && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {getMessageStatus(msg.status || "sent")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground px-2">
                  <div className="flex -space-x-2">
                    <TooltipProvider>
                      {typingUsers.slice(0, 3).map((typingUser) => (
                        <Tooltip key={typingUser.id}>
                          <TooltipTrigger asChild>
                            <Avatar
                              className="w-6 h-6 border-2 border-background"
                            >
                              <AvatarImage
                                src={typingUser.avatar_url}
                                alt={typingUser.name}
                              />
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
                      : `${typingUsers.length} orang sedang mengetik...`
                    }
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-gray-800">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Membalas {replyingTo.senderId === user?.id ? "diri sendiri" : replyingTo.senderName}
                      </p>
                      <p className="text-sm text-muted-foreground break-words">
                        {replyingTo.message}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelReply}
                      className="ml-2 p-1 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {emojis.map((emoji, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => addEmoji(emoji)}
                        className="text-lg p-1 h-auto"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachment Menu */}
              {attachmentMenu && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="flex items-center space-x-1"
                    >
                      {uploadingFile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span>Dokumen</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="flex items-center space-x-1"
                    >
                      {uploadingFile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Image className="w-4 h-4" />
                      )}
                      <span>Gambar</span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttachmentMenu(!attachmentMenu)}
                    className="h-10 w-10 rounded-full"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="h-10 w-10 rounded-full"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 relative">
                  <Input
                    id="message-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      replyingTo 
                        ? `Balas ${replyingTo.senderId === user?.id ? "diri sendiri" : replyingTo.senderName}...` 
                        : "Ketik pesan..."
                    }
                    className="min-h-[40px] py-2 px-3 rounded-full"
                    maxLength={500}
                    disabled={sendingMessage}
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendingMessage}
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-muted-foreground">
                  {message.length}/500
                </div>
                <div className="text-xs text-muted-foreground sm:hidden">
                  {searchTerm && `${filteredMessages.length} hasil`}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-80 border-l bg-gray-50 dark:bg-gray-900/50">
            <div className="p-4 space-y-4">
              {/* Online Members */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base">
                    <Users className="w-4 h-4 mr-2" />
                    Anggota (
                    {onlineMembers.filter((m) => m.status !== "offline").length}
                    )
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {onlineMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            member.status === "online"
                              ? "bg-green-500"
                              : member.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRoleText(member.role)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Chat Statistics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Statistik Chat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Pesan Hari Ini</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Anggota Aktif</span>
                    <span className="font-medium">
                      {onlineMembers.filter((m) => m.status === "online").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>File Dibagikan</span>
                    <span className="font-medium">
                      {messages.filter((m) => m.type === "file" || m.type === "image").length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {showSidebar && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50 transition-opacity duration-300"
              onClick={() => setShowSidebar(false)}
            />
            <div
              className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-lg">Anggota Kelas</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="h-[calc(100%-57px)] overflow-y-auto p-4 space-y-4">
                {onlineMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === "online"
                            ? "bg-green-500"
                            : member.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRoleText(member.role)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="*/*"
        />
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
      </div>
    </DashboardLayout>
  );
}