// lib/supabase/messages.ts
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types';

export interface MessageInsert {
  message: string;
  sender_id: string;
  type: 'text' | 'file' | 'image';
  file_name?: string;
  file_size?: number;
  file_url?: string;
  reply_to?: string | null; // Pastikan ini ada
}

export interface MessageUpdate {
  message?: string;
  edited?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

// --- Fungsi yang Diperbaiki ---
const messageQuery = `
  id,
  created_at,
  message,
  sender_id,
  type,
  edited,
  status,
  file_name,
  file_size,
  file_url,
  reply_to,
  sender:profiles!messages_sender_id_fkey (
    id, name, role, avatar_url
  ),
  replied_message:messages!reply_to (
    id, message, sender_id,
    sender:profiles!messages_sender_id_fkey(id, name)
  )
`;

const mapToChatMessage = (msg: any): ChatMessage => {
  if (!msg) return {} as ChatMessage; // Handle null case
  return {
    id: msg.id,
    message: msg.message,
    senderId: msg.sender_id,
    senderName: msg.sender?.name || 'User',
    senderRole: msg.sender?.role || 'mahasiswa',
    senderAvatar: msg.sender?.avatar_url,
    timestamp: new Date(msg.created_at),
    type: msg.type,
    edited: msg.edited,
    status: msg.status,
    fileName: msg.file_name,
    fileSize: msg.file_size,
    fileUrl: msg.file_url,
    reply_to: msg.reply_to,
    replied_message: msg.replied_message ? {
        message: msg.replied_message.message,
        senderName: msg.replied_message.sender?.name || 'User'
    } : null,
  };
};

// Fetch all messages
export async function fetchMessages(): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(messageQuery)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data.map(mapToChatMessage);
}

// Insert new message
export async function insertMessage(message: MessageInsert): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select(messageQuery)
    .single();

  if (error) {
    console.error('Error inserting message:', error);
    throw error;
  }

  return mapToChatMessage(data);
}

// Update message
export async function updateMessage(id: string, updates: MessageUpdate): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating message:', error);
    throw error;
  }
}

// Delete message
export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

// Subscribe to realtime messages
export function subscribeToMessages(
  onInsert: (message: ChatMessage) => void,
  onUpdate: (message: ChatMessage) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel('messages-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      async (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const { data } = await supabase
            .from('messages')
            .select(messageQuery)
            .eq('id', payload.new.id)
            .single();
            
          if (data) {
            const mappedMessage = mapToChatMessage(data);
            if (payload.eventType === 'INSERT') {
              onInsert(mappedMessage);
            } else {
              onUpdate(mappedMessage);
            }
          }
        } else if (payload.eventType === 'DELETE') {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return channel;
}
  // File upload utility
  export async function uploadFile(file: File, userId: string): Promise<string> {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);

    return publicUrl;
  }