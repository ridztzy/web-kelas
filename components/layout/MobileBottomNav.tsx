"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  CheckSquare, 
  MessageSquare, 
  BookOpen, 
  Calendar,
  Bell,
  Users,
  Settings,
  BarChart3
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: string;
  requiresPermission?: string[];
}

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const baseNavItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tugas', path: '/dashboard/tasks', badge: '3' },
    { icon: MessageSquare, label: 'Chat', path: '/dashboard/chat', badge: '5' },
    { icon: BookOpen, label: 'Kuliah', path: '/dashboard/subjects' },
    { icon: Settings, label: 'Lainnya', path: '/dashboard/settings' },
  ];

  // Add admin/role-specific items
  const adminItems: NavItem[] = [];
  if (hasPermission(user?.role || '', ['admin', 'ketua_kelas'])) {
    adminItems.push(
      { icon: Users, label: 'Users', path: '/dashboard/users', requiresPermission: ['admin', 'ketua_kelas'] },
      { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics', requiresPermission: ['admin', 'ketua_kelas'] }
    );
  }

  // Combine and limit to 5 items for mobile
  const allItems = [...baseNavItems, ...adminItems];
  const navItems = allItems.slice(0, 5);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 relative ${
                active 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 ${active ? 'text-primary' : ''}`} />
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 w-4 h-4 rounded-full p-0 flex items-center justify-center text-xs min-w-[16px]">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs font-medium truncate max-w-full ${
                active ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}