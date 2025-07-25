"use client";

import { useState } from "react";
import { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/auth";

import { User } from "@/lib/types";
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
  Upload,
  Key,
  Loader2,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("semua");
  const [filterSemester, setFilterSemester] = useState("semua");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [newUser, setNewUser] = useState({
    nim: "",
    name: "",
    email: "",
    role: "mahasiswa" as "admin" | "ketua_kelas" | "sekretaris" | "mahasiswa",
    semester: 1,
    password: "",
    phone: "",
    bio: "",
  });
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "mahasiswa" as "admin" | "ketua_kelas" | "sekretaris" | "mahasiswa",
    semester: 1,
    phone: "",
    bio: "",
  });
  const [newPassword, setNewPassword] = useState("");

  const canManageUsers = hasPermission(user?.role || "", ["admin"]);



  if (!canManageUsers) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
            <p className="text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Load users data
const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengambil data pengguna');
      }

      // Pastikan data yang diterima adalah array
      if (Array.isArray(result.data)) {
        // Mengonversi string tanggal menjadi objek Date
        const usersWithDateObjects = result.data.map((user: any) => ({
          ...user,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
          lastSignInAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
        }));
        setUsers(usersWithDateObjects as User[]);
      } else {
        throw new Error('Format data yang diterima tidak sesuai');
      }

    } catch (error: any) {
      console.error("Terjadi kesalahan saat memuat data:", error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan fatal saat memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nim.includes(searchTerm);
    const matchesRole = filterRole === "semua" || user.role === filterRole;
    const matchesSemester =
      filterSemester === "semua" || user.semester.toString() === filterSemester;

    return matchesSearch && matchesRole && matchesSemester;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "ketua_kelas":
        return <Crown className="w-4 h-4" />;
      case "sekretaris":
        return <FileText className="w-4 h-4" />;
      default:
        return <UserCircle className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "ketua_kelas":
        return "default";
      case "sekretaris":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "ketua_kelas":
        return "Ketua Kelas";
      case "sekretaris":
        return "Sekretaris";
      default:
        return "Mahasiswa";
    }
  };

const handleCreateUser = async () => {
    if (!newUser.nim || !newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "NIM, Nama, Email, dan Password tidak boleh kosong.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading("create");
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan di server.');
      }

      toast({
        title: "Sukses",
        description: "Pengguna baru berhasil dibuat.",
      });

      setShowCreateDialog(false);
      setNewUser({
        nim: "",
        name: "",
        email: "",
        role: "mahasiswa",
        semester: 1,
        password: "",
        phone: "",
        bio: "",
      });
      loadUsers(); // Muat ulang data pengguna untuk menampilkan pengguna baru
      console.log('data baru', setNewUser)

    } catch (error: any) {
      toast({
        title: "Gagal Membuat Pengguna",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = (userData: User) => {
    setEditingUser(userData);
    setEditUser({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      semester: userData.semester,
      phone: "", // Will be loaded from database if needed
      bio: "", // Will be loaded from database if needed
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setActionLoading("update");
    try {
      // Panggil API route PATCH
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: editingUser.id,
          ...editUser, // Kirim semua data dari state editUser
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memperbarui pengguna.');
      }

      toast({
        title: "Sukses",
        description: "User berhasil diupdate",
      });
      setShowEditDialog(false);
      setEditingUser(null);
      loadUsers(); // Muat ulang data untuk menampilkan perubahan

    } catch (error: any) {
      toast({
        title: "Error Saat Memperbarui",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const proceedWithDelete = async () => {
    if (!userToDelete) return;

    setActionLoading(`delete-${userToDelete.id}`);
    try {
      const response = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menghapus pengguna.');
      }

      toast({
        title: "Sukses",
        description: `Pengguna "${userToDelete.name}" berhasil dihapus.`,
      });

      loadUsers(); // Muat ulang data
    
    } catch (error: any) {
      toast({
        title: "Error Saat Menghapus",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      // Tutup dialog dan reset state
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setActionLoading(null);
    }
  };
  const handleDeleteUser = (userId: string, userName: string) => {
    // Simpan data user yang akan dihapus dan tampilkan dialog
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteConfirm(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword) {
      toast({
        title: "Error",
        description: "Mohon masukkan password baru",
        variant: "destructive",
      });
      return;
    }

    setActionLoading("reset-password");
    try {
      // Panggil API route PUT
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          newPassword: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mereset password.');
      }

      toast({
        title: "Sukses",
        description: "Password berhasil direset",
      });
      setShowPasswordDialog(false);
      setNewPassword("");
      setSelectedUserId("");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openPasswordDialog = (userId: string) => {
    setSelectedUserId(userId);
    setShowPasswordDialog(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Memuat data users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const UserCard = ({ userData }: { userData: User }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
  {/* Logika untuk menampilkan gambar atau ikon */}
  {userData.avatar_url ? (
    <img
      src={userData.avatar_url}
      alt={userData.name}
      className="w-10 h-10 rounded-full object-cover"
    />
  ) : (
    <UserCircle className="w-10 h-10 text-primary" />
  )}

  <div>
    <h3 className="font-medium">{userData.name}</h3>
    <p className="text-sm text-muted-foreground">
      NIM: {userData.nim}
    </p>
  </div>
</div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditUser(userData)}
              disabled={actionLoading !== null}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openPasswordDialog(userData.id)}
              disabled={actionLoading !== null}
            >
              <Key className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUser(userData.id, userData.name)}
              className="text-destructive hover:text-destructive"
              disabled={actionLoading !== null || userData.id === user?.id}
            >
              {actionLoading === `delete-${userData.id}` ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
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
              Bergabung{" "}
              {userData.createdAt
                ? userData.createdAt.toLocaleDateString("id-ID")
                : "Tanggal tidak tersedia"}
            </span>
          </div>
          {userData.lastSignInAt && (
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Login terakhir{" "}
                {userData.lastSignInAt.toLocaleDateString("id-ID")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant={getRoleColor(userData.role)}
            className="flex items-center space-x-1"
          >
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
                <th className="text-left p-4 font-medium">NIM</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Semester</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Aksi</th>
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
                          Bergabung{" "}
                          {userData.createdAt
                            ? userData.createdAt.toLocaleDateString("id-ID")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono">{userData.nim}</td>
                  <td className="p-4">{userData.email}</td>
                  <td className="p-4">
                    <Badge
                      variant={getRoleColor(userData.role)}
                      className="flex items-center space-x-1 w-fit"
                    >
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
                  <td className="p-4">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(userData)}
                        disabled={actionLoading !== null}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPasswordDialog(userData.id)}
                        disabled={actionLoading !== null}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteUser(userData.id, userData.name)
                        }
                        className="text-destructive hover:text-destructive"
                        disabled={
                          actionLoading !== null || userData.id === user?.id
                        }
                      >
                        {actionLoading === `delete-${userData.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
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
            <p className="text-muted-foreground">
              Kelola pengguna dan hak akses sistem
            </p>
          </div>

        
      {/* Primary Actions - Always visible */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  {/* Primary Actions - Modified for better mobile layout */}
  <div className="flex items-center gap-2 flex-wrap">
    {/* Refresh Button - Always show icon, show text when possible */}
    <Button
      variant="outline"
      size="sm"
      onClick={loadUsers}
      disabled={loading}
      className="flex-shrink-0"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      <span className="sr-only xs:not-sr-only xs:ml-2">Refresh</span>
    </Button>
    
    {/* Desktop: Show all buttons */}
    <div className="hidden md:flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm">
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>
    </div>

    {/* Mobile: Better dropdown trigger */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden px-3">
          <MoreHorizontal className="w-4 h-4" />
          <span className="sr-only">More actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Download className="w-4 h-4 mr-2" />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Upload className="w-4 h-4 mr-2" />
          Import
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  {/* Primary CTA - Improved mobile layout */}
  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
    <DialogTrigger asChild>
      <Button className="w-full sm:w-auto flex-shrink-0">
        <Plus className="w-4 h-4" />
        <span className="ml-2">Tambah Pengguna</span>
      </Button>
    </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="nim">NIM</Label>
                <Input
                  id="nim"
                  value={newUser.nim}
                  onChange={(e) =>
                    setNewUser({ ...newUser, nim: e.target.value })
                  }
                  placeholder="2021001"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="Nama lengkap"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="email@student.ac.id"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Password"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: any) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
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
                  <Select
                    value={newUser.semester.toString()}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, semester: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="mt-1">
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
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
              <Button
                onClick={handleCreateUser}
                className="w-full sm:w-auto"
                disabled={actionLoading === "create"}
              >
                {actionLoading === "create" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  "Simpan Pengguna"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Pengguna</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  placeholder="email@student.ac.id"
                />
              </div>

              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value: any) =>
                    setEditUser({ ...editUser, role: value })
                  }
                >
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
                <Label htmlFor="edit-semester">Semester</Label>
                <Select
                  value={editUser.semester.toString()}
                  onValueChange={(value) =>
                    setEditUser({ ...editUser, semester: parseInt(value) })
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

              <Button
                onClick={handleUpdateUser}
                className="w-full"
                disabled={actionLoading === "update"}
              >
                {actionLoading === "update" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengupdate...
                  </>
                ) : (
                  "Update Pengguna"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Masukkan password baru untuk user ini. Password akan langsung
                  aktif setelah direset.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="new-password">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                />
              </div>

              <Button
                onClick={handleResetPassword}
                className="w-full"
                disabled={actionLoading === "reset-password"}
              >
                {actionLoading === "reset-password" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mereset...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Pengguna
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.length}
                  </p>
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
                    {users.filter((u) => u.role === "mahasiswa").length}
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
                    {
                      users.filter((u) =>
                        ["ketua_kelas", "sekretaris"].includes(u.role)
                      ).length
                    }
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
                    {users.filter((u) => u.role === "admin").length}
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
                    placeholder="Nama, email, atau NIM..."
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
                <Select
                  value={filterSemester}
                  onValueChange={setFilterSemester}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Semester</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
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

          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda Benar-Benar Yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengguna
            <strong className="mx-1">{userToDelete?.name}</strong>
            secara permanen dari server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setUserToDelete(null)}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={proceedWithDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!!actionLoading}
          >
            {actionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Ya, Hapus Pengguna"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </DashboardLayout>
  );
}
