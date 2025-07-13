import { supabase } from './supabase';
import { User } from './types';
import Cookies from 'js-cookie';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export const loginWithNIM = async (nim: string, password: string): Promise<AuthResponse> => {
  try {
    // Pertama, cari email berdasarkan NIM menggunakan function
    const { data: nimResult, error: nimError } = await supabase
      .rpc('login_with_nim', {
        nim_input: nim,
        password_input: password
      });

    if (nimError || !nimResult || nimResult.error) {
      return {
        user: null,
        error: nimResult?.error || 'NIM tidak ditemukan'
      };
    }

    const email = nimResult.email;

    // Login menggunakan email yang ditemukan
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return {
        user: null,
        error: 'Password salah atau akun tidak aktif'
      };
    }

    if (!authData.user) {
      return {
        user: null,
        error: 'Login gagal'
      };
    }

    // Ambil data profile lengkap
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return {
        user: null,
        error: 'Gagal mengambil data profile'
      };
    }

    // Buat user object sesuai dengan interface yang ada
    const user: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email || '',
      role: profile.role as 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa',
      npm: profile.nim, // NIM disimpan sebagai npm untuk kompatibilitas
      semester: profile.semester || 1,
      avatar: profile.avatar_url,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    };

    // Simpan session ke cookie
    if (authData.session) {
      Cookies.set('supabase-session', JSON.stringify({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        user: user
      }), {
        expires: 7, // 7 hari
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return {
      user,
      error: null
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      user: null,
      error: 'Terjadi kesalahan saat login'
    };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Cek cookie terlebih dahulu
    const sessionCookie = Cookies.get('supabase-session');
    if (sessionCookie) {
      const sessionData = JSON.parse(sessionCookie);
      
      // Cek apakah session masih valid
      if (sessionData.expires_at && new Date(sessionData.expires_at * 1000) > new Date()) {
        return sessionData.user;
      }
    }

    // Jika tidak ada cookie atau expired, cek session Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }

    // Ambil data profile terbaru
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    const user: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email || '',
      role: profile.role as 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa',
      npm: profile.nim,
      semester: profile.semester || 1,
      avatar: profile.avatar_url,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    };

    // Update cookie dengan data terbaru
    Cookies.set('supabase-session', JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: user
    }), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return user;

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Logout dari Supabase
    await supabase.auth.signOut();
    
    // Hapus cookie
    Cookies.remove('supabase-session');
    
    // Hapus dari localStorage juga
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const registerUser = async (userData: {
  nim: string;
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa';
  semester?: number;
}): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nim: userData.nim,
          name: userData.name,
          role: userData.role || 'mahasiswa',
          semester: userData.semester || 1
        }
      }
    });

    if (authError) {
      return {
        user: null,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        user: null,
        error: 'Registrasi gagal'
      };
    }

    // Jika registrasi berhasil, ambil data profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return {
        user: null,
        error: 'Gagal mengambil data profile setelah registrasi'
      };
    }

    const user: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email || '',
      role: profile.role as 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa',
      npm: profile.nim,
      semester: profile.semester || 1,
      avatar: profile.avatar_url,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    };

    return {
      user,
      error: null
    };

  } catch (error) {
    console.error('Register error:', error);
    return {
      user: null,
      error: 'Terjadi kesalahan saat registrasi'
    };
  }
};

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