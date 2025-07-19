"use client";

import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/auth";
import { Task, Subject } from "@/lib/types";
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
  X
} from "lucide-react";

// Types
type Submission = {
  id: string;
  status: "pending" | "in_progress" | "completed";
  user_id: string;
};

type TaskWithDetails = Task & {
  updated_at: string;
  created_at: string;
  editor: { id: string; name: string; role: string } | null;
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

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [taskToView, setTaskToView] = useState<TaskWithDetails | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "sedang" as "rendah" | "sedang" | "tinggi",
    type: "pribadi" as "pribadi" | "kelas",
    subject_id: "",
  });

  const canCreateClassTasks = hasPermission(user?.role || "", [
    "admin",
    "ketua_kelas",
    "sekretaris",
  ]);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, subjectsRes] = await Promise.all([
        fetch("/api/tasks", { credentials: "include" }),
        fetch("/api/subjects", { credentials: "include" }),
      ]);

      if (!tasksRes.ok) throw new Error("Gagal memuat tugas");
      if (!subjectsRes.ok) throw new Error("Gagal memuat mata kuliah");

      const tasksData = await tasksRes.json();
      const subjectsData = await subjectsRes.json();

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

  // Create task
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
      const payload = {
        title: newTask.title,
        description: newTask.description,
        due_date: new Date(newTask.due_date).toISOString(),
        priority: newTask.priority,
        type: newTask.type,
        subject_id: newTask.subject_id ? newTask.subject_id : null,
        assigned_by: user.id,
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

  // Update task status
  const handleUpdateTaskStatus = async (
    submissionId: string,
    newStatus: "pending" | "in_progress" | "completed"
  ) => {
    setActionLoading(`status-${submissionId}`);
    try {
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

  // Filter tasks
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
        return "bg-red-500";
      case "sedang":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  // Task Card Component
  const TaskCard = ({ task }: { task: TaskWithDetails }) => {
    const userSubmission = task.task_submissions[0];
    const status = userSubmission?.status || "pending";

    const isNew = () => {
      if (!task.created_at) return false;
      const twoDaysInMs = 48 * 60 * 60 * 1000;
      return (
        new Date().getTime() - new Date(task.created_at).getTime() < twoDaysInMs
      );
    };

    const isEdited = () => {
      if (!task.created_at || !task.updated_at) return false;
      const createdAt = new Date(task.created_at).getTime();
      const updatedAt = new Date(task.updated_at).getTime();
      return updatedAt > createdAt + 60000;
    };

    const taskIsEdited = isEdited();
    const taskIsNew = isNew() && !taskIsEdited;

    return (
      <Card
        onClick={() => {
          setTaskToView(task);
          setShowDetailDialog(true);
        }}
        className="cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl card-interactive"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-2 flex-1">
              <div className="flex-shrink-0 pt-1">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start flex-wrap gap-2 mb-2">
                  {taskIsNew && (
                    <Badge className="bg-red-500 text-white text-xs">
                      Baru
                    </Badge>
                  )}
                  {taskIsEdited && (
                    <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
                      Diedit
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                  {task.title}
                </h3>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 mt-1`} />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description || "Tidak ada deskripsi."}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {task.type}
            </Badge>
            {task.subjects && (
              <Badge variant="outline" className="text-xs">
                {task.subjects.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span
                className={`${
                  task.due_date &&
                  new Date(task.due_date) < new Date() &&
                  status !== "completed"
                    ? "text-red-500 font-medium"
                    : ""
                }`}
              >
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "No deadline"}
              </span>
            </div>
            {task.type === "kelas" && task.assigner && (
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                <span>{task.assigner.name}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
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
        </CardContent>
      </Card>
    );
  };

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
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mx-4 mt-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tugas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTasks.length} tugas ditemukan
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full w-12 h-12 shadow-lg">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Tugas Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Judul Tugas</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Masukkan judul tugas"
                    className="mobile-input"
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
                    className="mobile-input"
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
                    className="mobile-input"
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
                    <SelectTrigger className="mobile-input">
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
                    <SelectTrigger className="mobile-input">
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
                      <SelectTrigger className="mobile-input">
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
                  className="w-full mobile-button"
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

        {/* Search and Filter */}
        <div className="mx-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tugas..."
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
          
          {/* Filter chips */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { id: 'semua', label: 'Semua' },
              { id: 'pending', label: 'Pending' },
              { id: 'in_progress', label: 'Dikerjakan' },
              { id: 'completed', label: 'Selesai' }
            ].map((filter) => (
              <Button
                key={filter.id}
                variant={filterStatus === filter.id ? "default" : "outline"}
                size="sm"
                className="rounded-full whitespace-nowrap"
                onClick={() => setFilterStatus(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tasks Tabs */}
        <div className="mx-4">
          <Tabs defaultValue="semua" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <TabsTrigger value="semua" className="rounded-lg">
                Semua ({filteredTasks.length})
              </TabsTrigger>
              <TabsTrigger value="pribadi" className="rounded-lg">
                Pribadi ({personalTasks.length})
              </TabsTrigger>
              <TabsTrigger value="kelas" className="rounded-lg">
                Kelas ({classTasks.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="semua" className="space-y-3 mt-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </TabsContent>
            
            <TabsContent value="pribadi" className="space-y-3 mt-4">
              {personalTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </TabsContent>
            
            <TabsContent value="kelas" className="space-y-3 mt-4">
              {classTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Task Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="w-[95vw] max-w-lg mx-auto rounded-2xl max-h-[80vh] overflow-y-auto">
            {taskToView && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg text-left">
                    {taskToView.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {taskToView.type}
                    </Badge>
                    <Badge className={`${getPriorityColor(taskToView.priority)} text-white text-xs`}>
                      {taskToView.priority}
                    </Badge>
                    {taskToView.subjects && (
                      <Badge variant="outline" className="text-xs">
                        {taskToView.subjects.name}
                      </Badge>
                    )}
                  </div>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {taskToView.description || "Tidak ada deskripsi untuk tugas ini."}
                  </p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">Deadline:</span>
                      <span className="ml-2">
                        {taskToView.due_date
                          ? new Date(taskToView.due_date).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "Tanpa batas waktu"}
                      </span>
                    </div>
                    
                    {taskToView.subjects?.lecturer && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Dosen:</span>
                        <span className="ml-2">{taskToView.subjects.lecturer}</span>
                      </div>
                    )}
                    
                    {taskToView.type === "kelas" && taskToView.assigner && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">Dibuat oleh:</span>
                        <span className="ml-2">{taskToView.assigner.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {taskToView.assigner.role}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 pt-4">
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
                      className="flex-1 mobile-button"
                      variant="outline"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Mulai
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
                      className="flex-1 mobile-button bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Selesai
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}