"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, MoreVertical, Search } from 'lucide-react';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
}

export default function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Di aplikasi nyata, Anda mungkin ingin mengangkat state 'searchTerm' ke komponen induk
  // atau menggunakan context jika diperlukan di komponen lain.
  const onlineCount = 5; // Data dummy

  return (
    <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Chat Kelas</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {onlineCount} anggota online
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pesan..."
              className="pl-10 w-48"
            />
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}