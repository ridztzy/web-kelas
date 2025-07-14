"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/auth";
import { subjects } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "@/lib/types";
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
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export default function SubjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State untuk menyimpan data, loading, dan form
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  // State untuk form tambah mata kuliah baru
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    lecturer: "",
    schedule: "",
    credits: 3,
    description: "",
  });

  const canManageSubjects = hasPermission(user?.role || "", [
    "admin",
    "ketua_kelas",
  ]);

  // Fungsi untuk mengambil data mata kuliah dari API
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

  // Panggil fungsi loadSubjects saat komponen pertama kali dimuat
  useEffect(() => {
    loadSubjects();
  }, []);

  // Fungsi untuk membuat mata kuliah baru
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

      // Reset form dan tutup dialog
      setShowCreateDialog(false);
      setNewSubject({
        name: "",
        code: "",
        lecturer: "",
        schedule: "",
        credits: 3,
        description: "",
      });

      // Muat ulang data untuk menampilkan data baru
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

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingSubject.name,
          code: editingSubject.code,
          lecturer: editingSubject.lecturer,
          credits: editingSubject.credits,
          description: editingSubject.description,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Gagal memperbarui mata kuliah.");

      toast({
        title: "Sukses!",
        description: `Mata kuliah "${editingSubject.name}" berhasil diperbarui.`,
      });

      setShowEditDialog(false);
      setEditingSubject(null);
      loadSubjects();
    } catch (error: any) {
      toast({
        title: "Gagal Memperbarui",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/subjects/${deletingSubject.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Gagal menghapus mata kuliah.");

      toast({
        title: "Sukses!",
        description: `Mata kuliah "${deletingSubject.name}" berhasil dihapus.`,
      });

      setShowDeleteDialog(false);
      setDeletingSubject(null);
      loadSubjects();
    } catch (error: any) {
      toast({
        title: "Gagal Menghapus",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // --- HANDLER UNTUK MEMBUKA DIALOG ---
  const openEditDialog = (subject: Subject) => {
    setEditingSubject({ ...subject }); // Salin subject agar tidak mengubah state asli secara langsung
    setShowEditDialog(true);
  };

  const openDeleteDialog = (subject: Subject) => {
    setDeletingSubject(subject);
    setShowDeleteDialog(true);
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.lecturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  {
    /* Loading State */
  }
  {
    loading && (
      <div className="text-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Memuat data mata kuliah...</p>
      </div>
    );
  }

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
              <Button variant="ghost" size="sm" onClick={() => openEditDialog(subject)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(subject)}>
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
            {subject.schedule ? (
              <span className="text-sm">{subject.schedule}</span>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                Jadwal masih belum di atur
              </span>
            )}
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
            <p className="text-muted-foreground">
              Kelola mata kuliah semester ini
            </p>
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
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, name: e.target.value })
                      }
                      placeholder="Contoh: Algoritma dan Struktur Data"
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
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={actionLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleCreateSubject}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Simpan"
                      )}
                    </Button>
                  </div>
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
                  <p className="text-sm text-muted-foreground">
                    Total Mata Kuliah
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {subjects.length}
                  </p>
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
                    {subjects.reduce(
                      (total, subject) => total + subject.credits,
                      0
                    )}
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
                    {new Set(subjects.map((s) => s.lecturer)).size}
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
                    {(
                      subjects.reduce(
                        (total, subject) => total + subject.credits,
                        0
                      ) / subjects.length
                    ).toFixed(1)}
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

      {/* DIALOG UNTUK EDIT */}
      {editingSubject && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Mata Kuliah</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Nama Mata Kuliah</Label>
                <Input
                  id="edit-name"
                  value={editingSubject.name}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Kode Mata Kuliah</Label>
                <Input
                  id="edit-code"
                  value={editingSubject.code}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      code: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-lecturer">Dosen Pengampu</Label>
                <Input
                  id="edit-lecturer"
                  value={editingSubject.lecturer}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      lecturer: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-credits">Jumlah SKS</Label>
                <Input
                  id="edit-credits"
                  type="number"
                  value={editingSubject.credits}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      credits: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={editingSubject.description || ""}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => setEditingSubject(null)}
                  disabled={actionLoading}
                >
                  Batal
                </Button>
              </DialogClose>
              <Button onClick={handleUpdateSubject} disabled={actionLoading}>
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG KONFIRMASI HAPUS */}
      {deletingSubject && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak bisa dibatalkan. Ini akan menghapus mata
                kuliah
                <span className="font-bold"> {deletingSubject.name} </span>{" "}
                secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setDeletingSubject(null)}
                disabled={actionLoading}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSubject}
                disabled={actionLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Ya, Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  );
}
