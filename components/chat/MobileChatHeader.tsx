"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Search, Users, Phone, Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MobileChatHeader() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const onlineCount = 5; // Data dummy

  return (
    <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {showSearch ? (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pesan..."
              className="pl-10 rounded-full"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSearch(false);
              setSearchTerm("");
            }}
            className="rounded-full"
          >
            Batal
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Chat Kelas</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {onlineCount} anggota online
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10"
            >
              <Phone className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10"
            >
              <Video className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Lihat Anggota</DropdownMenuItem>
                <DropdownMenuItem>Pengaturan Chat</DropdownMenuItem>
                <DropdownMenuItem>Hapus Riwayat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}