"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { Notification } from '@/lib/types';
import {
  Bell,
  Plus,
  Search,
  Filter,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Send,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';

// Mock notifications data
const notifications: Notification[] = [
  {
    id: '1',
    title: 'Tugas Algoritma Deadline Besok',
    message: 'Jangan lupa mengumpulkan tugas implementasi algoritma sorting sebelum jam 23:59 besok.',
    type: 'warning',
    read: false,
    userId: '4',
    createdAt: new Date('2024-01-25T10:00:00')
  },
  {
    id: '2',
    title: 'Jadwal Kuliah Berubah',
    message: 'Kuliah Basis Data hari Selasa dipindah ke ruang Lab 3.',
    type: 'info',
    read: true,
    userId: '4',
    createdAt: new Date('2024-01-24T15:30:00')
  },
  {
    id: '3',
    title: 'Tugas Berhasil Dikumpulkan',
    message: 'Tugas laporan praktikum database Anda telah berhasil dikumpulkan.',
    type: 'success',
    read: false,
    userId: '4',
    createdAt: new Date('2024-01-24T09:15:00')
  },
  {
    id: '4',
    title: 'Sistem Maintenance',
    message: 'Sistem akan mengalami maintenance pada Minggu, 28 Januari 2024 pukul 02:00-04:00 WIB.',
    type: 'error',
    read: true,
    userId: '4',
    createdAt: new Date('2024-01-23T16:45:00')
  }
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('semua');
  const [filterRead, setFilterRead] = useState('semua');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    sendToAll: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    scheduleChanges: true,
    chatMessages: false,
    systemUpdates: true
  });

  const canSendNotifications = hasPermission(user?.role || '', ['admin', 'ketua_kelas', 'sekretaris']);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'semua' || notification.type === filterType;
    const matchesRead = filterRead === 'semua' || 
                       (filterRead === 'read' && notification.read) ||
                       (filterRead === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'warning':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleSendNotification = () => {
    console.log('Sending notification:', newNotification);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      sendToAll: true
    });
  };

  const handleMarkAsRead = (id: string) => {
    console.log('Marking notification as read:', id);
  };

  const handleDeleteNotification = (id: string) => {
    console.log('Deleting notification:', id);
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'shadow-md' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getNotificationIcon(notification.type)}
            <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <Badge variant="destructive" className="text-xs">Baru</Badge>
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsRead(notification.id)}
            >
              {notification.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteNotification(notification.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {notification.createdAt.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <Badge variant="outline" className="text-xs">
            {notification.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Notifikasi
              {unreadCount > 0 && (
                <Badge className="ml-2">{unreadCount} Baru</Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Kelola notifikasi dan pengaturan</p>
          </div>
          
          {canSendNotifications && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Notifikasi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Kirim Notifikasi Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Notifikasi</Label>
                    <Input
                      id="title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                      placeholder="Judul notifikasi"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                      placeholder="Isi pesan notifikasi"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Jenis Notifikasi</Label>
                    <Select value={newNotification.type} onValueChange={(value: any) => setNewNotification({...newNotification, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Informasi</SelectItem>
                        <SelectItem value="warning">Peringatan</SelectItem>
                        <SelectItem value="success">Sukses</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendToAll"
                      checked={newNotification.sendToAll}
                      onCheckedChange={(checked) => setNewNotification({...newNotification, sendToAll: checked})}
                    />
                    <Label htmlFor="sendToAll">Kirim ke semua pengguna</Label>
                  </div>
                  
                  <Button onClick={handleSendNotification} className="w-full">
                    Kirim Notifikasi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Notifikasi</p>
                  <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Belum Dibaca</p>
                  <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sudah Dibaca</p>
                  <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hari Ini</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {notifications.filter(n => 
                      n.createdAt.toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter & Pencarian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Cari Notifikasi</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari notifikasi..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="filterType">Jenis</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua</SelectItem>
                        <SelectItem value="info">Informasi</SelectItem>
                        <SelectItem value="warning">Peringatan</SelectItem>
                        <SelectItem value="success">Sukses</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filterRead">Status</Label>
                    <Select value={filterRead} onValueChange={setFilterRead}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semua">Semua</SelectItem>
                        <SelectItem value="unread">Belum Dibaca</SelectItem>
                        <SelectItem value="read">Sudah Dibaca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
              
              {filteredNotifications.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Tidak ada notifikasi</h3>
                    <p className="text-muted-foreground">
                      Tidak ada notifikasi yang sesuai dengan filter yang dipilih.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Pengaturan Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Notifikasi Email</Label>
                    <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Notifikasi Push</Label>
                    <p className="text-sm text-muted-foreground">Terima notifikasi push di browser</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="taskReminders">Pengingat Tugas</Label>
                    <p className="text-sm text-muted-foreground">Pengingat deadline tugas</p>
                  </div>
                  <Switch
                    id="taskReminders"
                    checked={notificationSettings.taskReminders}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, taskReminders: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="scheduleChanges">Perubahan Jadwal</Label>
                    <p className="text-sm text-muted-foreground">Notifikasi perubahan jadwal kuliah</p>
                  </div>
                  <Switch
                    id="scheduleChanges"
                    checked={notificationSettings.scheduleChanges}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, scheduleChanges: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chatMessages">Pesan Chat</Label>
                    <p className="text-sm text-muted-foreground">Notifikasi pesan chat kelas</p>
                  </div>
                  <Switch
                    id="chatMessages"
                    checked={notificationSettings.chatMessages}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, chatMessages: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemUpdates">Update Sistem</Label>
                    <p className="text-sm text-muted-foreground">Notifikasi update dan maintenance sistem</p>
                  </div>
                  <Switch
                    id="systemUpdates"
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                  />
                </div>
                
                <Button className="w-full">
                  Simpan Pengaturan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}