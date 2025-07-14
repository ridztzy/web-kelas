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
}

export interface MessageUpdate {
  message?: string;
  edited?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

// Fetch all messages
export async function fetchMessages(): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(
        id,
        name,
        role
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return data.map(msg => ({
    id: msg.id,
    message: msg.message,
    senderId: msg.sender_id,
    senderName: msg.sender.name,
    senderRole: msg.sender.role,
    timestamp: new Date(msg.created_at),
    type: msg.type,
    edited: msg.edited,
    status: msg.status,
    fileName: msg.file_name,
    fileSize: msg.file_size,
    fileUrl: msg.file_url
  }));
}

// Insert new message
export async function insertMessage(message: MessageInsert): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(
        id,
        name,
        role
      )
    `)
    .single();

  if (error) {
    console.error('Error inserting message:', error);
    throw error;
  }

  return {
    id: data.id,
    message: data.message,
    senderId: data.sender_id,
    senderName: data.sender.name,
    senderRole: data.sender.role,
    timestamp: new Date(data.created_at),
    type: data.type,
    edited: data.edited,
    status: data.status,
    fileName: data.file_name,
    fileSize: data.file_size,
    fileUrl: data.file_url
  };
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
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      },
      async (payload) => {
        // Fetch the complete message with sender info
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(
              id,
              name,
              role,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onInsert({
            id: data.id,
            message: data.message,
            senderId: data.sender_id,
            senderName: data.sender.name,
            senderRole: data.sender.role,
            senderAvatar: data.sender.avatar_url,
            timestamp: new Date(data.created_at),
            type: data.type,
            edited: data.edited,
            status: data.status,
            fileName: data.file_name,
            fileSize: data.file_size,
            fileUrl: data.file_url
          });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      },
      async (payload) => {
        // Fetch the complete updated message with sender info
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(
              id,
              name,
              role
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onUpdate({
            id: data.id,
            message: data.message,
            senderId: data.sender_id,
            senderName: data.sender.name,
            senderRole: data.sender.role,
            senderAvatar: data.sender.avatar_url,
            timestamp: new Date(data.created_at),
            type: data.type,
            edited: data.edited,
            status: data.status,
            fileName: data.file_name,
            fileSize: data.file_size,
            fileUrl: data.file_url
          });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        onDelete(payload.old.id);
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