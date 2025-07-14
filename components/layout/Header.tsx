"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth-supabase';
import { Bell, Search, UserCircle, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, setUser } = useAuth();
  const router = useRouter();

  const notificationCount = 3;

const handleLogout = async () => {
  try {
    // Tampilkan loading jika perlu
    // showLoading();

    // 1. Tunggu (await) sampai proses logout di server selesai
    await logout();
    
    // 2. Setelah BENAR-BENAR berhasil, baru perbarui UI dan arahkan pengguna
    setUser(null);
    router.push('/');

  } catch (error) {
    // Tangani jika proses logout di server gagal
    console.error("Gagal melakukan logout:", error);
    alert("Proses keluar gagal, silakan coba lagi.");
  } finally {
    // Sembunyikan loading jika ada
    // hideLoading();
  }
};

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const formatDate = (date: Date) => {
    return {
      desktop: date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      mobile: date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    };
  };

  const currentDate = formatDate(new Date());

  return (
    <header className="h-16 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 hover:bg-accent"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Desktop greeting */}
        <div className="hidden md:block min-w-0 flex-1">
          <h2 className="text-lg font-semibold truncate">
            Selamat datang, {user?.name || 'User'}!
          </h2>
          <p className="text-sm text-muted-foreground truncate">
            {currentDate.desktop}
          </p>
        </div>
        
        {/* Mobile greeting */}
        <div className="md:hidden min-w-0 flex-1">
          <h2 className="text-base font-semibold truncate">
            Halo, {user?.name?.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {currentDate.mobile}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Search - Desktop */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari tugas, mata kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-56 xl:w-64 bg-background/50 focus:bg-background transition-colors"
            />
          </div>
        </form>

        {/* Mobile search button */}
        <Button variant="ghost" size="sm" className="lg:hidden p-2">
          <Search className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 hover:bg-accent"
          onClick={() => router.push('/dashboard/notifications')}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs min-w-[20px]">
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-2 hover:bg-accent">
  {/* Logika untuk menampilkan gambar atau ikon */}
  {user?.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user.name || 'Avatar'}
      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
    />
  ) : (
    <UserCircle className="w-8 h-8 text-primary flex-shrink-0" />
  )}

  {/* Bagian teks tetap sama */}
  <div className="hidden sm:block text-left min-w-0">
    <p className="text-sm font-medium truncate max-w-[120px]">
      {user?.name || 'User'}
    </p>
    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
      NIM: {user?.nim || '-'}
    </p>
  </div>

  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block flex-shrink-0" />
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
            <DropdownMenuItem 
              onClick={() => router.push('/dashboard/settings')}
              className="cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-destructive cursor-pointer hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}