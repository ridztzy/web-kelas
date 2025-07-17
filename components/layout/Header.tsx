"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth-supabase';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getNotificationVisuals } from '@/lib/notification-utils'; // <-- PASTIKAN INI DI-IMPORT
import { Bell, Search, UserCircle, Settings, LogOut, Menu, X, ChevronDown, Loader2, Megaphone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipe data notifikasi yang kita harapkan dari API
interface NotificationWithActor {
  id: string;
  read_at: string | null;
  link_to: string | null;
  title: string;
  created_at: string;
  event_type: string;
  actor: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null; // Tipe ini sudah benar, yaitu objek atau null
}

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, setUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotif, setIsLoadingNotif] = useState(true);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setIsLoadingNotif(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, read_at, link_to, title, created_at, event_type,
          actor:profiles!notifications_actor_id_fkey (id, name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        // --- PERBAIKAN ERROR TYPESCRIPT DI SINI ---
        // Kita memproses data 'actor' yang mungkin berupa array
        const formattedData = data.map((item: any) => ({
          ...item,
          // Jika item.actor adalah array, ambil elemen pertama. Jika tidak, biarkan null.
          actor: Array.isArray(item.actor) && item.actor.length > 0 ? item.actor[0] : item.actor,
        }));
        setNotifications(formattedData as NotificationWithActor[]);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi di header:", error);
    } finally {
      setIsLoadingNotif(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const handleRealtimeUpdate = (payload: any) => {
      const eventType = payload.eventType;
      const newRecord = payload.new as NotificationWithActor;

      if (eventType === 'INSERT') {
        setNotifications(prev => [newRecord, ...prev]);
        toast({
          title: "🔔 Notifikasi Baru",
          description: newRecord.title,
        });
      } else if (eventType === 'UPDATE') {
        setNotifications(prev => 
          prev.map(n => n.id === newRecord.id ? newRecord : n)
        );
      }
    };

    const channel = supabase
      .channel(`realtime-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => n.read_at === null).length);
  }, [notifications]);

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
    );
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
    } catch (error) {
      console.error("Gagal menandai notifikasi sebagai dibaca:", error);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const formatDate = (date: Date) => ({
    desktop: date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    mobile: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
  });

  const currentDate = formatDate(new Date());

  return (
    <header className="h-16 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <Button variant="ghost" size="sm" className="md:hidden p-2 hover:bg-accent" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className="hidden md:block min-w-0 flex-1">
          <h2 className="text-lg font-semibold truncate">Selamat datang, {user?.name || 'User'}!</h2>
          <p className="text-sm text-muted-foreground truncate">{currentDate.desktop}</p>
        </div>
        <div className="md:hidden min-w-0 flex-1">
          <h2 className="text-base font-semibold truncate">Halo, {user?.name?.split(' ')[0] || 'User'}!</h2>
          <p className="text-xs text-muted-foreground truncate">{currentDate.mobile}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <form onSubmit={handleSearch} className="hidden lg:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-56 xl:w-64 bg-background/50 focus:bg-background transition-colors" />
          </div>
        </form>

        <Button variant="ghost" size="sm" className="lg:hidden p-2"><Search className="w-5 h-5" /></Button>

            <Button variant="ghost" size="sm" className="p-2 hover:bg-accent">
              <Megaphone className="w-5 h-5" />
            </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative p-2 hover:bg-accent">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs min-w-[20px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifikasi</span>
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount} Baru</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {isLoadingNotif ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => {
                  // --- MENGGUNAKAN KAMUS VISUAL DI SINI ---
                  const { Icon, iconColorClass } = getNotificationVisuals(notif.event_type);
                  return (
                    <DropdownMenuItem key={notif.id} asChild className="p-0">
                      <Link
                        href={notif.link_to || '/dashboard/notifications'}
                        className="flex items-start gap-3 p-2 cursor-pointer w-full"
                        onClick={() => {
                          if (notif.read_at === null) {
                            markAsRead(notif.id);
                          }
                        }}
                      >
                        {/* Ikon berwarna ditambahkan di sini */}
                        <Icon className={`w-4 h-4 mt-1 flex-shrink-0 ${iconColorClass}`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium whitespace-normal ${notif.read_at === null ? '' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notif.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {/* Titik biru untuk notifikasi belum dibaca */}
                        {notif.read_at === null && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                      </Link>
                    </DropdownMenuItem>
                  )
                })
              ) : (
                <div className="text-center text-sm text-muted-foreground p-4">
                  Tidak ada notifikasi.
                </div>
              )}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications" className="justify-center cursor-pointer">
                Lihat Semua Notifikasi
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-2 hover:bg-accent">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || 'Avatar'} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <UserCircle className="w-8 h-8 text-primary flex-shrink-0" />
              )}
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium truncate max-w-[120px]">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">NIM: {user?.nim || '-'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                <Badge variant="outline" className="w-fit text-xs mt-1">{user?.role?.replace('_', ' ') || 'Student'}</Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" /> Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
