"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage, User } from "@/lib/types";
import { fetchMessages, subscribeToMessages, deleteMessage, updateMessage } from "@/lib/messages";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import MemberList from "@/components/chat/MemberList";

type TypingUser = Pick<User, "id" | "name" | "avatar_url" | "role">;

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ✅ FUNGSI DIPINDAHKAN KE SINI (LEVEL KOMPONEN)
  const handleDeleteMessage = async (messageId: string) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus pesan ini?");
    if (!isConfirmed) return;

    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Gagal menghapus pesan:", error);
    }
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessage(message);
    setReplyingTo(null);
  };

  useEffect(() => {
    let messageChannel: any;
    let typingChannel: any;

    const loadData = async () => {
      setLoading(true);
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

    messageChannel = subscribeToMessages(
      (newMessage) => setMessages((prev) => [...prev, newMessage]),
      (updatedMessage) =>
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        ),
      (deletedId) =>
        setMessages((prev) => prev.filter((msg) => msg.id !== deletedId))
    );

    if (user) {
      typingChannel = supabase.channel("chat-typing-indicators");
      typingChannel
        .on("broadcast", { event: "typing" }, ({ payload }: { payload: TypingUser }) => {
          if (payload.id !== user.id) {
            setTypingUsers((current) => {
              if (!current.some((u) => u.id === payload.id)) {
                return [...current, payload];
              }
              return current;
            });

            if (typingTimeoutRef.current.has(payload.id)) {
              clearTimeout(typingTimeoutRef.current.get(payload.id));
            }

            const newTimeout = setTimeout(() => {
              setTypingUsers((current) =>
                current.filter((u) => u.id !== payload.id)
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        <ChatHeader onToggleSidebar={() => setShowSidebar(!showSidebar)} />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
            {/* ✅ Pengiriman props sekarang sudah benar */}
            <MessageList
              messages={messages}
              typingUsers={typingUsers}
              currentUser={user}
              onStartReply={setReplyingTo}
              onDelete={handleDeleteMessage}
              onEdit={handleStartEdit}
            />
            <MessageInput
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              editingMessage={editingMessage}
              setEditingMessage={setEditingMessage}
            />
          </div>
          <MemberList
            showSidebar={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}