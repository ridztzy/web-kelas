export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nim: string
          name: string
          email: string | null
          role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
          semester: number | null
          phone: string | null
          bio: string | null
          avatar_url: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          nim: string
          name: string
          email?: string | null
          role?: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
          semester?: number | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          nim?: string
          name?: string
          email?: string | null
          role?: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
          semester?: number | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          updated_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      login_with_nim: {
        Args: {
          nim_input: string
          password_input: string
        }
        Returns: Json
      }
      get_user_profile: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          nim: string
          name: string
          email: string | null
          role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
          semester: number | null
          phone: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }[]
      }
      get_my_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          nim: string
          name: string
          email: string | null
          role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
          semester: number | null
          phone: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }[]
      }
      update_my_profile: {
        Args: {
          user_name?: string
          user_phone?: string
          user_bio?: string
          user_semester?: number
          user_avatar_url?: string
        }
        Returns: Json
      }
      get_user_role: {
        Args: {
          user_id?: string
        }
        Returns: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
      }
      has_role_permission: {
        Args: {
          required_roles: string[]
        }
        Returns: boolean
      }
      create_user_by_admin: {
        Args: {
          user_nim: string
          user_name: string
          user_email: string
          user_password: string
          user_role?: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
          user_semester?: number
          user_phone?: string
          user_bio?: string
        }
        Returns: Json
      }
      update_user_by_admin: {
        Args: {
          target_user_id: string
          user_name?: string
          user_email?: string
          user_role?: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
          user_semester?: number
          user_phone?: string
          user_bio?: string
        }
        Returns: Json
      }
      delete_user_by_admin: {
        Args: {
          target_user_id: string
        }
        Returns: Json
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          nim: string
          name: string
          email: string | null
          role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
          semester: number | null
          phone: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          last_sign_in_at: string | null
        }[]
      }
      reset_user_password: {
        Args: {
          target_user_id: string
          new_password: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
    }
  }
}