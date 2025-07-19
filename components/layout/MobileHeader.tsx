"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth-supabase';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getNotificationVisuals } from '@/lib/notification-utils';
import { 
  Bell, 
  Search, 
  UserCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  } | null;
}

export default function MobileHeader() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get page title based on current route
  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/dashboard/tasks':
        return 'Tugas';
      case '/dashboard/chat':
        return 'Chat';
      case '/dashboard/subjects':
        return 'Mata Kuliah';
      case '/dashboard/schedule':
        return 'Jadwal';
      case '/dashboard/notifications':
        return 'Notifikasi';
      case '/dashboard/users':
        return 'Pengguna';
      case '/dashboard/settings':
        return 'Pengaturan';
      case '/dashboard/analytics':
        return 'Analitik';
      case '/dashboard/search':
        return 'Pencarian';
      case '/dashboard/profile':
        return 'Profil';
      default:
        return 'Sistem Kelas';
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
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
        const formattedData = data.map((item: any) => ({
          ...item,
          actor: Array.isArray(item.actor) && item.actor.length > 0 ? item.actor[0] : item.actor,
        }));
        setNotifications(formattedData as NotificationWithActor[]);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi di header:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

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

  const showBackButton = pathname !== '/dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 safe-area-pt">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {showBackButton ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-full w-10 h-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              {user?.avatar_url ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar_url} alt={user.name || 'Avatar'} />
                  <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Halo, {user?.name?.split(' ')[0] || 'User'}!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">NIM: {user?.nim}</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Section - Page Title */}
        <h1 className="text-lg font-semibold text-center flex-1 mx-4 truncate text-gray-900 dark:text-white">
          {getPageTitle()}
        </h1>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-10 h-10"
            onClick={() => router.push('/dashboard/search')}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full w-10 h-10">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs min-w-[20px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <SheetHeader>
                <SheetTitle className="flex justify-between items-center">
                  <span>Notifikasi</span>
                  {unreadCount > 0 && <Badge variant="secondary">{unreadCount} Baru</Badge>}
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => {
                      const { Icon, iconColorClass } = getNotificationVisuals(notif.event_type);
                      return (
                        <div
                          key={notif.id}
                          className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => {
                            if (notif.read_at === null) {
                              markAsRead(notif.id);
                            }
                            if (notif.link_to) {
                              router.push(notif.link_to);
                            }
                          }}
                        >
                          <Icon className={`w-4 h-4 mt-1 flex-shrink-0 ${iconColorClass}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${notif.read_at === null ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(notif.created_at).toLocaleString('id-ID', { 
                                day: 'numeric', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          {notif.read_at === null && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-4">
                    Tidak ada notifikasi.
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                  <Badge variant="outline" className="w-fit text-xs mt-1">
                    {user?.role?.replace('_', ' ') || 'Student'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" /> Profil
              </DropdownMenuItem>
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
      </div>
    </header>
  );
}