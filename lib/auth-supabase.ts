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

    // Set session untuk memastikan RLS berfungsi
    await supabase.auth.setSession({
      access_token: authData.session?.access_token || '',
      refresh_token: authData.session?.refresh_token || ''
    });

    // Tunggu sebentar untuk memastikan session tersimpan
    await new Promise(resolve => setTimeout(resolve, 100));

    // Ambil data profile lengkap dengan session yang sudah di-set
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      
      // Jika gagal dengan query biasa, coba dengan RPC function
      try {
        const { data: profileRpc, error: rpcError } = await supabase
          .rpc('get_user_profile', { user_id: authData.user.id });
        
        if (rpcError || !profileRpc) {
          return {
            user: null,
            error: 'Gagal mengambil data profile: ' + (rpcError?.message || 'Data tidak ditemukan')
          };
        }
        
        // Gunakan data dari RPC
        const user: User = {
          id: profileRpc.id,
          name: profileRpc.name,
          email: profileRpc.email || '',
          role: profileRpc.role as 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa',
          npm: profileRpc.nim,
          semester: profileRpc.semester || 1,
          avatar: profileRpc.avatar_url,
          createdAt: new Date(profileRpc.created_at),
          updatedAt: new Date(profileRpc.updated_at)
        };

        // Simpan session ke cookie
        if (authData.session) {
          Cookies.set('supabase-session', JSON.stringify({
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: authData.session.expires_at,
            user: user
          }), {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }

        return { user, error: null };
        
      } catch (rpcError) {
        return {
          user: null,
          error: 'Gagal mengambil data profile'
        };
      }
    }

    if (!profile) {
      return {
        user: null,
        error: 'Data profile tidak ditemukan'
      };
    }

    // Buat user object sesuai dengan interface yang ada
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

    // Simpan session ke cookie
    if (authData.session) {
      Cookies.set('supabase-session', JSON.stringify({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        user: user
      }), {
        expires: 7,
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
      try {
        const sessionData = JSON.parse(sessionCookie);
        
        // Cek apakah session masih valid
        if (sessionData.expires_at && new Date(sessionData.expires_at * 1000) > new Date()) {
          // Set session ke Supabase client
          await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token
          });
          
          return sessionData.user;
        }
      } catch (e) {
        console.error('Error parsing session cookie:', e);
        Cookies.remove('supabase-session');
      }
    }

    // Jika tidak ada cookie atau expired, cek session Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }

    // Ambil data profile terbaru dengan berbagai cara
    let profile = null;
    let profileError = null;

    // Coba dengan query biasa
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      profile = data;
      profileError = error;
    } catch (e) {
      profileError = e;
    }

    // Jika gagal, coba dengan RPC function
    if (profileError || !profile) {
      try {
        const { data: profileRpc, error: rpcError } = await supabase
          .rpc('get_user_profile', { user_id: session.user.id });
        
        if (!rpcError && profileRpc) {
          profile = profileRpc;
          profileError = null;
        }
      } catch (e) {
        console.error('RPC error:', e);
      }
    }

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
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
      localStorage.clear();
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

    // Tunggu sebentar untuk trigger berjalan
    await new Promise(resolve => setTimeout(resolve, 1000));

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

// Admin functions untuk CRUD users
export const createUserByAdmin = async (userData: {
  nim: string;
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa';
  semester?: number;
  phone?: string;
  bio?: string;
}): Promise<{ success: boolean; error?: string; userId?: string }> => {
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
      return { success: false, error: error.message };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { 
      success: true, 
      userId: data.user_id 
    };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, error: 'Terjadi kesalahan saat membuat user' };
  }
};

export const updateUserByAdmin = async (
  userId: string,
  updates: Partial<{
    name: string;
    email: string;
    role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa';
    semester: number;
    phone: string;
    bio: string;
  }>
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
      return { success: false, error: error.message };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Terjadi kesalahan saat update user' };
  }
};

export const deleteUserByAdmin = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('delete_user_by_admin', {
      target_user_id: userId
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: 'Terjadi kesalahan saat menghapus user' };
  }
};

export const getAllUsers = async (): Promise<{ 
  success: boolean; 
  users?: User[]; 
  error?: string 
}> => {
  try {
    const { data, error } = await supabase.rpc('get_all_users');

    if (error) {
      return { success: false, error: error.message };
    }

    const users: User[] = data.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email || '',
      role: user.role,
      npm: user.nim,
      semester: user.semester || 1,
      avatar: user.avatar_url,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      lastSignInAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
    }));

    return { success: true, users };
  } catch (error) {
    console.error('Get all users error:', error);
    return { success: false, error: 'Terjadi kesalahan saat mengambil data users' };
  }
};

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
      return { success: false, error: error.message };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Terjadi kesalahan saat reset password' };
  }
};