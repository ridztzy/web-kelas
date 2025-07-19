"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Edit, 
  Settings,
  Award,
  BookOpen,
  CheckSquare,
  Clock,
  TrendingUp,
  MapPin,
  Shield
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Mock data for profile stats
  const profileStats = [
    {
      label: 'Tugas Selesai',
      value: '24',
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Mata Kuliah',
      value: '8',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      label: 'Jam Belajar',
      value: '156',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      label: 'Prestasi',
      value: '3',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  const achievements = [
    {
      title: 'Mahasiswa Teladan',
      description: 'Menyelesaikan semua tugas tepat waktu',
      icon: Award,
      color: 'bg-yellow-500'
    },
    {
      title: 'Aktif Diskusi',
      description: 'Berpartisipasi aktif dalam chat kelas',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Konsisten',
      description: 'Login setiap hari selama 30 hari',
      icon: Calendar,
      color: 'bg-blue-500'
    }
  ];

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'ketua_kelas': return 'Ketua Kelas';
      case 'sekretaris': return 'Sekretaris';
      default: return 'Mahasiswa';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'ketua_kelas': return 'bg-blue-500';
      case 'sekretaris': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6 pb-4">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white mx-4 mt-4 p-6 rounded-2xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              {user?.avatar_url ? (
                <Avatar className="w-20 h-20 border-4 border-white/20">
                  <AvatarImage src={user.avatar_url} alt={user.name || 'Avatar'} />
                  <AvatarFallback className="text-2xl font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/20">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-white/80 text-sm">NIM: {user?.nim}</p>
              <div className="flex items-center mt-2">
                <Badge className={`${getRoleColor(user?.role || '')} text-white border-0`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleText(user?.role || '')}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            className="w-full bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl"
            onClick={() => router.push('/dashboard/settings')}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profil
          </Button>
        </div>

        {/* Profile Stats */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Statistik</h2>
          <div className="grid grid-cols-2 gap-3">
            {profileStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <div className={`${stat.bgColor} p-2 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Profile Information */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Informasi Pribadi</h2>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email || 'Tidak ada'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Telepon</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.phone || 'Belum diatur'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Semester</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Semester {user?.semester || 1}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bergabung</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : 'Tidak diketahui'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio Section */}
        {user?.bio && (
          <div className="mx-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Bio</h2>
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{user.bio}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Achievements */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Pencapaian</h2>
          <div className="space-y-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`${achievement.color} p-2 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white">{achievement.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 border-2 border-dashed hover:border-solid hover:bg-primary/5 rounded-xl" 
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Pengaturan</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1 border-2 border-dashed hover:border-solid hover:bg-primary/5 rounded-xl" 
              onClick={() => router.push('/dashboard/tasks')}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="text-xs">Tugas Saya</span>
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}