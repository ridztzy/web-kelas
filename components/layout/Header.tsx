"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth-supabase';
import { Bell, Search, UserCircle, Settings, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, setUser } = useAuth();
  const router = useRouter();

  const notificationCount = 3;

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className="h-16 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold">
            Selamat datang, {user?.name}!
          </h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        
        {/* Mobile greeting */}
        <div className="md:hidden">
          <h2 className="text-base font-semibold">Halo, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari tugas, mata kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-background/50"
            />
          </div>
        </form>

        {/* Mobile search button */}
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Search className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          onClick={() => router.push('/dashboard/notifications')}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
              {notificationCount}
            </Badge>
          )}
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-2">
              <UserCircle className="w-8 h-8 text-primary" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">NIM: {user?.nim}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="w-fit text-xs">
                  {user?.role?.replace('_', ' ')}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}