"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { updateUserInCookie } from "@/lib/auth-supabase";
import { hasPermission } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
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
  RefreshCw,
  KeyRound,
  MessageSquare,
  AlertCircle,
  Loader2,
  Camera,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, refreshUser, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState(""); // 'email' atau 'whatsapp'
  const [feedbackMessage, setFeedbackMessage] = useState({
    type: "",
    text: "",
  }); // Untuk notifikasi

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    nim: "",
    semester: 7,
    phone: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      // TAMBAHKAN BARIS INI UNTUK MELIHAT ISI OBJEK USER
      console.log("Mengecek isi objek 'user':", user);

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

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginNotifications: true,
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
    reminderTime: "09:00",
  });

  // System settings (admin only)
  const [systemSettings, setSystemSettings] = useState({
    siteName: "Sistem Manajemen Kelas",
    siteDescription: "Aplikasi manajemen kelas untuk mahasiswa Ilmu Komputer",
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: "10",
    allowedFileTypes: "pdf,doc,docx,jpg,png",
    backupFrequency: "daily",
    logLevel: "info",
  });

  const canManageSystem = hasPermission(user?.role || "", ["admin"]);

  const handleSendVerificationCode = async (method: "email" | "whatsapp") => {
    if (!newEmail) {
      setFeedbackMessage({
        type: "error",
        text: "Email baru tidak boleh kosong.",
      });
      return;
    }

    setIsVerifying(true);
    setFeedbackMessage({ type: "", text: "" });
    console.log(`Mengirim kode verifikasi ke ${newEmail} via ${method}...`);

    // Simulasi pengiriman kode
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setCodeSent(true);
    setVerificationMethod(method);
    setIsVerifying(false);
    setFeedbackMessage({
      type: "success",
      text: `Kode verifikasi telah dikirim ke ${
        method === "email" ? newEmail : "nomor WhatsApp Anda"
      }.`,
    });
  };

  const handleVerifyAndChangeEmail = async () => {
    if (!verificationCode) {
      setFeedbackMessage({
        type: "error",
        text: "Kode verifikasi tidak boleh kosong.",
      });
      return;
    }

    setIsVerifying(true);
    setFeedbackMessage({ type: "", text: "" });
    console.log(
      `Memverifikasi kode ${verificationCode} untuk email ${newEmail}...`
    );

    // Simulasi verifikasi kode
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Jika berhasil
    // setProfileSettings(prev => ({ ...prev, email: newEmail })); // Update email di state utama
    setFeedbackMessage({ type: "success", text: "Email berhasil diperbarui!" });

    // Reset state ganti email
    setTimeout(() => {
      setNewEmail("");
      setVerificationCode("");
      setCodeSent(false);
      setIsVerifying(false);
      setVerificationMethod("");
      setFeedbackMessage({ type: "", text: "" });
    }, 2000);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user?.id, // pastikan kamu udah punya ID user
          ...profileSettings,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan profil.");
      }
      // ✅ Tambahkan ini setelah berhasil update profil
      const updatedUser = {
        name: profileSettings.name,
        semester: profileSettings.semester,
        phone: profileSettings.phone,
        bio: profileSettings.bio,
        avatar_url: profileSettings.avatar_url,
      };

      updateUserInCookie(updatedUser); // update cookie
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

  // ...di dalam komponen SettingsPage setelah deklarasi state

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file); // Simpan file ke state
      setAvatarPreview(URL.createObjectURL(file)); // Buat URL preview
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

    // --- LOGIKA UPLOAD ---
    // Di aplikasi nyata, Anda akan menggunakan FormData untuk mengirim file
    // ke API endpoint Anda (misalnya, menggunakan fetch atau axios).
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    formData.append("userId", user?.id || ""); // Kirim ID user

    try {
      // Ganti '/api/avatar' dengan endpoint Anda yang sebenarnya
      const response = await fetch("/api/avatar", {
        // Anda perlu membuat API route ini
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengunggah avatar.");
      }

      // Jika berhasil, perbarui URL di state utama dan UI
      setProfileSettings((prev) => ({ ...prev, avatar_url: result.url }));
      setAvatarPreview(null); // Hapus preview setelah berhasil
      setAvatarFile(null); // Hapus file dari state

      // Perbarui juga data user di AuthContext agar avatar baru muncul di semua halaman
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

  const handleSaveSecurity = () => {
    console.log("Saving security settings:", securitySettings);
  };

  const handleSaveNotifications = () => {
    console.log("Saving notification settings:", notificationSettings);
  };

  const handleSaveSystem = () => {
    console.log("Saving system settings:", systemSettings);
  };

  const handleExportData = () => {
    console.log("Exporting user data...");
  };

  const handleImportData = () => {
    console.log("Importing data...");
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
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
            <p className="text-muted-foreground">
              Kelola preferensi dan konfigurasi akun Anda
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            {canManageSystem && (
              <TabsTrigger value="system">Sistem</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informasi Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Kolom Avatar */}

                  <div className="flex flex-col items-center gap-3 w-full md:w-48">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40">
                      <AvatarImage
                        // Tampilkan preview jika ada, jika tidak, tampilkan avatar_url dari database
                        src={avatarPreview || profileSettings.avatar_url || ""}
                        alt="Foto Profil"
                      />
                      <AvatarFallback>
                        {/* Fallback inisial nama */}
                        {profileSettings.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Input file yang disembunyikan */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif" // Batasi tipe file
                    />

                    {/* Tombol akan berubah tergantung kondisi */}
                    {avatarFile ? (
                      // Tampilkan tombol Simpan & Batal jika ada file yang dipilih
                      <div className="w-full space-y-2">
                        <Button
                          onClick={handleUploadAvatar}
                          className="w-full"
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Mengunggah...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Simpan Foto
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                          disabled={isUploading}
                        >
                          Batal
                        </Button>
                      </div>
                    ) : (
                      // Tombol default untuk memilih file
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()} // Picu klik pada input tersembunyi
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Ganti Foto
                      </Button>
                    )}
                  </div>

                  {/* Kolom Form */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          value={profileSettings.name}
                          onChange={(e) =>
                            setProfileSettings({
                              ...profileSettings,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email Saat Ini</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileSettings.email}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email tidak bisa diubah.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="nim">NIM</Label>
                        <Input id="nim" value={profileSettings.nim} disabled />
                      </div>

                      <div>
                        <Label htmlFor="semester">Semester</Label>
                        <Select
                          value={profileSettings.semester.toString()}
                          onValueChange={(value) =>
                            setProfileSettings({
                              ...profileSettings,
                              semester: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
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

                      <div className="sm:col-span-2">
                        <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
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
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
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
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
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
              </CardFooter>
            </Card>

            {/* [BARU] CARD UNTUK GANTI EMAIL DENGAN VERIFIKASI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Ganti Alamat Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tampilkan notifikasi feedback */}
                {feedbackMessage.text && (
                  <Alert
                    variant={
                      feedbackMessage.type === "error"
                        ? "destructive"
                        : "default"
                    }
                    className={
                      feedbackMessage.type === "success"
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : ""
                    }
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      {feedbackMessage.type === "error" ? "Error" : "Informasi"}
                    </AlertTitle>
                    <AlertDescription>{feedbackMessage.text}</AlertDescription>
                  </Alert>
                )}

                {/* Bagian 1: Input Email Baru & Pilihan Kirim Kode */}
                {!codeSent && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-email">Email Baru</Label>
                      <Input
                        id="new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Masukkan email baru yang aktif"
                        disabled={isVerifying}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleSendVerificationCode("email")}
                        disabled={!newEmail || isVerifying}
                        className="w-full"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {isVerifying && verificationMethod === "email"
                          ? "Mengirim..."
                          : "Kirim Kode ke Email Baru"}
                      </Button>
                      <Button
                        onClick={() => handleSendVerificationCode("whatsapp")}
                        disabled={!newEmail || isVerifying}
                        className="w-full"
                        variant="secondary"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {isVerifying && verificationMethod === "whatsapp"
                          ? "Mengirim..."
                          : "Kirim Kode ke WhatsApp"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bagian 2: Input Kode Verifikasi */}
                {codeSent && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-email-disabled">Email Baru</Label>
                      <Input
                        id="new-email-disabled"
                        value={newEmail}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="verification-code">Kode Verifikasi</Label>
                      <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Masukkan 6 digit kode"
                        disabled={isVerifying}
                      />
                    </div>
                    <Button
                      onClick={handleVerifyAndChangeEmail}
                      disabled={!verificationCode || isVerifying}
                      className="w-full"
                    >
                      <KeyRound className="w-4 h-4 mr-2" />
                      {isVerifying
                        ? "Memverifikasi..."
                        : "Verifikasi & Ganti Email"}
                    </Button>
                  </div>
                )}
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
                    <p className="text-sm text-muted-foreground">
                      Pilih tema terang atau gelap
                    </p>
                  </div>
                  <Button variant="outline" onClick={toggleTheme}>
                    {theme === "light" ? "Mode Gelap" : "Mode Terang"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bahasa</Label>
                    <p className="text-sm text-muted-foreground">
                      Pilih bahasa interface
                    </p>
                  </div>
                  <Select defaultValue="id">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="en">Ra onok cuy</SelectItem>
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
                      type={showPassword ? "text" : "password"}
                      value={securitySettings.currentPassword}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
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
                  <Label htmlFor="newPassword">Password Baru</Label>
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
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">
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
                    <p className="text-sm text-muted-foreground">
                      Tambahkan lapisan keamanan ekstra
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorEnabled: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifikasi Login</Label>
                    <p className="text-sm text-muted-foreground">
                      Dapatkan notifikasi saat ada login baru
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        loginNotifications: checked,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Timeout Sesi (menit)</Label>
                  <Select
                    value={securitySettings.sessionTimeout}
                    onValueChange={(value) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: value,
                      })
                    }
                  >
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
                    <p className="text-sm text-muted-foreground">
                      Terima notifikasi melalui email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifikasi Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Terima notifikasi push di browser
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pengingat Tugas</Label>
                    <p className="text-sm text-muted-foreground">
                      Pengingat deadline tugas
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.taskReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        taskReminders: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Perubahan Jadwal</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifikasi perubahan jadwal kuliah
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.scheduleChanges}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        scheduleChanges: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pesan Chat</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifikasi pesan chat kelas
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.chatMessages}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        chatMessages: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Laporan Mingguan</Label>
                    <p className="text-sm text-muted-foreground">
                      Ringkasan aktivitas mingguan
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReport}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        weeklyReport: checked,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="reminderTime">Waktu Pengingat</Label>
                  <Select
                    value={notificationSettings.reminderTime}
                    onValueChange={(value) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        reminderTime: value,
                      })
                    }
                  >
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
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          siteName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="siteDescription">Deskripsi Situs</Label>
                    <Textarea
                      id="siteDescription"
                      value={systemSettings.siteDescription}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          siteDescription: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mode Maintenance</Label>
                      <p className="text-sm text-muted-foreground">
                        Aktifkan untuk maintenance sistem
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSystemSettings({
                          ...systemSettings,
                          maintenanceMode: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Registrasi Pengguna</Label>
                      <p className="text-sm text-muted-foreground">
                        Izinkan registrasi pengguna baru
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) =>
                        setSystemSettings({
                          ...systemSettings,
                          registrationEnabled: checked,
                        })
                      }
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
                    <Label htmlFor="maxFileSize">
                      Ukuran File Maksimal (MB)
                    </Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          maxFileSize: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="allowedFileTypes">
                      Jenis File yang Diizinkan
                    </Label>
                    <Input
                      id="allowedFileTypes"
                      value={systemSettings.allowedFileTypes}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          allowedFileTypes: e.target.value,
                        })
                      }
                      placeholder="pdf,doc,docx,jpg,png"
                    />
                  </div>

                  <div>
                    <Label htmlFor="backupFrequency">Frekuensi Backup</Label>
                    <Select
                      value={systemSettings.backupFrequency}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          backupFrequency: value,
                        })
                      }
                    >
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
                    <h4 className="font-medium text-destructive mb-2">
                      Reset Sistem
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Menghapus semua data dan mengembalikan sistem ke
                      pengaturan default.
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
