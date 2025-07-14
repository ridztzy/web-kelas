"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage } from "@/lib/types";
import {
  fetchMessages,
  insertMessage,
  updateMessage,
  subscribeToMessages,
  uploadFile,
} from "@/lib/messages";
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
} from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachmentMenu, setAttachmentMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Load messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await fetchMessages();
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToMessages(
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      },
      (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      },
      (deletedId) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== deletedId));
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Simulate typing indicator
  useEffect(() => {
    if (message.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || sendingMessage) return;

    setSendingMessage(true);
    try {
      await insertMessage({
        message: message.trim(),
        sender_id: user.id,
        type: "text",
      });
      setMessage("");
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      });

      setAttachmentMenu(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      });

      setAttachmentMenu(false);
      // Reset file input
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
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineMembers = [
    { name: "Ahmad Rizki", role: "admin", status: "online" },
    { name: "Siti Nurhaliza", role: "ketua_kelas", status: "online" },
    { name: "Budi Santoso", role: "sekretaris", status: "away" },
    { name: "Dewi Sartika", role: "mahasiswa", status: "online" },
    { name: "Rina Wati", role: "mahasiswa", status: "online" },
    { name: "Fajar Nugraha", role: "mahasiswa", status: "offline" },
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
        <div className="flex-shrink-0 p-4 border-b bg-white dark:bg-gray-900">
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
          <div className="flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-gray-900">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl flex ${
                      msg.senderId === user?.id ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 pt-1">
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
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
                      {/* Sender Info */}
                      <div className="flex items-center space-x-2 mb-1">
                        {msg.senderId !== user?.id && (
                          <>
                            <span className="font-medium text-sm">
                              {msg.senderName}
                            </span>
                            <Badge
                              variant="outline"
                              className={`${getRoleColor(
                                msg.senderRole
                              )} text-xs`}
                            >
                              {getRoleText(msg.senderRole)}
                            </Badge>
                          </>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {msg.timestamp.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`rounded-lg p-3 text-sm ${
                          msg.senderId === user?.id
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-white dark:bg-gray-800 rounded-tl-none shadow-sm"
                        }`}
                      >
                        {msg.type === "file" ? (
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate">{msg.fileName}</p>
                              <p className="text-xs opacity-70">
                                {formatFileSize(msg.fileSize || 0)}
                              </p>
                            </div>
                            {msg.fileUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-auto"
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
                              <Image className="w-4 h-4" />
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{msg.fileName}</p>
                                <p className="text-xs opacity-70">
                                  {formatFileSize(msg.fileSize || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {msg.message}
                            {msg.edited && (
                              <span className="text-xs opacity-70 ml-1">
                                (diedit)
                              </span>
                            )}
                          </div>
                        )}
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

              {isTyping && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span>Seseorang sedang mengetik...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-gray-800">
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

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachmentMenu(!attachmentMenu)}
                  disabled={uploadingFile}
                  className="flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex-shrink-0"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan..."
                  className="flex-1"
                  maxLength={500}
                  disabled={sendingMessage}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendingMessage}
                  className="flex-shrink-0"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
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
                  {onlineMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="relative">
                        <UserCircle className="w-8 h-8 text-primary" />
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
                      {
                        onlineMembers.filter((m) => m.status === "online")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>File Dibagikan</span>
                    <span className="font-medium">
                      {
                        messages.filter(
                          (m) => m.type === "file" || m.type === "image"
                        ).length
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowSidebar(false)}
          >
            <div
              className="w-80 h-full bg-white dark:bg-gray-900 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Anggota Kelas</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  {onlineMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="relative">
                        <UserCircle className="w-8 h-8 text-primary" />
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
