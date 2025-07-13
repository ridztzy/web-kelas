"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { tasks } from '@/lib/data';
import { Task } from '@/lib/types';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  User,
  BookOpen,
  MoreHorizontal,
  Trash2
} from 'lucide-react';


export default function TasksPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('semua');
  const [filterPriority, setFilterPriority] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'sedang',
    type: 'pribadi',
    subject: ''
  });

  const canCreateClassTasks = hasPermission(user?.role || '', ['admin', 'ketua_kelas', 'sekretaris']);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'semua' || task.type === filterType;
    const matchesPriority = filterPriority === 'semua' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'semua' || task.status === filterStatus;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const personalTasks = filteredTasks.filter(task => task.type === 'pribadi');
  const classTasks = filteredTasks.filter(task => task.type === 'kelas');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'tinggi':
        return 'destructive';
      case 'sedang':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim() || !newTask.dueDate) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      dueDate: new Date(newTask.dueDate),
      priority: newTask.priority as 'rendah' | 'sedang' | 'tinggi',
      status: 'pending',
      type: newTask.type as 'pribadi' | 'kelas',
      assignedTo: user?.id,
      assignedBy: newTask.type === 'kelas' ? user?.id : undefined,
      subject: newTask.subject,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to tasks array (in real app, this would be API call)
    tasks.push(task);
    
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'sedang',
      type: 'pribadi',
      subject: ''
    });
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].status = newStatus;
      tasks[taskIndex].updatedAt = new Date();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(task.status)}
            <h3 className="font-medium group-hover:text-primary transition-colors">{task.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}>
                <Clock className="w-4 h-4 mr-2" />
                Mulai Kerjakan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'completed')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Tandai Selesai
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteTask(task.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Tugas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Badge variant="outline" className={getStatusColor(task.status)}>
            {task.status === 'completed' ? 'Selesai' : 
             task.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Pending'}
          </Badge>
          {task.subject && (
            <Badge variant="secondary" className="flex items-center">
              <BookOpen className="w-3 h-3 mr-1" />
              {task.subject}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span className={`${
              new Date(task.dueDate) < new Date() && task.status !== 'completed' 
                ? 'text-destructive font-medium' 
                : ''
            }`}>
              {new Date(task.dueDate).toLocaleDateString('id-ID')}
            </span>
          </div>
          {task.type === 'kelas' && task.assignedBy && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              Ditugaskan oleh admin
            </div>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="mt-3 w-full bg-muted rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              task.status === 'completed' ? 'bg-green-500 w-full' :
              task.status === 'in_progress' ? 'bg-blue-500 w-1/2' :
              'bg-gray-300 w-0'
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Tugas</h1>
            <p className="text-muted-foreground">Kelola tugas pribadi dan tugas kelas</p>
          </div>
          
          <Dialog>
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Tugas</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Masukkan judul tugas"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Deskripsi tugas"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Tanggal Deadline</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioritas</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
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
                  <Select value={newTask.type} onValueChange={(value) => setNewTask({...newTask, type: value})}>
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
                
                <div>
                  <Label htmlFor="subject">Mata Kuliah</Label>
                  <Input
                    id="subject"
                    value={newTask.subject}
                    onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                    placeholder="Nama mata kuliah"
                  />
                </div>
                
                <Button onClick={handleCreateTask} className="w-full">
                  Simpan Tugas
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
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
                <Select value={filterPriority} onValueChange={setFilterPriority}>
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
                    <SelectItem value="in_progress">Sedang Dikerjakan</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Tabs */}
        <Tabs defaultValue="semua" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="semua">Semua Tugas ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="pribadi">Tugas Pribadi ({personalTasks.length})</TabsTrigger>
            <TabsTrigger value="kelas">Tugas Kelas ({classTasks.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="semua" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="pribadi" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="kelas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}