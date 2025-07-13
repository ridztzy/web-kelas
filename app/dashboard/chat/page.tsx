"use client";

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { chatMessages } from '@/lib/data';
import { ChatMessage } from '@/lib/types';
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  UserCircle,
  MessageSquare,
  Users,
  Search
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: message.trim(),
        senderId: user?.id || '',
        senderName: user?.name || '',
        senderRole: user?.role || '',
        timestamp: new Date(),
        edited: false
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'ketua_kelas':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'sekretaris':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'ketua_kelas':
        return 'Ketua Kelas';
      case 'sekretaris':
        return 'Sekretaris';
      default:
        return 'Mahasiswa';
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chat Kelas</h1>
            <p className="text-muted-foreground">Diskusi dan komunikasi dengan teman sekelas</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Audio Call
            </Button>
            <Button variant="outline" size="sm">
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Anggota
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Ruang Chat Kelas
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari pesan..."
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg max-h-96">
                  {filteredMessages.map((msg) => (
                    <div key={msg.id} className={`flex items-start space-x-3 ${
                      msg.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <UserCircle className="w-8 h-8 text-primary mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{msg.senderName}</span>
                          <Badge variant="outline" className={getRoleColor(msg.senderRole)}>
                            {getRoleText(msg.senderRole)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className={`text-sm p-3 rounded-lg shadow-sm max-w-xs ${
                          msg.senderId === user?.id 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-white dark:bg-gray-800'
                        }`}>
                          {msg.message}
                          {msg.edited && (
                            <span className="text-xs opacity-70 block mt-1">(diedit)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    className="flex-1"
                    maxLength={500}
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Character count */}
                <div className="text-xs text-muted-foreground text-right">
                  {message.length}/500
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Online Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Anggota Online
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Ahmad Rizki', role: 'Admin', status: 'online' },
                    { name: 'Siti Nurhaliza', role: 'Ketua Kelas', status: 'online' },
                    { name: 'Budi Santoso', role: 'Sekretaris', status: 'away' },
                    { name: 'Dewi Sartika', role: 'Mahasiswa', status: 'online' }
                  ].map((member, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="relative">
                        <UserCircle className="w-8 h-8 text-primary" />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Pesan Penting
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Grup Diskusi
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Bagikan File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chat Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pesan Hari Ini</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Anggota Aktif</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Dibagikan</span>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}