"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { hasPermission } from '@/lib/auth';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  Globe,
  Lock,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    nim: user?.nim || '',
    semester: user?.semester || 7,
    phone: '',
    bio: '',
    avatar: user?.avatar || ''
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginNotifications: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    scheduleChanges: true,
    chatMessages: false,
    systemUpdates: true,
    weeklyReport: true,
    reminderTime: '09:00'
  });

  // System settings (admin only)
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Sistem Manajemen Kelas',
    siteDescription: 'Aplikasi manajemen kelas untuk mahasiswa Ilmu Komputer',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: '10',
    allowedFileTypes: 'pdf,doc,docx,jpg,png',
    backupFrequency: 'daily',
    logLevel: 'info'
  });

  const canManageSystem = hasPermission(user?.role || '', ['admin']);

  const handleSaveProfile = () => {
    console.log('Saving profile settings:', profileSettings);
  };

  const handleSaveSecurity = () => {
    console.log('Saving security settings:', securitySettings);
  };

  const handleSaveNotifications = () => {
    console.log('Saving notification settings:', notificationSettings);
  };

  const handleSaveSystem = () => {
    console.log('Saving system settings:', systemSettings);
  };

  const handleExportData = () => {
    console.log('Exporting user data...');
  };

  const handleImportData = () => {
    console.log('Importing data...');
  };

  const handleDeleteAccount = () => {
    console.log('Deleting account...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Pengaturan
            </h1>
            <p className="text-muted-foreground">Kelola preferensi dan konfigurasi akun Anda</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            {canManageSystem && <TabsTrigger value="system">Sistem</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informasi Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={profileSettings.name}
                      onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nim">NIM</Label>
                    <Input
                      id="nim"
                      value={profileSettings.nim}
                      onChange={(e) => setProfileSettings({...profileSettings, nim: e.target.value})}
                      disabled
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={profileSettings.semester.toString()} onValueChange={(value) => setProfileSettings({...profileSettings, semester: parseInt(value)})}>
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
                  
                  <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
                      placeholder="+62 xxx-xxxx-xxxx"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileSettings.bio}
                    onChange={(e) => setProfileSettings({...profileSettings, bio: e.target.value})}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Preferensi Tampilan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode Tema</Label>
                    <p className="text-sm text-muted-foreground">Pilih tema terang atau gelap</p>
                  </div>
                  <Button variant="outline" onClick={toggleTheme}>
                    {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bahasa</Label>
                    <p className="text-sm text-muted-foreground">Pilih bahasa interface</p>
                  </div>
                  <Select defaultValue="id">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Ubah Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={securitySettings.currentPassword}
                      onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securitySettings.newPassword}
                    onChange={(e) => setSecuritySettings({...securitySettings, newPassword: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securitySettings.confirmPassword}
                    onChange={(e) => setSecuritySettings({...securitySettings, confirmPassword: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleSaveSecurity}>
                  <Save className="w-4 h-4 mr-2" />
                  Ubah Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Keamanan Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autentikasi Dua Faktor</Label>
                    <p className="text-sm text-muted-foreground">Tambahkan lapisan keamanan ekstra</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorEnabled: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifikasi Login</Label>
                    <p className="text-sm text-muted-foreground">Dapatkan notifikasi saat ada login baru</p>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, loginNotifications: checked})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sessionTimeout">Timeout Sesi (menit)</Label>
                  <Select value={securitySettings.sessionTimeout} onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 menit</SelectItem>
                      <SelectItem value="30">30 menit</SelectItem>
                      <SelectItem value="60">1 jam</SelectItem>
                      <SelectItem value="120">2 jam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Preferensi Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifikasi Email</Label>
                    <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifikasi Push</Label>
                    <p className="text-sm text-muted-foreground">Terima notifikasi push di browser</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pengingat Tugas</Label>
                    <p className="text-sm text-muted-foreground">Pengingat deadline tugas</p>
                  </div>
                  <Switch
                    checked={notificationSettings.taskReminders}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, taskReminders: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Perubahan Jadwal</Label>
                    <p className="text-sm text-muted-foreground">Notifikasi perubahan jadwal kuliah</p>
                  </div>
                  <Switch
                    checked={notificationSettings.scheduleChanges}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, scheduleChanges: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pesan Chat</Label>
                    <p className="text-sm text-muted-foreground">Notifikasi pesan chat kelas</p>
                  </div>
                  <Switch
                    checked={notificationSettings.chatMessages}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, chatMessages: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Laporan Mingguan</Label>
                    <p className="text-sm text-muted-foreground">Ringkasan aktivitas mingguan</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReport}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReport: checked})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reminderTime">Waktu Pengingat</Label>
                  <Select value={notificationSettings.reminderTime} onValueChange={(value) => setNotificationSettings({...notificationSettings, reminderTime: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="07:00">07:00</SelectItem>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {canManageSystem && (
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Pengaturan Umum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Nama Situs</Label>
                    <Input
                      id="siteName"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="siteDescription">Deskripsi Situs</Label>
                    <Textarea
                      id="siteDescription"
                      value={systemSettings.siteDescription}
                      onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mode Maintenance</Label>
                      <p className="text-sm text-muted-foreground">Aktifkan untuk maintenance sistem</p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Registrasi Pengguna</Label>
                      <p className="text-sm text-muted-foreground">Izinkan registrasi pengguna baru</p>
                    </div>
                    <Switch
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, registrationEnabled: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Pengaturan File & Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maxFileSize">Ukuran File Maksimal (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="allowedFileTypes">Jenis File yang Diizinkan</Label>
                    <Input
                      id="allowedFileTypes"
                      value={systemSettings.allowedFileTypes}
                      onChange={(e) => setSystemSettings({...systemSettings, allowedFileTypes: e.target.value})}
                      placeholder="pdf,doc,docx,jpg,png"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="backupFrequency">Frekuensi Backup</Label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Harian</SelectItem>
                        <SelectItem value="weekly">Mingguan</SelectItem>
                        <SelectItem value="monthly">Bulanan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" onClick={handleImportData}>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-destructive">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Zona Bahaya
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <h4 className="font-medium text-destructive mb-2">Reset Sistem</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Menghapus semua data dan mengembalikan sistem ke pengaturan default.
                    </p>
                    <Button variant="destructive" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Sistem
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveSystem}>
                <Save className="w-4 h-4 mr-2" />
                Simpan Pengaturan Sistem
              </Button>
            </TabsContent>
          )}
        </Tabs>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Manajemen Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data Saya
              </Button>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sinkronisasi Data
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Akun
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}