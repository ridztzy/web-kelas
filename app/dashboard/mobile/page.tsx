"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileCard from '@/components/layout/MobileCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckSquare, Clock, AlertTriangle, Calendar, BookOpen, 
  MessageSquare, Plus, ArrowRight, Loader2, TrendingUp,
  Users, Bell
} from 'lucide-react';

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

export default function MobileDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
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
      <div className="space-y-0">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground mx-4 mt-4 p-6 rounded-xl shadow-lg">
          <h1 className="text-xl font-bold mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            Mari kelola tugas dan jadwal kelas Anda hari ini
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Tugas Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingTasks.length}</p>
                <p className="text-xs text-muted-foreground">
                  {highPriorityTasksCount} prioritas tinggi
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Tugas Selesai</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-xs text-muted-foreground">Total selesai</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-600 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Jadwal Hari Ini</p>
                <p className="text-2xl font-bold text-orange-600">{todaySchedule.length}</p>
                <p className="text-xs text-muted-foreground">Mata kuliah</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Pesan Baru</p>
                <p className="text-2xl font-bold text-purple-600">5</p>
                <p className="text-xs text-muted-foreground">Chat kelas</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600 opacity-80" />
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <MobileCard 
          title="Tugas Terbaru" 
          headerAction={
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/tasks')}
              className="text-primary"
            >
              Lihat Semua
            </Button>
          }
        >
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map((task) => (
              <div 
                key={task.id} 
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                onClick={() => router.push('/dashboard/tasks')}
              >
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.subjects?.name || 'Umum'}</p>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={task.priority === 'tinggi' ? 'destructive' : task.priority === 'sedang' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.due_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </MobileCard>

        {/* Today's Schedule */}
        <MobileCard 
          title="Jadwal Hari Ini"
          headerAction={
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/schedule')}
              className="text-primary"
            >
              Lihat Semua
            </Button>
          }
        >
          <div className="space-y-3">
            {todaySchedule.slice(0, 3).map((schedule) => (
              <div 
                key={schedule.id} 
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{schedule.subjects.name}</p>
                  <p className="text-xs text-muted-foreground">{schedule.subjects.lecturer}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {schedule.start_time.substring(0,5)} - {schedule.end_time.substring(0,5)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {schedule.room || 'N/A'}
                    </span>
                  </div>
                </div>
                <BookOpen className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </MobileCard>

        {/* Quick Actions */}
        <MobileCard title="Aksi Cepat">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 border-dashed hover:border-solid hover:bg-primary/5" 
              onClick={() => router.push('/dashboard/tasks')}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Tambah Tugas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 border-dashed hover:border-solid hover:bg-primary/5" 
              onClick={() => router.push('/dashboard/chat')}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Chat Kelas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 border-dashed hover:border-solid hover:bg-primary/5" 
              onClick={() => router.push('/dashboard/schedule')}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Lihat Jadwal</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 border-dashed hover:border-solid hover:bg-primary/5" 
              onClick={() => router.push('/dashboard/subjects')}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Mata Kuliah</span>
            </Button>
          </div>
        </MobileCard>
      </div>
    </MobileLayout>
  );
}