"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { schedules } from '@/lib/data';
import { Schedule } from '@/lib/types';
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
  Share
} from 'lucide-react';

export default function SchedulePage() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('semua');
  const [newSchedule, setNewSchedule] = useState({
    subject: '',
    time: '',
    day: 'Senin',
    room: '',
    lecturer: ''
  });

  const canManageSchedule = hasPermission(user?.role || '', ['admin', 'ketua_kelas', 'sekretaris']);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const timeSlots = [
    '07:00-08:40', '08:40-10:20', '10:30-12:10', 
    '13:00-14:40', '14:40-16:20', '16:30-18:10'
  ];

  const filteredSchedules = selectedDay === 'semua' 
    ? schedules 
    : schedules.filter(schedule => schedule.day === selectedDay);

  const getSchedulesByDay = (day: string) => {
    return schedules.filter(schedule => schedule.day === day);
  };

  const handleCreateSchedule = () => {
    console.log('Creating schedule:', newSchedule);
    setNewSchedule({
      subject: '',
      time: '',
      day: 'Senin',
      room: '',
      lecturer: ''
    });
  };

  const ScheduleCard = ({ schedule }: { schedule: Schedule }) => (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <h3 className="font-semibold flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-primary" />
              {schedule.subject}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {schedule.time}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {schedule.room}
              </div>
            </div>
          </div>
          {canManageSchedule && (
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1 text-muted-foreground" />
            <span className="text-sm">{schedule.lecturer}</span>
          </div>
          <Badge variant="outline">{schedule.day}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const WeeklyScheduleTable = () => (
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
                {days.map(day => (
                  <th key={day} className="text-left p-2 font-medium min-w-[150px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot} className="border-b hover:bg-muted/30">
                  <td className="p-2 font-medium text-sm">{timeSlot}</td>
                  {days.map(day => {
                    const daySchedules = getSchedulesByDay(day);
                    const schedule = daySchedules.find(s => s.time === timeSlot);
                    return (
                      <td key={`${day}-${timeSlot}`} className="p-2">
                        {schedule ? (
                          <div className="bg-primary/10 p-2 rounded text-xs">
                            <div className="font-medium">{schedule.subject}</div>
                            <div className="text-muted-foreground">{schedule.room}</div>
                            <div className="text-muted-foreground">{schedule.lecturer}</div>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Jadwal Kuliah</h1>
            <p className="text-muted-foreground">Kelola jadwal perkuliahan semester ini</p>
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
              <Dialog>
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
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Mata Kuliah</Label>
                      <Input
                        id="subject"
                        value={newSchedule.subject}
                        onChange={(e) => setNewSchedule({...newSchedule, subject: e.target.value})}
                        placeholder="Nama mata kuliah"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="day">Hari</Label>
                      <Select value={newSchedule.day} onValueChange={(value) => setNewSchedule({...newSchedule, day: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="time">Waktu</Label>
                      <Select value={newSchedule.time} onValueChange={(value) => setNewSchedule({...newSchedule, time: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="room">Ruangan</Label>
                      <Input
                        id="room"
                        value={newSchedule.room}
                        onChange={(e) => setNewSchedule({...newSchedule, room: e.target.value})}
                        placeholder="Contoh: Lab 1, Ruang 201"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lecturer">Dosen</Label>
                      <Input
                        id="lecturer"
                        value={newSchedule.lecturer}
                        onChange={(e) => setNewSchedule({...newSchedule, lecturer: e.target.value})}
                        placeholder="Nama dosen"
                      />
                    </div>
                    
                    <Button onClick={handleCreateSchedule} className="w-full">
                      Simpan Jadwal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jadwal</p>
                  <p className="text-2xl font-bold text-blue-600">{schedules.length}</p>
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
                    {new Set(schedules.map(s => s.day)).size}
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
                  <p className="text-sm text-muted-foreground">Ruangan Digunakan</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(schedules.map(s => s.room)).size}
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
                  <p className="text-sm text-muted-foreground">Jadwal Hari Ini</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {getSchedulesByDay(days[new Date().getDay() - 1] || 'Senin').length}
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
                    {days.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
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