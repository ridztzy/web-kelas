"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { getNotificationVisuals } from '@/lib/notification-utils';
import { hasPermission } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
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
  MessageSquare,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Tipe data yang sesuai dengan data dari API
interface NotificationWithActor {
  id: string;
  read_at: string | null;
  link_to: string | null;
  title: string;
  message: string | null;
  created_at: string;
  event_type: string;
  actor: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('semua');
  const [filterRead, setFilterRead] = useState('semua');
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    sendToAll: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    scheduleChanges: true,
    chatMessages: false,
    systemUpdates: true
  });

  const canSendNotifications = hasPermission(user?.role || '', ['admin', 'ketua_kelas', 'sekretaris']);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memuat notifikasi.');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (notificationId: string, currentStatus: boolean) => {
    setActionLoading(`read-${notificationId}`);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !currentStatus }),
      });
      if (!response.ok) throw new Error('Gagal memperbarui status notifikasi.');
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: n.read_at ? null : new Date().toISOString() } 
            : n
        )
      );
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    setActionLoading(`delete-${notificationId}`);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Gagal menghapus notifikasi.');
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({ title: "Sukses", description: "Notifikasi telah dihapus." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const isUnread = notification.read_at === null;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'semua' || notification.event_type === filterType;
    const matchesRead = filterRead === 'semua' || 
                       (filterRead === 'read' && !isUnread) ||
                       (filterRead === 'unread' && isUnread);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => n.read_at === null).length;



  const handleSendNotification = () => {
    // Logika untuk mengirim notifikasi
  };

  const NotificationCard = ({ notification }: { notification: NotificationWithActor }) => {
    const isUnread = notification.read_at === null;
    const isLoadingRead = actionLoading === `read-${notification.id}`;
    const isLoadingDelete = actionLoading === `delete-${notification.id}`;
    const { Icon, colorClass, iconColorClass, typeLabel } = getNotificationVisuals(notification.event_type);

    return (
      <Card className={`${colorClass} ${isUnread ? 'shadow-md' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Icon className={`w-5 h-5 ${iconColorClass}`} />
              <h3 className={`font-medium ${isUnread ? 'font-semibold' : ''}`}>{notification.title}</h3>
              {isUnread && <Badge variant="destructive" className="text-xs">Baru</Badge>}
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id, !isUnread)} disabled={isLoadingRead || isLoadingDelete}>
                {isLoadingRead ? <Loader2 className="w-4 h-4 animate-spin" /> : (isUnread ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />)}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification.id)} className="text-destructive hover:text-destructive" disabled={isLoadingRead || isLoadingDelete}>
                {isLoadingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(notification.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Bell className="w-6 h-6 mr-2" /> Notifikasi {unreadCount > 0 && <Badge className="ml-2">{unreadCount} Baru</Badge>}
            </h1>
            <p className="text-muted-foreground">Kelola notifikasi dan pengaturan</p>
          </div>
          {canSendNotifications && (
            <Dialog>
              <DialogTrigger asChild><Button><Send className="w-4 h-4 mr-2" />Kirim Notifikasi</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Kirim Notifikasi Baru</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label htmlFor="title">Judul Notifikasi</Label><Input id="title" value={newNotification.title} onChange={(e) => setNewNotification({...newNotification, title: e.target.value})} placeholder="Judul notifikasi" /></div>
                  <div><Label htmlFor="message">Pesan</Label><Textarea id="message" value={newNotification.message} onChange={(e) => setNewNotification({...newNotification, message: e.target.value})} placeholder="Isi pesan notifikasi" rows={4} /></div>
                  <div><Label htmlFor="type">Jenis Notifikasi</Label><Select value={newNotification.type} onValueChange={(value: any) => setNewNotification({...newNotification, type: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="info">Informasi</SelectItem><SelectItem value="warning">Peringatan</SelectItem><SelectItem value="success">Sukses</SelectItem><SelectItem value="error">Error</SelectItem></SelectContent></Select></div>
                  <div className="flex items-center space-x-2"><Switch id="sendToAll" checked={newNotification.sendToAll} onCheckedChange={(checked) => setNewNotification({...newNotification, sendToAll: checked})} /><Label htmlFor="sendToAll">Kirim ke semua pengguna</Label></div>
                  <Button onClick={handleSendNotification} className="w-full">Kirim Notifikasi</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Notifikasi</p><p className="text-2xl font-bold text-blue-600">{notifications.length}</p></div><Bell className="w-8 h-8 text-blue-600" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Belum Dibaca</p><p className="text-2xl font-bold text-orange-600">{unreadCount}</p></div><AlertTriangle className="w-8 h-8 text-orange-600" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Sudah Dibaca</p><p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p></div><CheckCircle className="w-8 h-8 text-green-600" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Hari Ini</p><p className="text-2xl font-bold text-purple-600">{notifications.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length}</p></div><Clock className="w-8 h-8 text-purple-600" /></div></CardContent></Card>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Filter className="w-5 h-5 mr-2" />Filter & Pencarian</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div><Label htmlFor="search">Cari Notifikasi</Label><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari notifikasi..." className="pl-10" /></div></div>
                  <div><Label htmlFor="filterType">Jenis</Label><Select value={filterType} onValueChange={setFilterType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="semua">Semua</SelectItem><SelectItem value="info">Informasi</SelectItem><SelectItem value="warning">Peringatan</SelectItem><SelectItem value="success">Sukses</SelectItem><SelectItem value="error">Error</SelectItem></SelectContent></Select></div>
                  <div><Label htmlFor="filterRead">Status</Label><Select value={filterRead} onValueChange={setFilterRead}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="semua">Semua</SelectItem><SelectItem value="unread">Belum Dibaca</SelectItem><SelectItem value="read">Sudah Dibaca</SelectItem></SelectContent></Select></div>
                  <div className="flex items-end"><Button variant="outline" className="w-full">Reset Filter</Button></div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)
                ) : (
                  <Card><CardContent className="p-8 text-center"><Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium mb-2">Tidak ada notifikasi</h3><p className="text-muted-foreground">Tidak ada notifikasi yang sesuai dengan filter yang dipilih.</p></CardContent></Card>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Settings className="w-5 h-5 mr-2" />Pengaturan Notifikasi</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between"><div><Label htmlFor="emailNotifications">Notifikasi Email</Label><p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p></div><Switch id="emailNotifications" checked={notificationSettings.emailNotifications} onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})} /></div>
                <div className="flex items-center justify-between"><div><Label htmlFor="pushNotifications">Notifikasi Push</Label><p className="text-sm text-muted-foreground">Terima notifikasi push di browser</p></div><Switch id="pushNotifications" checked={notificationSettings.pushNotifications} onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})} /></div>
                <div className="flex items-center justify-between"><div><Label htmlFor="taskReminders">Pengingat Tugas</Label><p className="text-sm text-muted-foreground">Pengingat deadline tugas</p></div><Switch id="taskReminders" checked={notificationSettings.taskReminders} onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, taskReminders: checked})} /></div>
                <div className="flex items-center justify-between"><div><Label htmlFor="scheduleChanges">Perubahan Jadwal</Label><p className="text-sm text-muted-foreground">Notifikasi perubahan jadwal kuliah</p></div><Switch id="scheduleChanges" checked={notificationSettings.scheduleChanges} onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, scheduleChanges: checked})} /></div>
                <div className="flex items-center justify-between"><div><Label htmlFor="chatMessages">Pesan Chat</Label><p className="text-sm text-muted-foreground">Notifikasi pesan chat kelas</p></div><Switch id="chatMessages" checked={notificationSettings.chatMessages} onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, chatMessages: checked})} /></div>
                <div className="flex items-center justify-between"><div><Label htmlFor="systemUpdates">Update Sistem</Label><p className="text-sm text-muted-foreground">Notifikasi update dan maintenance sistem</p></div><Switch id="systemUpdates" checked={notificationSettings.systemUpdates} onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})} /></div>
                <Button className="w-full">Simpan Pengaturan</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
