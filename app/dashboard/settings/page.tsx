"use client";

import { useState, useEffect, useRef } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { updateUserInCookie } from "@/lib/auth-supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  Lock,
  Trash2,
  RefreshCw,
  KeyRound,
  MessageSquare,
  AlertCircle,
  Loader2,
  Camera,
  ChevronRight,
  Moon,
  Sun
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, refreshUser, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    nim: "",
    semester: 7,
    phone: "",
    bio: "",
    avatar_url: "",
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginNotifications: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    scheduleChanges: true,
    chatMessages: false,
    systemUpdates: true,
    weeklyReport: true,
    reminderTime: "09:00",
  });

  useEffect(() => {
    if (user) {
      setProfileSettings({
        name: user.name || "",
        email: user.email || "",
        nim: user.nim || "",
        semester: user.semester || 7,
        phone: user.phone || "",
        bio: user.bio || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user?.id,
          ...profileSettings,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan profil.");
      }

      const updatedUser = {
        name: profileSettings.name,
        semester: profileSettings.semester,
        phone: profileSettings.phone,
        bio: profileSettings.bio,
        avatar_url: profileSettings.avatar_url,
      };

      updateUserInCookie(updatedUser);
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));

      toast({
        title: "Sukses!",
        description: "Profil Anda berhasil diperbarui.",
      });

      await refreshUser();
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      toast({
        title: "Tidak ada file",
        description: "Pilih file gambar terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("avatar", avatarFile);
    formData.append("userId", user?.id || "");

    try {
      const response = await fetch("/api/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengunggah avatar.");
      }

      setProfileSettings((prev) => ({ ...prev, avatar_url: result.url }));
      setAvatarPreview(null);
      setAvatarFile(null);

      const updatedUser = { avatar_url: result.url };
      updateUserInCookie(updatedUser);
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));

      toast({
        title: "Sukses!",
        description: "Foto profil berhasil diperbarui.",
      });
    } catch (error: any) {
      toast({
        title: "Gagal Mengunggah",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSecurity = async () => {
    const { currentPassword, newPassword, confirmPassword } = securitySettings;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Semua field password harus diisi.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi password tidak cocok.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password baru minimal harus 6 karakter.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({ 
        title: "Error", 
        description: "User tidak ditemukan, silakan login ulang.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSavingSecurity(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengubah password.");
      }

      toast({
        title: "Sukses!",
        description: "Password Anda berhasil diperbarui.",
      });

      setSecuritySettings({
        ...securitySettings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPassword(false);
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    action, 
    onClick 
  }: {
    icon: any;
    title: string;
    description?: string;
    action?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div 
      className={`flex items-center justify-between p-4 ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{title}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      {action || (onClick && <ChevronRight className="w-4 h-4 text-gray-400" />)}
    </div>
  );

  return (
    <MobileLayout>
      <div className="space-y-4 pb-4">
        {/* Profile Section */}
        <div className="mx-4 mt-4">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={avatarPreview || profileSettings.avatar_url || ""}
                      alt="Foto Profil"
                    />
                    <AvatarFallback className="text-2xl">
                      {profileSettings.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    NIM: {user?.nim}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {user?.role?.replace('_', ' ') || 'Student'}
                  </p>
                </div>

                {avatarFile && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleUploadAvatar}
                      disabled={isUploading}
                      size="sm"
                      className="rounded-full"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Simpan Foto"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      disabled={isUploading}
                      className="rounded-full"
                    >
                      Batal
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Profil</h2>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={profileSettings.name}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        name: e.target.value,
                      })
                    }
                    className="mobile-input mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+62 xxx-xxxx-xxxx"
                    className="mobile-input mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="semester" className="text-sm font-medium">Semester</Label>
                  <Select
                    value={profileSettings.semester.toString()}
                    onValueChange={(value) =>
                      setProfileSettings({
                        ...profileSettings,
                        semester: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="mobile-input mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileSettings.bio}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        bio: e.target.value,
                      })
                    }
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    rows={3}
                    className="mobile-input mt-1"
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSavingProfile}
                  className="w-full mobile-button"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Keamanan</h2>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm font-medium">Password Saat Ini</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={securitySettings.currentPassword}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          currentPassword: e.target.value,
                        })
                      }
                      className="mobile-input pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securitySettings.newPassword}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        newPassword: e.target.value,
                      })
                    }
                    className="mobile-input mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Konfirmasi Password Baru
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securitySettings.confirmPassword}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="mobile-input mt-1"
                  />
                </div>

                <Button
                  onClick={handleSaveSecurity}
                  disabled={isSavingSecurity}
                  className="w-full mobile-button"
                >
                  {isSavingSecurity ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Ubah Password
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Settings */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Pengaturan Aplikasi</h2>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
            <CardContent className="p-0">
              <SettingItem
                icon={theme === 'light' ? Moon : Sun}
                title="Tema Aplikasi"
                description={theme === 'light' ? 'Mode Terang' : 'Mode Gelap'}
                action={
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                }
              />
              <Separator />
              <SettingItem
                icon={Bell}
                title="Notifikasi Push"
                description="Terima notifikasi di perangkat"
                action={
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: checked,
                      })
                    }
                  />
                }
              />
              <Separator />
              <SettingItem
                icon={MessageSquare}
                title="Notifikasi Chat"
                description="Notifikasi pesan chat kelas"
                action={
                  <Switch
                    checked={notificationSettings.chatMessages}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        chatMessages: checked,
                      })
                    }
                  />
                }
              />
              <Separator />
              <SettingItem
                icon={AlertCircle}
                title="Pengingat Tugas"
                description="Pengingat deadline tugas"
                action={
                  <Switch
                    checked={notificationSettings.taskReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        taskReminders: checked,
                      })
                    }
                  />
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <div className="mx-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Akun</h2>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
            <CardContent className="p-0">
              <SettingItem
                icon={RefreshCw}
                title="Sinkronisasi Data"
                description="Sinkronkan data dengan server"
                onClick={() => {
                  toast({
                    title: "Sinkronisasi",
                    description: "Data berhasil disinkronkan",
                  });
                }}
              />
              <Separator />
              <SettingItem
                icon={Trash2}
                title="Hapus Akun"
                description="Hapus akun secara permanen"
                onClick={() => {
                  // Handle account deletion
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
      </div>
    </MobileLayout>
  );
}