"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/auth";
// Hapus import data statis
// import { schedules } from '@/lib/data';
import { Schedule, Subject } from "@/lib/types"; // Impor Subject juga
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  BookOpen,
  Edit,
  Trash2,
  Download,
  Share,
  Loader2,
} from "lucide-react";

// Tipe data baru untuk schedule yang diterima dari API
type ScheduleWithSubject = Schedule & {
  subjects: {
    id: string;
    name: string;
    lecturer: string;
  };
};

export default function SchedulePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State untuk data dari API
  const [schedules, setSchedules] = useState<ScheduleWithSubject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  // State untuk jadwal yang sedang diedit
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleWithSubject | null>(null);

  const [selectedDay, setSelectedDay] = useState("semua");

  // State untuk form tambah jadwal baru, disesuaikan dengan schema
  const [newSchedule, setNewSchedule] = useState({
    subject_id: "",
    day: "Senin",
    start_time: "",
    end_time: "",
    room: "",
  });

  const canManageSchedule = hasPermission(user?.role || "", [
    "admin",
    "ketua_kelas",
    "sekretaris",
  ]);

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Fungsi untuk memuat data jadwal dan mata kuliah dari API
  const loadData = async () => {
    setLoading(true);
    try {
      // Ambil data jadwal
      const scheduleRes = await fetch("/api/schedules");
      if (!scheduleRes.ok) throw new Error("Gagal mengambil data jadwal");
      const scheduleData = await scheduleRes.json();
      setSchedules(scheduleData.data || []);

      // Ambil data mata kuliah untuk form
      const subjectRes = await fetch("/api/subjects");
      if (!subjectRes.ok) throw new Error("Gagal mengambil data mata kuliah");
      const subjectData = await subjectRes.json();
      setSubjects(subjectData.data || []);
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

  // Panggil loadData saat komponen dimuat
  useEffect(() => {
    loadData();
  }, []);

  // Fungsi untuk membuat jadwal baru
  const handleCreateSchedule = async () => {
    if (
      !newSchedule.subject_id ||
      !newSchedule.start_time ||
      !newSchedule.end_time
    ) {
      toast({
        title: "Error",
        description: "Mata kuliah, waktu mulai, dan waktu selesai harus diisi.",
        variant: "destructive",
      });
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menambahkan jadwal baru.");
      }

      toast({
        title: "Sukses!",
        description: "Jadwal baru berhasil ditambahkan.",
      });

      setShowCreateDialog(false); // Tutup dialog
      setNewSchedule({
        // Reset form
        subject_id: "",
        day: "Senin",
        start_time: "",
        end_time: "",
        room: "",
      });
      loadData(); // Muat ulang data
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

  const handleEditClick = (schedule: ScheduleWithSubject) => {
    setEditingSchedule(schedule);
    setShowEditDialog(true);
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/schedules/${editingSchedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: editingSchedule.subject_id,
          day: editingSchedule.day,
          start_time: editingSchedule.start_time,
          end_time: editingSchedule.end_time,
          room: editingSchedule.room,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui jadwal.");
      }

      toast({
        title: "Sukses!",
        description: "Jadwal berhasil diperbarui.",
      });

      setShowEditDialog(false);
      setEditingSchedule(null);
      loadData();
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

  const handleDeleteSchedule = async (scheduleId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus jadwal.");
      }

      toast({
        title: "Sukses!",
        description: "Jadwal berhasil dihapus.",
      });
      loadData();
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

  const filteredSchedules =
    selectedDay === "semua"
      ? schedules
      : schedules.filter((schedule) => schedule.day === selectedDay);

  const getSchedulesByDay = (day: string) => {
    return schedules.filter((schedule) => schedule.day === day);
  };

  // Komponen Kartu Jadwal (disesuaikan dengan data baru)
  const ScheduleCard = ({ schedule }: { schedule: ScheduleWithSubject }) => (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <h3 className="font-semibold flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-primary" />
              {schedule.subjects.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {schedule.day} - {schedule.start_time.substring(0, 5)} -{" "}
                {schedule.end_time.substring(0, 5)}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {schedule.room || "-"}
              </div>
            </div>
          </div>
          {canManageSchedule && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditClick(schedule)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus jadwal mata kuliah{" "}
                      <strong>{schedule.subjects.name}</strong> pada hari{" "}
                      <strong>{schedule.day}</strong>. Tindakan ini tidak dapat
                      dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1 text-muted-foreground" />
            <span className="text-sm">{schedule.subjects.lecturer}</span>
          </div>
          <Badge variant="outline" className="bg-primary text-white">{schedule.day}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  // Komponen Tabel Jadwal Mingguan (disesuaikan dengan data baru)
  const WeeklyScheduleTable = () => {
    // Definisikan slot waktu secara manual atau generate
    const timeSlots = useMemo(() => {
      if (!schedules || schedules.length === 0) return [];
      // 1. Ambil semua waktu mulai yang unik
      const uniqueTimes = Array.from(
        new Set(schedules.map((s) => s.start_time))
      );
      // 2. Urutkan waktu dari yang paling pagi
      uniqueTimes.sort((a, b) => a.localeCompare(b));
      return uniqueTimes;
    }, [schedules]);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Jadwal Mingguan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Waktu</th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="text-left p-2 font-medium min-w-[150px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium text-sm">
                      {timeSlot.substring(0, 5)}
                    </td>
                    {days.map((day) => {
                      const schedule = schedules.find(
                        (s) => s.day === day && s.start_time === timeSlot
                      );
                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className="p-2 align-top"
                        >
                          {schedule ? (
                            <div className="bg-primary/10 p-2 rounded text-xs">
                              <div className="font-medium">
                                {schedule.subjects.name}
                              </div>
                              <div className="text-muted-foreground">
                                {schedule.room}
                              </div>
                              <div className="text-muted-foreground">
                                {schedule.subjects.lecturer}
                              </div>
                              <div className="text-muted-foreground">
                                {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 flex items-center justify-center text-muted-foreground text-xs">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Jadwal Kuliah</h1>
            <p className="text-muted-foreground">
              Kelola jadwal perkuliahan semester ini
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
            {canManageSchedule && (
              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Jadwal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Jadwal Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="subject_id">Mata Kuliah</Label>
                      <Select
                        value={newSchedule.subject_id}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, subject_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mata kuliah" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="day">Hari</Label>
                      <Select
                        value={newSchedule.day}
                        onValueChange={(value) =>
                          setNewSchedule({ ...newSchedule, day: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_time">Waktu Mulai</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={newSchedule.start_time}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              start_time: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">Waktu Selesai</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={newSchedule.end_time}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              end_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="room">Ruangan</Label>
                      <Input
                        id="room"
                        value={newSchedule.room}
                        onChange={(e) =>
                          setNewSchedule({
                            ...newSchedule,
                            room: e.target.value,
                          })
                        }
                        placeholder="Contoh: Lab 1, Ruang 201"
                      />
                    </div>

                    <Button
                      onClick={handleCreateSchedule}
                      className="w-full"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Simpan Jadwal"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        {editingSchedule && (
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Jadwal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit_subject_id">Mata Kuliah</Label>
                  <Select
                    value={editingSchedule.subject_id}
                    onValueChange={(value) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        subject_id: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata kuliah" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit_day">Hari</Label>
                  <Select
                    value={editingSchedule.day}
                    onValueChange={(value) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        day: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_start_time">Waktu Mulai</Label>
                    <Input
                      id="edit_start_time"
                      type="time"
                      value={editingSchedule.start_time}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          start_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_end_time">Waktu Selesai</Label>
                    <Input
                      id="edit_end_time"
                      type="time"
                      value={editingSchedule.end_time}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          end_time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_room">Ruangan</Label>
                  <Input
                    id="edit_room"
                    value={editingSchedule.room || ""}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        room: e.target.value,
                      })
                    }
                    placeholder="Contoh: Lab 1, Ruang 201"
                  />
                </div>

                <Button
                  onClick={handleUpdateSchedule}
                  className="w-full"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Statistics and other components remain the same */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jadwal</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {schedules.length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hari Aktif</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(schedules.map((s) => s.day)).size}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ruangan Digunakan
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(schedules.map((s) => s.room)).size}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Jadwal Hari Ini
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      getSchedulesByDay(
                        days[new Date().getDay() - 1] || "Senin"
                      ).length
                    }
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Views */}
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Tampilan Mingguan</TabsTrigger>
            <TabsTrigger value="list">Tampilan List</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <WeeklyScheduleTable />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filter Jadwal
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Hari</SelectItem>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedules.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
