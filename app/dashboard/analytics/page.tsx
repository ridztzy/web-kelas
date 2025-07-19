"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import FeatureComingSoon from "@/components/layout/FeatureComingSoon";
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';

export default function AnalyticsPage() {
  const { user } = useAuth();
  
  // Anda tetap bisa menyimpan logika izin jika diperlukan di masa depan
  const canViewAnalytics = hasPermission(user?.role || '', ['admin', 'ketua_kelas']);

  // Alih-alih menampilkan halaman analitik, tampilkan komponen "Coming Soon"
  return (
    <DashboardLayout>
      <FeatureComingSoon />
    </DashboardLayout>
  );
}



// "use client";

// import { useState } from 'react';
// import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useAuth } from '@/contexts/AuthContext';
// import { hasPermission } from '@/lib/auth';
// import { tasks, users, chatMessages } from '@/lib/data';
// import {
//   BarChart3,
//   TrendingUp,
//   TrendingDown,
//   Users,
//   CheckSquare,
//   MessageSquare,
//   Calendar,
//   Clock,
//   Target,
//   Award,
//   Activity,
//   PieChart,
//   Download,
//   Filter,
//   Shield
// } from 'lucide-react';

// export default function AnalyticsPage() {
//   const { user } = useAuth();
//   const [timeRange, setTimeRange] = useState('7d');
//   const [selectedMetric, setSelectedMetric] = useState('tasks');

//   const canViewAnalytics = hasPermission(user?.role || '', ['admin', 'ketua_kelas']);

//   if (!canViewAnalytics) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
//             <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
//             <p className="text-muted-foreground">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   // Analytics calculations
//   const totalTasks = tasks.length;
//   const completedTasks = tasks.filter(t => t.status === 'completed').length;
//   const pendingTasks = tasks.filter(t => t.status === 'pending').length;
//   const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
//   const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : '0';

//   const totalUsers = users.length;
//   const activeUsers = users.filter(u => u.role !== 'admin').length;
//   const totalMessages = chatMessages.length;

//   const tasksByPriority = {
//     tinggi: tasks.filter(t => t.priority === 'tinggi').length,
//     sedang: tasks.filter(t => t.priority === 'sedang').length,
//     rendah: tasks.filter(t => t.priority === 'rendah').length
//   };

//   const tasksByType = {
//     kelas: tasks.filter(t => t.type === 'kelas').length,
//     pribadi: tasks.filter(t => t.type === 'pribadi').length
//   };

//   const usersByRole = {
//     admin: users.filter(u => u.role === 'admin').length,
//     ketua_kelas: users.filter(u => u.role === 'ketua_kelas').length,
//     sekretaris: users.filter(u => u.role === 'sekretaris').length,
//     mahasiswa: users.filter(u => u.role === 'mahasiswa').length
//   };

//   // Mock data for charts
//   const weeklyTaskData = [
//     { day: 'Sen', completed: 5, created: 8 },
//     { day: 'Sel', completed: 7, created: 6 },
//     { day: 'Rab', completed: 3, created: 9 },
//     { day: 'Kam', completed: 8, created: 5 },
//     { day: 'Jum', completed: 6, created: 7 },
//     { day: 'Sab', completed: 4, created: 3 },
//     { day: 'Min', completed: 2, created: 4 }
//   ];

//   const monthlyActivityData = [
//     { month: 'Jan', tasks: 45, messages: 120, users: 28 },
//     { month: 'Feb', tasks: 52, messages: 145, users: 30 },
//     { month: 'Mar', tasks: 38, messages: 98, users: 29 },
//     { month: 'Apr', tasks: 61, messages: 167, users: 32 }
//   ];

//   const MetricCard = ({ title, value, change, icon: Icon, color }: any) => (
//     <Card className={`bg-gradient-to-br ${color}`}>
//       <CardContent className="p-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-muted-foreground">{title}</p>
//             <p className="text-2xl font-bold">{value}</p>
//             {change && (
//               <div className="flex items-center mt-1">
//                 {change > 0 ? (
//                   <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
//                 ) : (
//                   <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
//                 )}
//                 <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                   {Math.abs(change)}%
//                 </span>
//               </div>
//             )}
//           </div>
//           <Icon className="w-8 h-8 opacity-80" />
//         </div>
//       </CardContent>
//     </Card>
//   );

//   const SimpleBarChart = ({ data, title }: any) => (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-lg">{title}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           {data.map((item: any, index: number) => (
//             <div key={index} className="flex items-center justify-between">
//               <span className="text-sm font-medium">{item.label}</span>
//               <div className="flex items-center space-x-2">
//                 <div className="w-32 bg-muted rounded-full h-2">
//                   <div 
//                     className="bg-primary h-2 rounded-full" 
//                     style={{ width: `${(item.value / Math.max(...data.map((d: any) => d.value))) * 100}%` }}
//                   />
//                 </div>
//                 <span className="text-sm text-muted-foreground w-8">{item.value}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );

//   const ActivityChart = ({ data, title }: any) => (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-lg">{title}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {data.map((item: any, index: number) => (
//             <div key={index} className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>{item.day}</span>
//                 <span className="text-muted-foreground">
//                   Selesai: {item.completed} | Dibuat: {item.created}
//                 </span>
//               </div>
//               <div className="flex space-x-1">
//                 <div className="flex-1 bg-muted rounded-full h-2">
//                   <div 
//                     className="bg-green-500 h-2 rounded-full" 
//                     style={{ width: `${(item.completed / 10) * 100}%` }}
//                   />
//                 </div>
//                 <div className="flex-1 bg-muted rounded-full h-2">
//                   <div 
//                     className="bg-blue-500 h-2 rounded-full" 
//                     style={{ width: `${(item.created / 10) * 100}%` }}
//                   />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold flex items-center">
//               <BarChart3 className="w-6 h-6 mr-2" />
//               Analitik & Laporan
//             </h1>
//             <p className="text-muted-foreground">Pantau aktivitas dan performa kelas</p>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <Select value={timeRange} onValueChange={setTimeRange}>
//               <SelectTrigger className="w-32">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="7d">7 Hari</SelectItem>
//                 <SelectItem value="30d">30 Hari</SelectItem>
//                 <SelectItem value="90d">90 Hari</SelectItem>
//                 <SelectItem value="1y">1 Tahun</SelectItem>
//               </SelectContent>
//             </Select>
//             <Button variant="outline" size="sm">
//               <Download className="w-4 h-4 mr-2" />
//               Export
//             </Button>
//           </div>
//         </div>

//         {/* Key Metrics */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <MetricCard
//             title="Total Tugas"
//             value={totalTasks}
//             change={12}
//             icon={CheckSquare}
//             color="from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
//           />
//           <MetricCard
//             title="Tingkat Penyelesaian"
//             value={`${completionRate}%`}
//             change={5}
//             icon={Target}
//             color="from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
//           />
//           <MetricCard
//             title="Pengguna Aktif"
//             value={activeUsers}
//             change={-2}
//             icon={Users}
//             color="from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
//           />
//           <MetricCard
//             title="Pesan Chat"
//             value={totalMessages}
//             change={18}
//             icon={MessageSquare}
//             color="from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
//           />
//         </div>

//         {/* Detailed Analytics */}
//         <Tabs defaultValue="tasks" className="w-full">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="tasks">Tugas</TabsTrigger>
//             <TabsTrigger value="users">Pengguna</TabsTrigger>
//             <TabsTrigger value="activity">Aktivitas</TabsTrigger>
//             <TabsTrigger value="performance">Performa</TabsTrigger>
//           </TabsList>
          
//           <TabsContent value="tasks" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Task Status Distribution */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <PieChart className="w-5 h-5 mr-2" />
//                     Status Tugas
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-3 h-3 bg-green-500 rounded-full" />
//                         <span className="text-sm">Selesai</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <span className="text-sm font-medium">{completedTasks}</span>
//                         <Badge variant="secondary">{((completedTasks/totalTasks)*100).toFixed(0)}%</Badge>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-3 h-3 bg-blue-500 rounded-full" />
//                         <span className="text-sm">Sedang Dikerjakan</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <span className="text-sm font-medium">{inProgressTasks}</span>
//                         <Badge variant="secondary">{((inProgressTasks/totalTasks)*100).toFixed(0)}%</Badge>
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-3 h-3 bg-gray-500 rounded-full" />
//                         <span className="text-sm">Pending</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <span className="text-sm font-medium">{pendingTasks}</span>
//                         <Badge variant="secondary">{((pendingTasks/totalTasks)*100).toFixed(0)}%</Badge>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Task Priority Distribution */}
//               <SimpleBarChart
//                 title="Distribusi Prioritas"
//                 data={[
//                   { label: 'Tinggi', value: tasksByPriority.tinggi },
//                   { label: 'Sedang', value: tasksByPriority.sedang },
//                   { label: 'Rendah', value: tasksByPriority.rendah }
//                 ]}
//               />
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Task Type Distribution */}
//               <SimpleBarChart
//                 title="Jenis Tugas"
//                 data={[
//                   { label: 'Tugas Kelas', value: tasksByType.kelas },
//                   { label: 'Tugas Pribadi', value: tasksByType.pribadi }
//                 ]}
//               />

//               {/* Weekly Task Activity */}
//               <ActivityChart
//                 title="Aktivitas Tugas Mingguan"
//                 data={weeklyTaskData}
//               />
//             </div>
//           </TabsContent>
          
//           <TabsContent value="users" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* User Role Distribution */}
//               <SimpleBarChart
//                 title="Distribusi Role Pengguna"
//                 data={[
//                   { label: 'Mahasiswa', value: usersByRole.mahasiswa },
//                   { label: 'Sekretaris', value: usersByRole.sekretaris },
//                   { label: 'Ketua Kelas', value: usersByRole.ketua_kelas },
//                   { label: 'Admin', value: usersByRole.admin }
//                 ]}
//               />

//               {/* User Activity */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <Activity className="w-5 h-5 mr-2" />
//                     Aktivitas Pengguna
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm">Pengguna Aktif Hari Ini</span>
//                       <Badge variant="default">24</Badge>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm">Login Minggu Ini</span>
//                       <Badge variant="secondary">156</Badge>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm">Rata-rata Sesi</span>
//                       <Badge variant="outline">45 menit</Badge>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm">Pengguna Baru Bulan Ini</span>
//                       <Badge variant="secondary">3</Badge>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>
          
//           <TabsContent value="activity" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Monthly Activity Trends */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <TrendingUp className="w-5 h-5 mr-2" />
//                     Tren Aktivitas Bulanan
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {monthlyActivityData.map((month, index) => (
//                       <div key={index} className="space-y-2">
//                         <div className="flex justify-between text-sm">
//                           <span className="font-medium">{month.month}</span>
//                           <span className="text-muted-foreground">
//                             T: {month.tasks} | M: {month.messages} | U: {month.users}
//                           </span>
//                         </div>
//                         <div className="flex space-x-1">
//                           <div className="flex-1 bg-muted rounded-full h-2">
//                             <div 
//                               className="bg-blue-500 h-2 rounded-full" 
//                               style={{ width: `${(month.tasks / 70) * 100}%` }}
//                             />
//                           </div>
//                           <div className="flex-1 bg-muted rounded-full h-2">
//                             <div 
//                               className="bg-green-500 h-2 rounded-full" 
//                               style={{ width: `${(month.messages / 200) * 100}%` }}
//                             />
//                           </div>
//                           <div className="flex-1 bg-muted rounded-full h-2">
//                             <div 
//                               className="bg-orange-500 h-2 rounded-full" 
//                               style={{ width: `${(month.users / 35) * 100}%` }}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Recent Activity */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <Clock className="w-5 h-5 mr-2" />
//                     Aktivitas Terbaru
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     <div className="flex items-center space-x-3 text-sm">
//                       <div className="w-2 h-2 bg-green-500 rounded-full" />
//                       <span>5 tugas diselesaikan hari ini</span>
//                     </div>
//                     <div className="flex items-center space-x-3 text-sm">
//                       <div className="w-2 h-2 bg-blue-500 rounded-full" />
//                       <span>12 pesan baru di chat kelas</span>
//                     </div>
//                     <div className="flex items-center space-x-3 text-sm">
//                       <div className="w-2 h-2 bg-orange-500 rounded-full" />
//                       <span>3 tugas baru ditambahkan</span>
//                     </div>
//                     <div className="flex items-center space-x-3 text-sm">
//                       <div className="w-2 h-2 bg-purple-500 rounded-full" />
//                       <span>2 pengguna login pertama kali</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>
          
//           <TabsContent value="performance" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Performance Metrics */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <Award className="w-5 h-5 mr-2" />
//                     Performa Kelas
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="text-center">
//                       <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
//                       <p className="text-sm text-muted-foreground">Tingkat Penyelesaian</p>
//                     </div>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span>Target Bulanan</span>
//                         <span className="font-medium">85%</span>
//                       </div>
//                       <div className="w-full bg-muted rounded-full h-2">
//                         <div 
//                           className="bg-green-500 h-2 rounded-full" 
//                           style={{ width: `${Math.min((parseFloat(completionRate) / 85) * 100, 100)}%` }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Response Time */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <Clock className="w-5 h-5 mr-2" />
//                     Waktu Respons
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="text-center">
//                       <div className="text-3xl font-bold text-blue-600">2.4</div>
//                       <p className="text-sm text-muted-foreground">Hari Rata-rata</p>
//                     </div>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span>Tugas Prioritas Tinggi</span>
//                         <span className="font-medium">1.2 hari</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Tugas Prioritas Sedang</span>
//                         <span className="font-medium">2.8 hari</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Tugas Prioritas Rendah</span>
//                         <span className="font-medium">4.1 hari</span>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Engagement Score */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center">
//                     <TrendingUp className="w-5 h-5 mr-2" />
//                     Skor Keterlibatan
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="text-center">
//                       <div className="text-3xl font-bold text-purple-600">87</div>
//                       <p className="text-sm text-muted-foreground">dari 100</p>
//                     </div>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span>Partisipasi Chat</span>
//                         <Badge variant="default">Tinggi</Badge>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Ketepatan Waktu</span>
//                         <Badge variant="secondary">Sedang</Badge>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Kualitas Tugas</span>
//                         <Badge variant="default">Tinggi</Badge>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </DashboardLayout>
//   );
// }