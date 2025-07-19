"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckSquare, Clock, AlertTriangle, Calendar, BookOpen, 
  MessageSquare, Plus, ArrowRight, Loader2, TrendingUp,
  Users, Bell, Search
} from 'lucide-react';

// Mobile Layout Component
import MobileLayout from '@/components/layout/MobileLayout';

// Tipe data yang sesuai dengan API response
interface TaskSubmission {
  status: 'pending' | 'in_progress' | 'completed';
}

interface Task {
  id: string;
  title: string;
  priority: 'rendah' | 'sedang' | 'tinggi';
  due_date: string;
  subjects: { name: string } | null;
  task_submissions: TaskSubmission[];
}

interface Schedule {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string | null;
  subjects: {
    name: string;
    lecturer: string;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // State untuk menyimpan data dari API
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Efek untuk mengambil data saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Ambil data tugas dan jadwal secara bersamaan
        const [tasksRes, schedulesRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/schedules')
        ]);

        if (!tasksRes.ok || !schedulesRes.ok) {
          throw new Error('Gagal memuat data dashboard');
        }

        const tasksData = await tasksRes.json();
        const schedulesData = await schedulesRes.json();

        setTasks(tasksData.data || []);
        setSchedules(schedulesData.data || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Logika-logika di bawah ini sekarang menggunakan data dari state
  const pendingTasks = tasks.filter(task => 
    task.task_submissions[0]?.status === 'pending'
  );
  
  const completedTasks = tasks.filter(task => 
    task.task_submissions[0]?.status === 'completed'
  );

  const getTodayDay = () => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[new Date().getDay()];
  };

  const todaySchedule = schedules.filter(schedule => schedule.day === getTodayDay());
  const highPriorityTasksCount = tasks.filter(task => task.priority === 'tinggi').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };
  
  // Tampilan loading
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
      <div className="space-y-0 pb-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground mx-4 mt-4 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold mb-1">
                {getGreeting()}, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                Mari kelola tugas dan jadwal kelas Anda hari ini
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Bell className="w-6 h-6" />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
              <div className="text-xs opacity-80">Tugas Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <div className="text-xs opacity-80">Selesai</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{todaySchedule.length}</div>
              <div className="text-xs opacity-80">Jadwal Hari Ini</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-4 mt-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 border-2 border-dashed hover:border-solid hover:bg-primary/5 rounded-xl" 
              onClick={() => router.push('/dashboard/tasks')}
            >
              <Plus className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Tambah Tugas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 border-2 border-dashed hover:border-solid hover:bg-primary/5 rounded-xl" 
              onClick={() => router.push('/dashboard/chat')}
            >
              <MessageSquare className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Chat Kelas</span>
            </Button>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="mx-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tugas Terbaru</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/tasks')}
              className="text-primary"
            >
              Lihat Semua
            </Button>
          </div>
          
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map((task) => (
              <Card 
                key={task.id} 
                className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl"
                onClick={() => router.push('/dashboard/tasks')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{task.subjects?.name || 'Umum'}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={task.priority === 'tinggi' ? 'destructive' : task.priority === 'sedang' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(task.due_date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="mx-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Jadwal Hari Ini</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/schedule')}
              className="text-primary"
            >
              Lihat Semua
            </Button>
          </div>
          
          <div className="space-y-3">
            {todaySchedule.slice(0, 3).map((schedule) => (
              <Card 
                key={schedule.id} 
                className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{schedule.subjects.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{schedule.subjects.lecturer}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {schedule.start_time.substring(0,5)} - {schedule.end_time.substring(0,5)}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {schedule.room || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="mx-4 mt-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Ringkasan Aktivitas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Prioritas Tinggi</p>
                    <p className="text-xl font-bold text-blue-600">{highPriorityTasksCount}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-blue-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-medium">Progress</p>
                    <p className="text-xl font-bold text-green-600">
                      {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-600 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}