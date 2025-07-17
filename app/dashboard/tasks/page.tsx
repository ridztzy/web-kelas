"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/auth";
import { Task, Subject } from "@/lib/types"; // Asumsikan Task di sini adalah tipe dasar
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  User,
  BookOpen,
  MoreHorizontal,
  Trash2,
  Loader2,
  Pencil,
} from "lucide-react";

import { format } from "date-fns";

// --- PERUBAHAN 1: TIPE DATA BARU SESUAI STRUKTUR DATABASE ---
// Tipe untuk entri di tabel 'task_submissions'
type Submission = {
  id: string;
  status: "pending" | "in_progress" | "completed";
  user_id: string;
};

type TaskWithDetails = Task & {
  // --- TAMBAHKAN ATAU PASTIKAN ADA PROPERTI INI ---
  updated_at: string; // Wajib ada
  created_at: string; // Wajib ada
  editor: { id: string; name: string; role: string } | null; // Info user yang mengedit
  // ---------------------------------------------
  subjects: { id: string; name: string; lecturer: string } | null;
  assigner: { id: string; name: string; role: string } | null;
  task_submissions: Submission[];
};

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("semua");
  const [filterPriority, setFilterPriority] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [taskToView, setTaskToView] = useState<TaskWithDetails | null>(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithDetails | null>(
    null
  );

  // State utama untuk mengontrol fase ejekan
  const [annoyPhase, setAnnoyPhase] = useState<"idle" | "faking" | "running">(
    "idle"
  );
  // State untuk progress bar palsu
  const [fakeProgress, setFakeProgress] = useState(0);
  const [fakeMessage, setFakeMessage] = useState("Menghubungi server...");
  // State untuk tombol kabur
  const [runawayClicks, setRunawayClicks] = useState(0);
  const [buttonPosition, setButtonPosition] = useState({
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "sedang" as "rendah" | "sedang" | "tinggi",
    type: "pribadi" as "pribadi" | "kelas",
    subject_id: "",
  });

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithDetails | null>(null);
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "sedang" as "rendah" | "sedang" | "tinggi",
    subject_id: "",
  });

  const canCreateClassTasks = hasPermission(user?.role || "", [
    "admin",
    "ketua_kelas",
    "sekretaris",
  ]);

  // Fungsi untuk memuat semua data yang dibutuhkan
  const loadData = async () => {
    setLoading(true);
    try {
      // Backend /api/tasks (GET) sudah dimodifikasi untuk mengembalikan data dengan struktur baru
      const [tasksRes, subjectsRes] = await Promise.all([
        fetch("/api/tasks", { credentials: "include" }),
        fetch("/api/subjects", { credentials: "include" }),
      ]);

      if (!tasksRes.ok) throw new Error("Gagal memuat tugas");
      if (!subjectsRes.ok) throw new Error("Gagal memuat mata kuliah");

      const tasksData = await tasksRes.json();
      const subjectsData = await subjectsRes.json();

      // Tidak perlu filter di frontend lagi, karena backend sudah melakukannya
      setTasks(tasksData.data || []);
      setSubjects(subjectsData.data || []);
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
    if (user) loadData();
  }, [user]);

  // Lokasi: Dekat useEffect utama
  // Lokasi: Dekat useEffect lainnya

  useEffect(() => {
    if (annoyPhase === "faking") {
      // Reset state setiap kali fase 'faking' dimulai
      setFakeProgress(0);
      setFakeMessage("Menghubungi server...");

      const timer = setInterval(() => {
        setFakeProgress((prev) => {
          const nextProgress = prev + Math.random() * 10;

          if (nextProgress >= 99) {
            clearInterval(timer);
            setFakeMessage("GAGAL! Akses ditolak mentah-mentah.");

            // Setelah 1.5 detik, ganti fase ke tombol kabur
            setTimeout(() => {
              setAnnoyPhase("running");
            }, 1500);

            return 99;
          }

          if (nextProgress > 70)
            setFakeMessage("Memeriksa izin... kayaknya nggak punya deh.");
          else if (nextProgress > 30)
            setFakeMessage("Menghapus file penting...");

          return nextProgress;
        });
      }, 400);

      return () => clearInterval(timer);
    }
  }, [annoyPhase]);

  const handleCreateTask = async () => {
    if (!user) return;
    if (!newTask.title.trim() || !newTask.due_date) {
      toast({
        title: "Error",
        description: "Judul dan deadline harus diisi.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading("create");
    try {
      // Payload ini sudah benar untuk backend baru kita
      const payload = {
        title: newTask.title,
        description: newTask.description,
        due_date: new Date(newTask.due_date).toISOString(),
        priority: newTask.priority,
        type: newTask.type,
        subject_id: newTask.subject_id ? newTask.subject_id : null,
        assigned_by: user.id,
        // Jika pribadi, assigned_to adalah user.id. Jika kelas, assigned_to adalah null.
        assigned_to: newTask.type === "pribadi" ? user.id : null,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal membuat tugas.");

      toast({ title: "Sukses", description: "Tugas baru berhasil dibuat." });
      setShowCreateDialog(false);
      setNewTask({
        title: "",
        description: "",
        due_date: "",
        priority: "sedang",
        type: "pribadi",
        subject_id: "",
      });
      loadData(); // Memuat ulang data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditTask = async () => {
    if (!taskToEdit) return;
    if (!editTask.title.trim() || !editTask.due_date) {
      toast({
        title: "Error",
        description: "Judul dan deadline harus diisi.",
        variant: "destructive",
      });
      return;
    }
    setActionLoading(`edit-${taskToEdit.id}`);
    try {
      const payload = {
        title: editTask.title,
        description: editTask.description,
        due_date: new Date(editTask.due_date).toISOString(),
        priority: editTask.priority,
        subject_id: editTask.subject_id ? editTask.subject_id : null,
      };
      const response = await fetch(`/api/tasks/${taskToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Gagal mengedit tugas.");

      toast({ title: "Sukses", description: "Tugas berhasil diupdate." });
      setShowEditDialog(false);
      setTaskToEdit(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // --- PERUBAHAN 2: FUNGSI UPDATE STATUS MENARGETKAN SUBMISSION ---
  const handleUpdateTaskStatus = async (
    submissionId: string,
    newStatus: "pending" | "in_progress" | "completed"
  ) => {
    setActionLoading(`status-${submissionId}`);
    try {
      // Endpoint API baru untuk mengupdate status di tabel 'task_submissions'
      const response = await fetch(`/api/tasks/submissions/${submissionId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal memperbarui status tugas.");
      }

      toast({ title: "Sukses", description: "Status tugas diperbarui." });
      loadData(); // Memuat ulang data untuk menampilkan status terbaru
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openDetailDialog = (task: TaskWithDetails) => {
    setTaskToView(task);
    setShowDetailDialog(true);
  };

  const openEditDialog = (task: TaskWithDetails) => {
    setTaskToEdit(task);
    setEditTask({
      title: task.title,
      description: task.description || "",
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      priority: task.priority,
      subject_id: task.subjects?.id || "",
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (task: TaskWithDetails) => {
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  };

  // Lokasi: Dekat dialog-dialog lainnya
  const closeAnnoyDialog = () => {
    setAnnoyPhase("idle");
    setRunawayClicks(0);
    // TAMBAHKAN BARIS INI untuk mereset posisi tombol ke tengah
    setButtonPosition({
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    });
  };

  // Fungsi untuk membuat tombol kabur
  const handleButtonEscape = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const screenCenterX = screenWidth / 2;
    const screenCenterY = screenHeight / 2;

    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    let targetQuadrantX: "left" | "right" =
      buttonCenterX < screenCenterX ? "right" : "left";
    let targetQuadrantY: "top" | "bottom" =
      buttonCenterY < screenCenterY ? "bottom" : "top";

    const margin = 40; // aman dari tepi
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;

    let newTop: number;
    let newLeft: number;

    // Y axis (top / bottom)
    if (targetQuadrantY === "top") {
      newTop = Math.max(
        margin,
        Math.random() * (screenCenterY - buttonHeight - margin)
      );
    } else {
      newTop = Math.min(
        screenHeight - buttonHeight - margin,
        screenCenterY + Math.random() * (screenCenterY - buttonHeight - margin)
      );
    }

    // X axis (left / right)
    if (targetQuadrantX === "left") {
      newLeft = Math.max(
        margin,
        Math.random() * (screenCenterX - buttonWidth - margin)
      );
    } else {
      newLeft = Math.min(
        screenWidth - buttonWidth - margin,
        screenCenterX + Math.random() * (screenCenterX - buttonWidth - margin)
      );
    }

    setButtonPosition({
      top: `${newTop}px`,
      left: `${newLeft}px`,
      transform: "translate(0, 0)",
    });
  };

  // Fungsi yang dipanggil saat tombol kabur di-klik
  const handleRunawayClick = (e: React.MouseEvent<HTMLElement>) => {
    // Ganti batasnya menjadi 7
    if (runawayClicks >= 6) {
      // >= 6 karena klik ke-7 akan jadi yang terakhir
      alert("Astaga, kamu gigih juga ya... Oke, aku nyerah.");
      closeAnnoyDialog();
    } else {
      setRunawayClicks((prev) => prev + 1);
      handleButtonEscape(e);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setActionLoading(`delete-${taskToDelete.id}`);
    try {
      // Menghapus master task akan otomatis menghapus semua submission terkait (karena ON DELETE CASCADE)
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Gagal menghapus tugas.");
      }

      toast({ title: "Sukses", description: "Tugas berhasil dihapus." });
      setShowDeleteDialog(false);
      setTaskToDelete(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // --- PERUBAHAN 3: LOGIKA FILTER DISESUAIKAN ---
  const filteredTasks = tasks.filter((task) => {
    const userSubmission = task.task_submissions[0];
    const status = userSubmission?.status || "pending";

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "semua" || task.type === filterType;
    const matchesPriority =
      filterPriority === "semua" || task.priority === filterPriority;
    const matchesStatus = filterStatus === "semua" || status === filterStatus;

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const personalTasks = filteredTasks.filter((task) => task.type === "pribadi");
  const classTasks = filteredTasks.filter((task) => task.type === "kelas");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "tinggi":
        return "destructive";
      case "sedang":
        return "default";
      default:
        return "secondary";
    }
  };

  // --- PERUBAHAN 4: TASKCARD MENGGUNAKAN DATA SUBMISSION ---
  // --- GANTI SELURUH FUNGSI TaskCard DENGAN INI ---
  const TaskCard = ({ task }: { task: TaskWithDetails }) => {
    const userSubmission = task.task_submissions[0];
    const status = userSubmission?.status || "pending";
    const canManageTask = (task: TaskWithDetails) =>
      user &&
      (user.id === task.assigned_by ||
        ["admin", "ketua_kelas", "sekretaris"].includes(user.role));

    // --- LOGIKA BARU UNTUK STATUS BARU & DIUBAH ---
    const isNew = () => {
      if (!task.created_at) return false;
      const twoDaysInMs = 48 * 60 * 60 * 1000;
      return (
        new Date().getTime() - new Date(task.created_at).getTime() < twoDaysInMs
      );
    };

    // Logika untuk cek apakah sudah diubah
    // Dianggap 'diubah' jika waktu update > 1 menit setelah dibuat
    const isEdited = () => {
      if (!task.created_at || !task.updated_at) return false;
      const createdAt = new Date(task.created_at).getTime();
      const updatedAt = new Date(task.updated_at).getTime();
      return updatedAt > createdAt + 60000; // Toleransi 1 menit
    };

    const taskIsEdited = isEdited();
    // Tugas hanya dianggap 'baru' jika belum pernah diedit
    const taskIsNew = isNew() && !taskIsEdited;

    return (
      <Card
        onClick={() => openDetailDialog(task)}
        className="cursor-pointer hover:shadow-lg transition-all duration-200 group flex flex-col h-full"
      >
        <CardContent className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 pt-1">
                  {getStatusIcon(status)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-start flex-wrap gap-2">
                    {taskIsNew && (
                      <Badge className="bg-red-500 text-white whitespace-nowrap">
                        Baru
                      </Badge>
                    )}
                    {taskIsEdited && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500 whitespace-nowrap"
                      >
                        Diedit
                      </Badge>
                    )}
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {task.title}
                    </h3>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!!actionLoading || !userSubmission}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userSubmission && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateTaskStatus(
                            userSubmission.id,
                            "in_progress"
                          );
                        }}
                      >
                        <Clock className="w-4 h-4 mr-2" /> Mulai Kerjakan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateTaskStatus(
                            userSubmission.id,
                            "completed"
                          );
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Tandai Selesai
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {canManageTask(task) && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(task);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Edit Tugas
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canManageTask(task)) {
                        openDeleteDialog(task);
                      } else {
                        setAnnoyPhase("faking");
                      }
                    }}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus Tugas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description || "Tidak ada deskripsi."}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="capitalize">
                {task.type}
              </Badge>
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {task.subjects && (
                <Badge variant="secondary" className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {task.subjects.name}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                <span
                  className={`${
                    task.due_date &&
                    new Date(task.due_date) < new Date() &&
                    status !== "completed"
                      ? "text-destructive font-medium"
                      : ""
                  }`}
                >
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Tanpa batas waktu"}
                </span>
              </div>
              {task.type === "kelas" && task.assigner && (
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  {task.type === "kelas" && task.assigner && (
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Oleh: {task.assigner.name}
                      <Badge
                        variant="secondary"
                        className="bg-gray-500 text-white ml-2 flex items-center"
                      >
                        {task.assigner.role}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 w-full bg-muted rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  status === "completed"
                    ? "bg-green-500 w-full"
                    : status === "in_progress"
                    ? "bg-blue-500 w-1/2"
                    : "bg-gray-300 w-0"
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  // --- BATAS PERUBAHAN ---

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ... Bagian Header dan Tombol Tambah Tugas (tidak ada perubahan signifikan) ... */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Tugas</h1>
            <p className="text-muted-foreground">
              Kelola tugas pribadi dan tugas kelas
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tugas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Tugas Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Form input tidak ada perubahan */}
                <div>
                  <Label htmlFor="title">Judul Tugas</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Masukkan judul tugas"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Deskripsi tugas"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Tanggal Deadline</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, due_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioritas</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rendah">Rendah</SelectItem>
                      <SelectItem value="sedang">Sedang</SelectItem>
                      <SelectItem value="tinggi">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Jenis Tugas</Label>
                  <Select
                    value={newTask.type}
                    onValueChange={(value: any) =>
                      setNewTask({ ...newTask, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pribadi">Pribadi</SelectItem>
                      {canCreateClassTasks && (
                        <SelectItem value="kelas">Kelas</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {newTask.type === "kelas" && (
                  <div>
                    <Label htmlFor="subject">Mata Kuliah (Opsional)</Label>
                    <Select
                      value={newTask.subject_id || "none"}
                      onValueChange={(value) =>
                        setNewTask({
                          ...newTask,
                          subject_id: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mata kuliah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tanpa Mata Kuliah</SelectItem>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  onClick={handleCreateTask}
                  className="w-full"
                  disabled={actionLoading === "create"}
                >
                  {actionLoading === "create" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan Tugas"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ... Bagian Filter (tidak ada perubahan signifikan) ... */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search">Cari Tugas</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari tugas..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="filterType">Jenis</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="pribadi">Pribadi</SelectItem>
                    <SelectItem value="kelas">Kelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterPriority">Prioritas</Label>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="rendah">Rendah</SelectItem>
                    <SelectItem value="sedang">Sedang</SelectItem>
                    <SelectItem value="tinggi">Tinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterStatus">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">Dikerjakan</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ... Bagian Tabs dan daftar tugas ... */}
        <Tabs defaultValue="semua" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="semua">
              Semua Tugas ({filteredTasks.length})
            </TabsTrigger>
            <TabsTrigger value="pribadi">
              Pribadi ({personalTasks.length})
            </TabsTrigger>
            <TabsTrigger value="kelas">Kelas ({classTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="semua" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="pribadi" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="kelas" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ... Dialog konfirmasi hapus (tidak ada perubahan) ... */}
      {taskToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tugas "
                {taskToDelete.title}" secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowDeleteDialog(false);
                  setTaskToDelete(null);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTask}
                disabled={!!actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* DIALOG EJEKAN TERPUSAT */}
      {/* DIALOG EJEKAN DENGAN MODE EKSTREM */}
      <Dialog
        open={annoyPhase !== "idle"}
        onOpenChange={(open) => !open && closeAnnoyDialog()}
      >
        <DialogContent
          className="max-w-sm dialog-kabur"
          onInteractOutside={(e) => {
            // Mencegah dialog tertutup saat klik di luar
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            // Mencegah dialog tertutup saat tombol Escape ditekan
            e.preventDefault();
          }}
        >
          {annoyPhase === "faking" && (
            // ... (konten progress bar tidak berubah) ...
            <>
              <DialogHeader>
                <DialogTitle>Menghapus Tugas...</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-center text-muted-foreground min-h-[40px]">
                  {fakeMessage}
                </p>
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      fakeProgress < 99 ? "bg-primary" : "bg-destructive"
                    }`}
                    style={{ width: `${fakeProgress}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {annoyPhase === "running" && (
            <div className="h-[250px] relative p-4 flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-bold mb-2">Tertangkap! 😜</h3>
              <p className="text-muted-foreground mb-4">
                Udah dibilang nggak bisa, masih nekat. Sekarang coba tutup
                dialog ini kalau bisa!
              </p>
              <Button
                onClick={handleRunawayClick}
                style={{
                  position: "absolute",
                  top: buttonPosition.top,
                  left: buttonPosition.left,
                  transform: buttonPosition.transform,
                  // PERCEPAT TRANSISI GERAKANNYA
                  transition: "top 0.15s ease-out, left 0.15s ease-out",
                }}
              >
                {/* Pesan tombol yang lebih memotivasi untuk menyerah */}
                {runawayClicks < 2
                  ? "Tutup"
                  : runawayClicks < 5
                  ? "Lagi dong!"
                  : "Hampir!"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tugas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Judul Tugas</Label>
              <Input
                id="edit-title"
                value={editTask.title}
                onChange={(e) =>
                  setEditTask({ ...editTask, title: e.target.value })
                }
                placeholder="Masukkan judul tugas"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={editTask.description}
                onChange={(e) =>
                  setEditTask({ ...editTask, description: e.target.value })
                }
                placeholder="Deskripsi tugas"
              />
            </div>
            <div>
              <Label htmlFor="edit-dueDate">Tanggal Deadline</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={editTask.due_date}
                onChange={(e) =>
                  setEditTask({ ...editTask, due_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-priority">Prioritas</Label>
              <Select
                value={editTask.priority}
                onValueChange={(value: any) =>
                  setEditTask({ ...editTask, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rendah">Rendah</SelectItem>
                  <SelectItem value="sedang">Sedang</SelectItem>
                  <SelectItem value="tinggi">Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-subject">Mata Kuliah (Opsional)</Label>
              <Select
                value={editTask.subject_id || "none"}
                onValueChange={(value) =>
                  setEditTask({
                    ...editTask,
                    subject_id: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata kuliah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Mata Kuliah</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleEditTask}
              className="w-full"
              disabled={actionLoading === `edit-${taskToEdit?.id}`}
            >
              {actionLoading === `edit-${taskToEdit?.id}` ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          {taskToView && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {taskToView.title}
                </DialogTitle>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="secondary" className="capitalize">
                    {taskToView.type}
                  </Badge>
                  <Badge variant={getPriorityColor(taskToView.priority)}>
                    {taskToView.priority}
                  </Badge>
                  {taskToView.subjects && (
                    <Badge variant="secondary" className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {taskToView.subjects.name}
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {taskToView.description ||
                    "Tidak ada deskripsi untuk tugas ini."}
                </p>
                <hr />
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <strong>Deadline:</strong>&nbsp;
                    {taskToView.due_date
                      ? new Date(taskToView.due_date).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "Tanpa batas waktu"}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <strong>Dosen Pengampu:</strong>&nbsp;
                    {taskToView.subjects?.lecturer || "Tidak diketahui"}
                  </div>
                  {taskToView.type === "kelas" && taskToView.assigner && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <strong>Dibuat oleh:</strong>&nbsp;
                      {taskToView.assigner.name}
                      <h3 className=" text-muted-foreground ml-2">
                        {taskToView.created_at &&
                          new Date(taskToView.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "2-digit", // atau "numeric" kalau tidak ingin 0 di depan
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-gray-500 text-white ml-2 flex items-center"
                      >
                        {taskToView.assigner.role}
                      </Badge>
                    </div>
                  )}
                  {new Date(taskToView.updated_at).getTime() >
                    new Date(taskToView.created_at).getTime() + 60000 &&
                    taskToView.editor && (
                      <div className="flex items-center">
                        <Pencil className="w-4 h-4 mr-2" />
                        <strong>Terakhir diubah oleh:</strong>&nbsp;
                        {taskToView.editor.name}
                        <h3 className=" text-muted-foreground ml-2">
                          {taskToView.updated_at &&
                            new Date(taskToView.updated_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit", // atau "numeric" kalau tidak ingin 0 di depan
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500 text-white ml-2 flex items-center"
                        >
                          {taskToView.editor.role}
                        </Badge>
                      </div>
                    )}
                </div>
              </div>
              <DialogFooter className="sm:justify-start gap-2">
                <Button
                  onClick={() => {
                    handleUpdateTaskStatus(
                      taskToView.task_submissions[0].id,
                      "in_progress"
                    );
                    setShowDetailDialog(false);
                  }}
                  disabled={
                    !!actionLoading ||
                    taskToView.task_submissions[0]?.status === "in_progress"
                  }
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mulai Kerjakan
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateTaskStatus(
                      taskToView.task_submissions[0].id,
                      "completed"
                    );
                    setShowDetailDialog(false);
                  }}
                  disabled={
                    !!actionLoading ||
                    taskToView.task_submissions[0]?.status === "completed"
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tandai Selesai
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailDialog(false)}
                  disabled={!!actionLoading}
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
