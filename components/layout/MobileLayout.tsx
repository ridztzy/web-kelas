"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import { Loader2 } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 pt-16">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}