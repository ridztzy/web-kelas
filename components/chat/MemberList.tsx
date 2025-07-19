"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, X } from 'lucide-react';

// Data dummy, idealnya ini datang dari state management atau props
const onlineMembers = [
    { id: "1", name: "Ahmad Rizki", role: "admin", status: "online" },
    { id: "2", name: "Siti Nurhaliza", role: "ketua_kelas", status: "online" },
    { id: "3", name: "Budi Santoso", role: "sekretaris", status: "away" },
    { id: "4", name: "Dewi Sartika", role: "mahasiswa", status: "online" },
];

const getRoleText = (role: string) => {
    switch(role) {
        case "admin": return "Admin";
        case "ketua_kelas": return "Ketua Kelas";
        case "sekretaris": return "Sekretaris";
        default: return "Mahasiswa";
    }
};

interface MemberListProps {
  showSidebar: boolean;
  onClose: () => void;
}

const MemberListContent = () => (
    <div className="p-4 space-y-4">
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base"><Users className="w-4 h-4 mr-2" />Anggota ({onlineMembers.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {onlineMembers.map((member) => (
          <div key={member.id} className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-8 h-8"><AvatarFallback>{member.name.charAt(0)}</AvatarFallback></Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground">{getRoleText(member.role)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default function MemberList({ showSidebar, onClose }: MemberListProps) {
  // Sidebar Desktop
  return (
    <>
      <div className="hidden lg:block w-80 border-l bg-gray-50 dark:bg-gray-900/50">
        <MemberListContent />
      </div>

      {/* Sidebar Mobile */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Anggota Kelas</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="w-5 h-5" /></Button>
            </div>
            <div className="h-[calc(100%-57px)] overflow-y-auto">
              <MemberListContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}