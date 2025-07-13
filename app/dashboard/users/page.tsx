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
import { users } from '@/lib/data';
import { User } from '@/lib/types';
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCircle,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  GraduationCap,
  Crown,
  FileText,
  UserCheck,
  UserX,
  Download,
  Upload
} from 'lucide-react';

export default function UsersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('semua');
  const [filterSemester, setFilterSemester] = useState('semua');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    npm: '',
    role: 'mahasiswa' as 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa',
    semester: 7
  });

  const canManageUsers = hasPermission(user?.role || '', ['admin']);
  const canViewUsers = hasPermission(user?.role || '', ['admin', 'ketua_kelas', 'sekretaris']);

  if (!canViewUsers) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
            <p className="text-muted-foreground">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.npm.includes(searchTerm);
    const matchesRole = filterRole === 'semua' || user.role === filterRole;
    const matchesSemester = filterSemester === 'semua' || user.semester.toString() === filterSemester;
    
    return matchesSearch && matchesRole && matchesSemester;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'ketua_kelas':
        return <Crown className="w-4 h-4" />;
      case 'sekretaris':
        return <FileText className="w-4 h-4" />;
      default:
        return <UserCircle className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'ketua_kelas':
        return 'default';
      case 'sekretaris':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'ketua_kelas':
        return 'Ketua Kelas';
      case 'sekretaris':
        return 'Sekretaris';
      default:
        return 'Mahasiswa';
    }
  };

  const handleCreateUser = () => {
    console.log('Creating user:', newUser);
    setNewUser({
      name: '',
      email: '',
      npm: '',
      role: 'mahasiswa',
      semester: 7
    });
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Deleting user:', userId);
  };

  const handleEditUser = (userId: string) => {
    console.log('Editing user:', userId);
  };

  const UserCard = ({ userData }: { userData: User }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <UserCircle className="w-10 h-10 text-primary" />
            <div>
              <h3 className="font-medium">{userData.name}</h3>
              <p className="text-sm text-muted-foreground">NPM: {userData.npm}</p>
            </div>
          </div>
          {canManageUsers && (
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={() => handleEditUser(userData.id)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteUser(userData.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{userData.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Semester {userData.semester}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              Bergabung {userData.createdAt.toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant={getRoleColor(userData.role)} className="flex items-center space-x-1">
            {getRoleIcon(userData.role)}
            <span>{getRoleText(userData.role)}</span>
          </Badge>
          <div className="flex items-center space-x-1">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">Aktif</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const UserTable = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium">Pengguna</th>
                <th className="text-left p-4 font-medium">NPM</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Semester</th>
                <th className="text-left p-4 font-medium">Status</th>
                {canManageUsers && <th className="text-left p-4 font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userData) => (
                <tr key={userData.id} className="border-b hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <UserCircle className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{userData.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Bergabung {userData.createdAt.toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono">{userData.npm}</td>
                  <td className="p-4">{userData.email}</td>
                  <td className="p-4">
                    <Badge variant={getRoleColor(userData.role)} className="flex items-center space-x-1 w-fit">
                      {getRoleIcon(userData.role)}
                      <span>{getRoleText(userData.role)}</span>
                    </Badge>
                  </td>
                  <td className="p-4">{userData.semester}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Aktif</span>
                    </div>
                  </td>
                  {canManageUsers && (
                    <td className="p-4">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(userData.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(userData.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  )}
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
            <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
            <p className="text-muted-foreground">Kelola pengguna dan hak akses sistem</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            {canManageUsers && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pengguna
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        placeholder="Nama lengkap"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="email@student.ac.id"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="npm">NPM</Label>
                      <Input
                        id="npm"
                        value={newUser.npm}
                        onChange={(e) => setNewUser({...newUser, npm: e.target.value})}
                        placeholder="2021001"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                          <SelectItem value="sekretaris">Sekretaris</SelectItem>
                          <SelectItem value="ketua_kelas">Ketua Kelas</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="semester">Semester</Label>
                      <Select value={newUser.semester.toString()} onValueChange={(value) => setNewUser({...newUser, semester: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8].map(sem => (
                            <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button onClick={handleCreateUser} className="w-full">
                      Simpan Pengguna
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
                  <p className="text-sm text-muted-foreground">Total Pengguna</p>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mahasiswa</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.role === 'mahasiswa').length}
                  </p>
                </div>
                <UserCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pengurus</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {users.filter(u => ['ketua_kelas', 'sekretaris'].includes(u.role)).length}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admin</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Cari Pengguna</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nama, email, atau NPM..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="filterRole">Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Role</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="ketua_kelas">Ketua Kelas</SelectItem>
                    <SelectItem value="sekretaris">Sekretaris</SelectItem>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filterSemester">Semester</Label>
                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Semester</SelectItem>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                    ))}
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

        {/* Users Display */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cards">Tampilan Kartu</TabsTrigger>
            <TabsTrigger value="table">Tampilan Tabel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((userData) => (
                <UserCard key={userData.id} userData={userData} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="table" className="space-y-4">
            <UserTable />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}