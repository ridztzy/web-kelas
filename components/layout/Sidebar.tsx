"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { logout } from '@/lib/auth';
import {
  Home,
  CheckSquare,
  MessageSquare,
  Users,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  UserCircle,
  BarChart3,
  GraduationCap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push('/');
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
    <Button
      variant={pathname === item.path ? 'default' : 'ghost'}
      className={`w-full justify-start relative group transition-all duration-200 ${
        isCollapsed ? 'px-2' : 'px-3'
      }`}
      onClick={() => {
        router.push(item.path);
        setIsOpen(false);
      }}
    >
      <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
      {!isCollapsed && (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <Badge className="ml-auto text-xs px-1.5 py-0.5 min-w-[20px] h-5">
              {item.badge}
            </Badge>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
          {item.label}
          {item.badge && (
            <Badge className="ml-2 text-xs px-1.5 py-0.5">
              {item.badge}
            </Badge>
          )}
        </div>
      )}
    </Button>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
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
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b border-border ${isCollapsed ? 'px-2' : ''}`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <GraduationCap className="w-8 h-8 text-primary flex-shrink-0" />
                {!isCollapsed && (
                  <div>
                    <h1 className="text-lg font-bold">Sistem Kelas</h1>
                    <p className="text-sm text-muted-foreground">Ilmu Komputer</p>
                  </div>
                )}
              </div>
              
              {/* Collapse button - only on desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex p-1.5"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                )}
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className={`p-4 border-b border-border ${isCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative">
                <UserCircle className="w-10 h-10 text-primary flex-shrink-0" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role?.replace('_', ' ')} • Semester {user?.semester}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 p-4 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
            {menuItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t border-border space-y-1 ${isCollapsed ? 'px-2' : ''}`}>
            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              ) : (
                <Sun className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              )}
              {!isCollapsed && (theme === 'light' ? 'Mode Gelap' : 'Mode Terang')}
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${isCollapsed ? 'px-2' : ''}`}
              onClick={handleLogout}
            >
              <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}