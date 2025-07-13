"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { tasks, schedules } from '@/lib/data';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BookOpen,
  Users,
  MessageSquare,
  Plus,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const todaySchedule = schedules.slice(0, 2); // Mock today's schedule

  const getTasksByPriority = (priority: string) => {
    return tasks.filter(task => task.priority === priority).length;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-primary-foreground/80">
            Mari kelola tugas dan jadwal kelas Anda hari ini
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tugas Pending</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {getTasksByPriority('tinggi')} prioritas tinggi
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tugas Selesai</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Minggu ini
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{todaySchedule.length}</div>
              <p className="text-xs text-muted-foreground">
                Mata kuliah
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesan Baru</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">5</div>
              <p className="text-xs text-muted-foreground">
                Chat kelas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Tugas Terbaru
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Tugas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.subject}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={task.priority === 'tinggi' ? 'destructive' : task.priority === 'sedang' ? 'default' : 'secondary'}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Jadwal Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((schedule) => (
                  <div key={schedule.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{schedule.subject}</p>
                      <p className="text-sm text-muted-foreground">{schedule.lecturer}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{schedule.time}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {schedule.room}
                        </span>
                      </div>
                    </div>
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Plus className="w-6 h-6 mb-2" />
                Tambah Tugas
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <MessageSquare className="w-6 h-6 mb-2" />
                Chat Kelas
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                Lihat Jadwal
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <BookOpen className="w-6 h-6 mb-2" />
                Mata Kuliah
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}