import { supabase } from './supabase';
import { User } from './types';
import Cookies from 'js-cookie';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

// Function untuk login dengan NIM
export const loginWithNIM = async (nim: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with NIM:', nim);

    // Step 1: Cari email berdasarkan NIM dari tabel profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email, id, name, role, semester, nim, avatar_url, created_at, updated_at')
      .eq('nim', nim)
      .single();

    if (profileError || !profileData) {
      console.error('Profile not found:', profileError);
      return {
        user: null,
        error: 'NIM tidak ditemukan'
      };
    }

    if (!profileData.email) {
      return {
        user: null,
        error: 'Email tidak ditemukan untuk NIM ini'
      };
    }

    console.log('Found profile:', profileData);

    // Step 2: Login menggunakan email dan password ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: profileData.email,
      password: password
    });

    if (authError) {
      console.error('Auth error:', authError);
      return {
        user: null,
        error: 'Password salah atau akun tidak aktif'
      };
    }

    if (!authData.user || !authData.session) {
      return {
        user: null,
        error: 'Login gagal'
      };
    }

    console.log('Auth successful:', authData.user.id);

    // Step 3: Buat user object dari data profile
    const user: User = {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      role: profileData.role as 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa',
      npm: profileData.nim, // NIM disimpan sebagai npm di interface User
      semester: profileData.semester || 1,
      avatar: profileData.avatar_url,
      createdAt: new Date(profileData.created_at),
      updatedAt: new Date(profileData.updated_at)
    };

    // Step 4: Simpan session ke cookie
    const sessionData = {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
      user: user
    };

    Cookies.set('supabase-session', JSON.stringify(sessionData), {
      expires: 7, // 7 hari
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    console.log('Login successful, user:', user);

    return {
      user,
      error: null
    };

  } catch (error) {
    console.error('Login exception:', error);
    return {
      user: null,
      error: 'Terjadi kesalahan saat login. Silakan coba lagi.'
    };
  }
};

// Function untuk mendapatkan user saat ini dari cookie
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Cek cookie terlebih dahulu
    const sessionCookie = Cookies.get('supabase-session');
    if (!sessionCookie) {
      return null;
    }

    try {
      const sessionData = JSON.parse(sessionCookie);
      
      // Cek apakah session masih valid
      if (sessionData.expires_at && new Date(sessionData.expires_at * 1000) > new Date()) {
        // Set session ke Supabase client untuk RLS
        await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token
        });
        
        return sessionData.user;
      } else {
        // Session expired, hapus cookie
        Cookies.remove('supabase-session');
        return null;
      }
    } catch (e) {
      console.error('Error parsing session cookie:', e);
      Cookies.remove('supabase-session');
      return null;
    }

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Function untuk logout
export const logout = async (): Promise<void> => {
  try {
    // Logout dari Supabase
    await supabase.auth.signOut();
    
    // Hapus cookie
    Cookies.remove('supabase-session');
    
    // Hapus dari localStorage juga jika ada
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      localStorage.clear();
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Function untuk test koneksi Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Function untuk get all users (admin only) - wrapper untuk RPC
export const getAllUsers = async (): Promise<{
  data: any[] | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase.rpc('get_all_users');
    
    if (error) {
      console.error('Get all users error:', error);
      return { data: null, error: error.message };
    }

    // Convert timestamps to Date objects
    const users = data?.map((user: any) => ({
      ...user,
      created_at: user.created_at ? new Date(user.created_at) : null,
      updated_at: user.updated_at ? new Date(user.updated_at) : null,
      last_sign_in_at: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
    })) || [];

    return { data: users, error: null };
  } catch (error) {
    console.error('Get all users exception:', error);
    return { data: null, error: 'Terjadi kesalahan saat mengambil data users' };
  }
};

// Function untuk create user by admin - wrapper untuk RPC
export const createUserByAdmin = async (userData: {
  nim: string;
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa';
  semester?: number;
  phone?: string;
  bio?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('create_user_by_admin', {
      user_nim: userData.nim,
      user_name: userData.name,
      user_email: userData.email,
      user_password: userData.password,
      user_role: userData.role || 'mahasiswa',
      user_semester: userData.semester || 1,
      user_phone: userData.phone || null,
      user_bio: userData.bio || null
    });

    if (error) {
      console.error('Create user error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Create user exception:', error);
    return { success: false, error: 'Terjadi kesalahan saat membuat user' };
  }
};

// Function untuk update user by admin - wrapper untuk RPC
export const updateUserByAdmin = async (
  userId: string,
  updates: {
    name?: string;
    email?: string;
    role?: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa';
    semester?: number;
    phone?: string;
    bio?: string;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('update_user_by_admin', {
      target_user_id: userId,
      user_name: updates.name || null,
      user_email: updates.email || null,
      user_role: updates.role || null,
      user_semester: updates.semester || null,
      user_phone: updates.phone || null,
      user_bio: updates.bio || null
    });

    if (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Update user exception:', error);
    return { success: false, error: 'Terjadi kesalahan saat update user' };
  }
};

// Function untuk delete user by admin - wrapper untuk RPC
export const deleteUserByAdmin = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('delete_user_by_admin', {
      target_user_id: userId
    });

    if (error) {
      console.error('Delete user error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete user exception:', error);
    return { success: false, error: 'Terjadi kesalahan saat delete user' };
  }
};

// Function untuk reset password user by admin - wrapper untuk RPC
export const resetUserPassword = async (
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('reset_user_password', {
      target_user_id: userId,
      new_password: newPassword
    });

    if (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Reset password exception:', error);
    return { success: false, error: 'Terjadi kesalahan saat reset password' };
  }
};

// Helper function untuk check permission
export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Function untuk update profile (opsional)
export const updateProfile = async (userId: string, updates: Partial<{
  name: string;
  phone: string;
  bio: string;
  semester: number;
  avatar_url: string;
}>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Terjadi kesalahan saat update profile' };
  }
};