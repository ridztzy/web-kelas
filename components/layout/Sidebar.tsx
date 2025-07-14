"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { logout } from '@/lib/auth-supabase';
import {
  Home,
  CheckSquare,
  MessageSquare,
  Users,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Sun,
  Moon,
  Bell,
  UserCircle,
  BarChart3,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

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

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', badge: null },
    { icon: CheckSquare, label: 'Tugas', path: '/dashboard/tasks', badge: '3' },
    { icon: MessageSquare, label: 'Chat Kelas', path: '/dashboard/chat', badge: '5' },
    { icon: BookOpen, label: 'Mata Kuliah', path: '/dashboard/subjects', badge: null },
    { icon: Calendar, label: 'Jadwal', path: '/dashboard/schedule', badge: null },
    { icon: Bell, label: 'Notifikasi', path: '/dashboard/notifications', badge: '2' },
  ];

  // Add admin/role-specific menu items
  if (user?.role === 'admin' || user?.role === 'ketua_kelas') {
    menuItems.push(
      { icon: Users, label: 'Manajemen User', path: '/dashboard/users', badge: null },
      { icon: BarChart3, label: 'Analitik', path: '/dashboard/analytics', badge: null }
    );
  }

  menuItems.push({ icon: Settings, label: 'Pengaturan', path: '/dashboard/settings', badge: null });

const MenuItem = ({ item }: { item: any }) => (
  <Link href={item.path} passHref legacyBehavior>
    <Button
      variant={pathname === item.path ? 'default' : 'ghost'}
      className={`w-full justify-start relative group transition-all duration-200 ${
        isCollapsed ? 'px-2' : 'px-3'
      } ${pathname === item.path ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
      onClick={() => {
        // HANYA JALANKAN FUNGSI TAMBAHAN DI SINI
        setIsOpen(false); 
      }}
    >
      {/* ... sisa kode kamu sudah benar ... */}
      <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
      {!isCollapsed && (
        <>
          <span className="truncate text-left flex-1">{item.label}</span>
          {item.badge && (
            <Badge className="ml-2 text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
              {item.badge}
            </Badge>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap border border-border">
          {item.label}
          {item.badge && (
            <Badge className="ml-2 text-xs px-1.5 py-0.5">
              {item.badge}
            </Badge>
          )}
        </div>
      )}
    </Button>
  </Link>
);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-card/95 backdrop-blur-sm border-r border-border z-40
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-0
        ${isCollapsed ? 'w-16' : 'w-64'}
        shadow-xl md:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b border-border ${isCollapsed ? 'px-2' : ''}`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="flex-shrink-0">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold truncate">Sistem Kelas</h1>
                    <p className="text-sm text-muted-foreground truncate">Ilmu Komputer</p>
                  </div>
                )}
              </div>
              
              {/* Collapse button - only on desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex p-1.5 hover:bg-accent"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className={`p-4 border-b border-border ${isCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative flex-shrink-0">
  {/* Logika untuk menampilkan gambar atau ikon */}
  {user?.avatar_url ? (
    <img
      src={user?.avatar_url}
      alt={user?.name || 'Avatar'}
      className="w-10 h-10 rounded-full object-cover"
    />
  ) : (
    <UserCircle className="w-10 h-10 text-primary" />
  )}

  {/* Indikator status online tetap di sini */}
  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
</div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.role?.replace('_', ' ') || 'Student'} • Semester {user?.semester || '1'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 p-4 space-y-2 overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
            {menuItems.map((item, index) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t border-border space-y-2 ${isCollapsed ? 'px-2' : ''}`}>
            <Button
              variant="ghost"
              className={`w-full justify-start hover:bg-accent ${isCollapsed ? 'px-2' : ''}`}
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              ) : (
                <Sun className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              )}
              {!isCollapsed && (
                <span className="truncate">
                  {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${isCollapsed ? 'px-2' : ''}`}
              onClick={handleLogout}
            >
              <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && <span className="truncate">Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}