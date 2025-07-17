"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { loginWithNIM, testSupabaseConnection } from '@/lib/auth-supabase';
import { supabase } from '@/lib/supabase';
import {
  GraduationCap,
  Sun,
  Moon,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  XCircle,
  X,
  Bell
} from 'lucide-react';

// Tipe data untuk notifikasi
interface AnnouncementNotification {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'deadline' | 'holiday' | 'exam' | 'announcement';
  date: string;
  urgent: boolean;
}

// Props untuk komponen utama notifikasi
interface NotificationProps {
  notifications: AnnouncementNotification[];
  show: boolean;
  onClose: () => void;
  onDismiss: (id: string) => void;
}

// Komponen untuk satu item notifikasi
const NotificationItem: React.FC<{
  notification: AnnouncementNotification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'deadline': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'holiday': return <Sun className="w-4 h-4 text-green-500" />;
      case 'exam': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Info className="w-4 h-4 text-purple-500" />;
    }
  };

  const getBgColor = (type: string, urgent: boolean) => {
    if (urgent) return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    switch (type) {
      case 'assignment': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'deadline': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'holiday': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'exam': return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default: return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
    }
  };

  // Logika untuk swipe-to-dismiss (geser untuk hapus)
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diffX = clientX - startX;
    if (diffX > 0) setDragOffset(diffX);
  };

  const handleDragEnd = () => {
    if (dragOffset > 100) {
      onDismiss(notification.id);
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Latar belakang saat digeser */}
      <div
        className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-lg"
        style={{ opacity: Math.min(dragOffset / 100, 1) }}
      >
        <div className="text-white font-medium text-xs flex items-center space-x-1">
          <XCircle className="w-4 h-4" />
          <span>Hapus</span>
        </div>
      </div>

      {/* Konten Notifikasi */}
      <div
        className={`p-3 rounded-lg border shadow-md transition-transform duration-200 cursor-grab ${isDragging ? 'cursor-grabbing' : ''} ${getBgColor(notification.type, notification.urgent)}`}
        style={{ transform: `translateX(${dragOffset}px)` }}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd} // Batalkan jika kursor keluar area
      >
        <div className="flex items-start space-x-3">
          {getIcon(notification.type)}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {notification.title}
              {notification.urgent && (
                <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                  URGENT
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {notification.date}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// [BARU] Komponen Wrapper untuk menampilkan notifikasi sebagai Popup/Modal
const NotificationWrapper: React.FC<NotificationProps> = ({ notifications, show, onClose, onDismiss }) => {
  useEffect(() => {
    // Jika semua notifikasi sudah di-dismiss, tutup modal
    if (show && notifications.length === 0) {
      onClose();
    }
  }, [notifications, show, onClose]);

  if (!show || notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Pengumuman ({notifications.length})
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-3 overflow-y-auto">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <NotificationItem
                notification={notification}
                onDismiss={onDismiss}
              />
              {/* Petunjuk swipe hanya untuk notifikasi pertama */}
              {index === 0 && (
                 <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 animate-pulse">
                   Geser notifikasi ke kanan untuk menghapus
                 </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};


export default function LoginForm() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [notifications, setNotifications] = useState<AnnouncementNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

const loadAnnouncements = async () => {
    try {
      // 1. Ambil data pengumuman dari tabel baru kita
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5); // Ambil 5 pengumuman terbaru

      if (error) throw error;

      if (data) {
        // 2. Format data agar sesuai dengan interface AnnouncementNotification
        const formattedAnnouncements = data.map(item => ({
          ...item,
          // Ubah created_at menjadi format tanggal yang bisa dibaca
          date: new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        })) as AnnouncementNotification[];
        
        setNotifications(formattedAnnouncements);
        
        // Hanya tampilkan popup jika ada pengumuman
        if (formattedAnnouncements.length > 0) {
          setShowNotifications(true);
        }
      }
    } catch (err) {
        console.error("Gagal memuat pengumuman:", err);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };


  // useEffect sebelumnya
  useEffect(() => {
    const timer = setTimeout(() => {
        // Sekarang panggil fungsi async yang baru
        loadAnnouncements();
    }, 2000); 
    return () => clearTimeout(timer);
  }, []);

  // ---> TAMBAHKAN KODE BLOK INI <---
  // useEffect untuk mendengarkan pengumuman baru secara real-time
  useEffect(() => {
    const channel = supabase
      .channel('public-announcements') // Nama channel publik kita
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Kita hanya peduli saat ada pengumuman BARU
          schema: 'public',
          table: 'announcements',
        },
        (payload) => {
          console.log('Pengumuman baru diterima!', payload.new);
          // Format data baru dan tambahkan ke bagian atas daftar notifikasi
          const newAnnouncement = {
            ...(payload.new as any),
            date: new Date(payload.new.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
          } as AnnouncementNotification;

          setNotifications(prev => [newAnnouncement, ...prev]);
          setShowNotifications(true); // Pastikan popup muncul jika tertutup
        }
      )
      .subscribe();

    // Fungsi cleanup untuk berhenti mendengarkan saat komponen di-unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // <-- Pastikan array dependensi kosong agar hanya berjalan sekali

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!nim.trim() || !password.trim()) {
      setError('NIM dan Password tidak boleh kosong');
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginWithNIM(nim.trim(), password);
      if (result.user) {
        setUser(result.user);
        router.push('/dashboard');
      } else {
        setError(result.error || 'NIM atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) setError('');
    };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/images/bg-keren.jpg')] bg-cover bg-center dark:bg-[url('/images/bg-gelap.jpg')]">
      
      {/* Panggil komponen wrapper notifikasi yang baru */}
      <NotificationWrapper
        notifications={notifications}
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        onDismiss={dismissNotification}
      />

      <div className="w-full max-w-md space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sistem Kelas
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manajemen Kelas Ilmu Komputer
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="glass-effect shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Login
              </CardTitle>
              <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bell className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
                </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nim" className="text-sm font-medium text-gray-700 dark:text-gray-300">NIM</Label>
                <Input
                  id="nim"
                  type="text"
                  value={nim}
                  onChange={handleInputChange(setNim)}
                  placeholder="Masukkan NIM Anda"
                  required
                  disabled={isLoading}
                  className="h-11 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Password
  </Label>
  <div className="relative">
    <Input
      id="password"
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={handleInputChange(setPassword)}
      placeholder="Masukkan password"
      required
      disabled={isLoading}
      className="h-11 pr-12 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
      disabled={isLoading}
    >
      {showPassword ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
    </button>
  </div>
</div>


              <Button
                type="submit"
                className="w-full h-11 text-sm font-medium bg-primary hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : ( 'Login' )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informasi Card */}
        <Card className="glass-effect shadow-lg border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-500" />
              <span>Informasi Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
               <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                 <li>• Gunakan <strong>NIM</strong> sebagai username.</li>
                 <li>• Password default sama dengan <strong>NIM</strong> Anda.</li>
                 <li>• Hubungi admin jika mengalami kesulitan login.</li>
               </ul>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}