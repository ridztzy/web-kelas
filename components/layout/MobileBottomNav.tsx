"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  CheckSquare, 
  MessageSquare, 
  Search,
  User,
  Bell,
  Users,
  Settings,
  BarChart3,
  Calendar,
  BookOpen
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

  // Base navigation items for all users
  const baseNavItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tugas', path: '/dashboard/tasks', badge: '3' },
    { icon: Search, label: 'Cari', path: '/dashboard/search' },
    { icon: MessageSquare, label: 'Chat', path: '/dashboard/chat', badge: '5' },
    { icon: User, label: 'Profil', path: '/dashboard/profile' },
  ];

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {baseNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-0 flex-1 relative group ${
                active 
                  ? 'bg-primary text-white shadow-lg scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                {item.badge && !active && (
                  <Badge className="absolute -top-2 -right-2 w-4 h-4 rounded-full p-0 flex items-center justify-center text-xs min-w-[16px] bg-red-500">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs font-medium truncate max-w-full transition-all duration-200 ${
                active ? 'text-white font-semibold' : 'text-gray-600 dark:text-gray-400 group-hover:text-primary'
              }`}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}