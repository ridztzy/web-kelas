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
      nim: profileData.nim, 
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
    // 1. Logout dari Supabase. Ini sudah menangani pembersihan token di localStorage.
    await supabase.auth.signOut();
    
    // 2. Hapus cookie sesi kustom Anda. Ini adalah langkah penting.
    Cookies.remove('supabase-session');

    // Tidak perlu localStorage.clear() atau removeItem() secara manual.
    // signOut() sudah cukup.
    
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

// Function untuk mengupdate data user di cookie setelah update profil
export const updateUserInCookie = (updatedData: Partial<User>) => {
  const sessionCookie = Cookies.get('supabase-session');
  if (!sessionCookie) return;

  try {
    const sessionData = JSON.parse(sessionCookie);

    const updatedUser = {
      ...sessionData.user,
      ...updatedData
    };

    const newSessionData = {
      ...sessionData,
      user: updatedUser
    };

    Cookies.set('supabase-session', JSON.stringify(newSessionData), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    console.log('Session cookie updated:', updatedUser);
  } catch (error) {
    console.error('Gagal update session cookie:', error);
  }
};
