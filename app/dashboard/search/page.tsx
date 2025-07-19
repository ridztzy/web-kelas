"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Clock, 
  BookOpen, 
  Users, 
  MessageSquare,
  Calendar,
  CheckSquare,
  TrendingUp,
  X
} from 'lucide-react';

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState([
    'Tugas Algoritma',
    'Jadwal Kuliah',
    'Chat Kelas',
    'Mata Kuliah Database'
  ]);

  const filters = [
    { id: 'all', label: 'Semua', icon: Search },
    { id: 'tasks', label: 'Tugas', icon: CheckSquare },
    { id: 'subjects', label: 'Kuliah', icon: BookOpen },
    { id: 'schedule', label: 'Jadwal', icon: Calendar },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  const quickActions = [
    {
      title: 'Tugas Pending',
      description: 'Lihat semua tugas yang belum selesai',
      icon: CheckSquare,
      color: 'bg-blue-500',
      path: '/dashboard/tasks'
    },
    {
      title: 'Jadwal Hari Ini',
      description: 'Cek jadwal kuliah hari ini',
      icon: Calendar,
      color: 'bg-green-500',
      path: '/dashboard/schedule'
    },
    {
      title: 'Chat Kelas',
      description: 'Buka percakapan kelas',
      icon: MessageSquare,
      color: 'bg-purple-500',
      path: '/dashboard/chat'
    },
    {
      title: 'Mata Kuliah',
      description: 'Lihat semua mata kuliah',
      icon: BookOpen,
      color: 'bg-orange-500',
      path: '/dashboard/subjects'
    }
  ];

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Add to recent searches if not already there
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 3)]);
      }
      // Perform search logic here
      console.log('Searching for:', query);
    }
  };

  const removeRecentSearch = (searchToRemove: string) => {
    setRecentSearches(prev => prev.filter(search => search !== searchToRemove));
  };

  return (
    <MobileLayout>
      <div className="space-y-6 pb-4">
        {/* Search Header */}
        <div className="mx-4 mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Cari tugas, jadwal, mata kuliah..."
              className="pl-12 pr-4 py-4 text-base rounded-2xl border-2 focus:border-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mx-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center space-x-2 rounded-full whitespace-nowrap ${
                    activeFilter === filter.id 
                      ? 'bg-primary text-white' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index}
                  className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(action.path)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`${action.color} p-2 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white">{action.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mx-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pencarian Terbaru</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRecentSearches([])}
                className="text-gray-500 dark:text-gray-400"
              >
                Hapus Semua
              </Button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <div 
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => {
                      setSearchQuery(search);
                      handleSearch(search);
                    }}
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full"
                    onClick={() => removeRecentSearch(search)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Trending
          </h2>
          <div className="flex flex-wrap gap-2">
            {['Tugas UTS', 'Jadwal Ujian', 'Praktikum Lab', 'Presentasi Kelompok'].map((trend, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="px-3 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => {
                  setSearchQuery(trend);
                  handleSearch(trend);
                }}
              >
                {trend}
              </Badge>
            ))}
          </div>
        </div>

        {/* Search Results Placeholder */}
        {searchQuery && (
          <div className="mx-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Hasil untuk "{searchQuery}"
            </h2>
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
              <CardContent className="p-6 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Fitur pencarian sedang dalam pengembangan
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}