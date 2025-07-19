"use client";

import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Subject, Schedule } from "@/lib/types";
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
  BarChart3,
  Loader2,
  X,
  MapPin
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SubjectWithSchedules = Subject & {
  schedules: Pick<Schedule, 'day' | 'start_time' | 'end_time'>[];
};

export default function SubjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<SubjectWithSchedules[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    lecturer: "",
    credits: 3,
    description: "",
  });

  const canManageSubjects = hasPermission(user?.role || "", [
    "admin",
    "ketua_kelas",
  ]);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subjects");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengambil data mata kuliah");
      }

      setSubjects(result.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleCreateSubject = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubject),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menambahkan mata kuliah baru.");
      }

      toast({
        title: "Sukses!",
        description: `Mata kuliah "${newSubject.name}" berhasil ditambahkan.`,
      });

      setShowCreateDialog(false);
      setNewSubject({
        name: "",
        code: "",
        lecturer: "",
        credits: 3,
        description: "",
      });
      loadSubjects();
    } catch (error: any) {
      toast({
        title: "Gagal Menambahkan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.lecturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SubjectCard = ({ subject }: { subject: SubjectWithSchedules }) => (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {subject.name}
                </h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {subject.code}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">{subject.lecturer}</span>
          </div>
          
          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col space-y-1">
              {subject.schedules && subject.schedules.length > 0 ? (
                subject.schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {schedule.day}, {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">
                  Jadwal belum diatur
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{subject.credits} SKS</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">32 Mahasiswa</span>
              </div>
            </div>
          </div>
        </div>

        {subject.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-3">
            {subject.description}
          </p>
        )}

        <div className="flex space-x-2 pt-3">
          <Button variant="outline" size="sm" className="flex-1 rounded-lg">
            <FileText className="w-4 h-4 mr-2" />
            Materi
          </Button>
          <Button variant="outline" size="sm" className="flex-1 rounded-lg">
            <Calendar className="w-4 h-4 mr-2" />
            Jadwal
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mx-4 mt-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mata Kuliah</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredSubjects.length} mata kuliah
            </p>
          </div>
          {canManageSubjects && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full w-12 h-12 shadow-lg">
                  <Plus className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Mata Kuliah</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Nama Mata Kuliah</Label>
                    <Input
                      id="name"
                      value={newSubject.name}
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, name: e.target.value })
                      }
                      placeholder="Contoh: Algoritma dan Struktur Data"
                      className="mobile-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="code">Kode Mata Kuliah</Label>
                    <Input
                      id="code"
                      value={newSubject.code}
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, code: e.target.value })
                      }
                      placeholder="Contoh: CS201"
                      className="mobile-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lecturer">Dosen Pengampu</Label>
                    <Input
                      id="lecturer"
                      value={newSubject.lecturer}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          lecturer: e.target.value,
                        })
                      }
                      placeholder="Nama dosen"
                      className="mobile-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="credits">Jumlah SKS</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={newSubject.credits}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          credits: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="6"
                      className="mobile-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={newSubject.description}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          description: e.target.value,
                        })
                      }
                      placeholder="Deskripsi mata kuliah"
                      className="mobile-input"
                    />
                  </div>

                  <Button
                    onClick={handleCreateSubject}
                    className="w-full mobile-button"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="mx-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari mata kuliah, kode, atau dosen..."
              className="pl-12 mobile-input"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8"
                onClick={() => setSearchTerm('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Total Mata Kuliah</p>
                    <p className="text-2xl font-bold text-blue-600">{subjects.length}</p>
                  </div>
                  <BookOpen className="w-6 h-6 text-blue-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-medium">Total SKS</p>
                    <p className="text-2xl font-bold text-green-600">
                      {subjects.reduce((total, subject) => total + subject.credits, 0)}
                    </p>
                  </div>
                  <GraduationCap className="w-6 h-6 text-green-600 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subjects List */}
        <div className="mx-4 space-y-3">
          {filteredSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>

        {filteredSubjects.length === 0 && !loading && (
          <div className="mx-4">
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                  Tidak ada mata kuliah
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? "Tidak ada mata kuliah yang cocok dengan pencarian" 
                    : "Belum ada mata kuliah yang ditambahkan"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}