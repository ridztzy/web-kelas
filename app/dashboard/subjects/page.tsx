"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { subjects } from '@/lib/data';
import { Subject } from '@/lib/types';
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  User,
  Calendar,
  GraduationCap,
  Edit,
  Trash2,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';

export default function SubjectsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    lecturer: '',
    schedule: '',
    credits: 3,
    description: ''
  });

  const canManageSubjects = hasPermission(user?.role || '', ['admin', 'ketua_kelas']);

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.lecturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubject = () => {
    console.log('Creating subject:', newSubject);
    setNewSubject({
      name: '',
      code: '',
      lecturer: '',
      schedule: '',
      credits: 3,
      description: ''
    });
  };

  const SubjectCard = ({ subject }: { subject: Subject }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              {subject.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {subject.code}
            </Badge>
          </div>
          {canManageSubjects && (
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{subject.lecturer}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{subject.schedule}</span>
          </div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{subject.credits} SKS</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">32 Mahasiswa</span>
          </div>
        </div>
        
        {subject.description && (
          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            {subject.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Materi
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Jadwal
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mata Kuliah</h1>
            <p className="text-muted-foreground">Kelola mata kuliah semester ini</p>
          </div>
          
          {canManageSubjects && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Mata Kuliah
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Mata Kuliah Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Mata Kuliah</Label>
                    <Input
                      id="name"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                      placeholder="Contoh: Algoritma dan Struktur Data"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="code">Kode Mata Kuliah</Label>
                    <Input
                      id="code"
                      value={newSubject.code}
                      onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                      placeholder="Contoh: CS201"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lecturer">Dosen Pengampu</Label>
                    <Input
                      id="lecturer"
                      value={newSubject.lecturer}
                      onChange={(e) => setNewSubject({...newSubject, lecturer: e.target.value})}
                      placeholder="Nama dosen"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="schedule">Jadwal</Label>
                    <Input
                      id="schedule"
                      value={newSubject.schedule}
                      onChange={(e) => setNewSubject({...newSubject, schedule: e.target.value})}
                      placeholder="Contoh: Senin 08:00-10:00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="credits">Jumlah SKS</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject({...newSubject, credits: parseInt(e.target.value)})}
                      min="1"
                      max="6"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={newSubject.description}
                      onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                      placeholder="Deskripsi mata kuliah"
                    />
                  </div>
                  
                  <Button onClick={handleCreateSubject} className="w-full">
                    Simpan Mata Kuliah
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari mata kuliah, kode, atau dosen..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Mata Kuliah</p>
                  <p className="text-2xl font-bold text-blue-600">{subjects.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total SKS</p>
                  <p className="text-2xl font-bold text-green-600">
                    {subjects.reduce((total, subject) => total + subject.credits, 0)}
                  </p>
                </div>
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dosen Aktif</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(subjects.map(s => s.lecturer)).size}
                  </p>
                </div>
                <User className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata SKS</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(subjects.reduce((total, subject) => total + subject.credits, 0) / subjects.length).toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}