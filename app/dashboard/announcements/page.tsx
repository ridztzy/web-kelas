"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Megaphone, 
  Loader2, 
  Ban, 
  PlusCircle, 
  Trash2, 
  AlertTriangle,
  CalendarCheck,
  BookOpen,
  Flag,
  Sun,
  Bell,
  ChevronDown,
  CheckCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react';

interface Announcement {
  id: string;
  created_at: string;
  title: string;
  message: string;
  type: string;
  urgent: boolean;
}

const typeIcons = {
  announcement: <Megaphone className="w-4 h-4" />,
  assignment: <BookOpen className="w-4 h-4" />,
  deadline: <CalendarCheck className="w-4 h-4" />,
  exam: <Flag className="w-4 h-4" />,
  holiday: <Sun className="w-4 h-4" />
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-red-50 to-white">
    <div className="p-6 bg-white rounded-full shadow-lg mb-6">
      <Ban className="w-16 h-16 text-red-500" />
    </div>
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
    <p className="text-lg text-gray-600 max-w-md">
      Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika ini sebuah kesalahan.
    </p>
  </div>
);

const AnnouncementForm = ({ onFormSubmit }: { onFormSubmit: () => void }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    message: '', 
    type: 'announcement', 
    urgent: false 
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal membuat pengumuman.");
      
      toast({
        title: "Berhasil",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Pengumuman berhasil dibuat</span>
          </div>
        ),
        className: "border-green-500"
      });
      
      setFormData({ title: '', message: '', type: 'announcement', urgent: false });
      onFormSubmit();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: (
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>{err.message}</span>
          </div>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-3">
        <Label htmlFor="title" className="flex items-center gap-2 text-gray-700">
          <Megaphone className="w-4 h-4" />
          Judul Pengumuman
        </Label>
        <Input 
          id="title" 
          value={formData.title} 
          onChange={(e) => setFormData(p => ({...p, title: e.target.value}))} 
          disabled={isLoading}
          className="focus-visible:ring-2 focus-visible:ring-primary/50"
          placeholder="Masukkan judul pengumuman"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="message" className="flex items-center gap-2 text-gray-700">
          <BookOpen className="w-4 h-4" />
          Isi Pesan
        </Label>
        <Textarea 
          id="message" 
          value={formData.message} 
          onChange={(e) => setFormData(p => ({...p, message: e.target.value}))} 
          disabled={isLoading}
          className="min-h-[120px] focus-visible:ring-2 focus-visible:ring-primary/50"
          placeholder="Tulis isi pengumuman di sini..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="type" className="flex items-center gap-2 text-gray-700">
            <Flag className="w-4 h-4" />
            Tipe Pengumuman
          </Label>
          <Select 
            value={formData.type} 
            onValueChange={(v: any) => setFormData(p => ({...p, type: v}))} 
            disabled={isLoading}
          >
            <SelectTrigger className="focus:ring-2 focus:ring-primary/50">
              <div className="flex items-center gap-2">
                {typeIcons[formData.type as keyof typeof typeIcons]}
                <SelectValue placeholder="Pilih tipe" />
              </div>
            </SelectTrigger>
            <SelectContent className="border border-gray-200 shadow-lg">
              <SelectItem value="announcement" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> Umum
              </SelectItem>
              <SelectItem value="assignment" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Tugas
              </SelectItem>
              <SelectItem value="deadline" className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" /> Deadline
              </SelectItem>
              <SelectItem value="exam" className="flex items-center gap-2">
                <Flag className="w-4 h-4" /> Ujian
              </SelectItem>
              <SelectItem value="holiday" className="flex items-center gap-2">
                <Sun className="w-4 h-4" /> Libur
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-gray-700">
            <Bell className="w-4 h-4" />
            Status
          </Label>
          <div className="flex items-center gap-3 p-2 border rounded-md bg-gray-50">
            <Switch 
              id="urgent" 
              checked={formData.urgent} 
              onCheckedChange={(c) => setFormData(p => ({...p, urgent: c}))} 
              disabled={isLoading}
              className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-300"
            />
            <Label htmlFor="urgent" className={formData.urgent ? "text-red-500 font-medium" : "text-gray-600"}>
              {formData.urgent ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Penting!
                </span>
              ) : "Normal"}
            </Label>
          </div>
        </div>
      </div>
      
      <DialogFooter className="gap-2 pt-4">
        <DialogClose asChild>
          <Button 
            type="button" 
            variant="outline" 
            disabled={isLoading}
            className="border-gray-300 hover:bg-gray-50"
          >
            Batal
          </Button>
        </DialogClose>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Publikasikan
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function ManageAnnouncementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const allowedRoles = ['admin', 'ketua_kelas', 'sekretaris'];

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/announcements');
      if (!response.ok) throw new Error('Gagal memuat data.');
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Gagal Memuat Data",
        description: (
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>{error instanceof Error ? error.message : 'Terjadi kesalahan.'}</span>
          </div>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return;
    try {
      const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus.');
      toast({
        title: 'Berhasil',
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Pengumuman berhasil dihapus.</span>
          </div>
        ),
        className: "border-green-500"
      });
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus',
        description: (
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>{error instanceof Error ? error.message : 'Terjadi kesalahan.'}</span>
          </div>
        ),
      });
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || announcement.type === filterType;
    return matchesSearch && matchesType;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      {allowedRoles.includes(user.role || '') ? (
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-primary" />
                    Manajemen Pengumuman
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Kelola semua pengumuman untuk komunitas Anda
                  </CardDescription>
                </div>
                
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="shadow-md bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                      <PlusCircle className="mr-2 h-4 w-4" /> 
                      Buat Pengumuman
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] rounded-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-gray-800">
                        <Megaphone className="w-5 h-5 text-primary" />
                        Buat Pengumuman Baru
                      </DialogTitle>
                    </DialogHeader>
                    <AnnouncementForm onFormSubmit={() => {
                      fetchAnnouncements();
                      setIsModalOpen(false);
                    }} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari pengumuman..."
                      className="pl-10 pr-4 py-2 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="pl-3 pr-2 py-2 w-full md:w-[200px]">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-500" />
                          <span>{filterType === 'all' ? 'Semua Tipe' : filterType}</span>
                          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border border-gray-200 shadow-lg">
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="announcement">Umum</SelectItem>
                        <SelectItem value="assignment">Tugas</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="exam">Ujian</SelectItem>
                        <SelectItem value="holiday">Libur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[40%]">Judul</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-gray-600">Memuat data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAnnouncements.length > 0 ? (
                      filteredAnnouncements.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {typeIcons[item.type as keyof typeof typeIcons]}
                              <div>
                                <p className="font-medium text-gray-800">{item.title}</p>
                                <p className="text-sm text-gray-500 line-clamp-1">{item.message}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.urgent ? 'destructive' : 'outline'} 
                              className="flex items-center gap-1.5"
                            >
                              {typeIcons[item.type as keyof typeof typeIcons]}
                              {item.type}
                              {item.urgent && <AlertTriangle className="w-3 h-3" />}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {new Date(item.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(item.id)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Megaphone className="h-8 w-8 text-gray-400" />
                            <span className="text-gray-600">
                              {searchTerm || filterType !== 'all' 
                                ? "Tidak ada pengumuman yang cocok dengan filter" 
                                : "Belum ada pengumuman"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <AccessDenied />
      )}
    </DashboardLayout>
  );
}