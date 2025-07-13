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
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa'
    }
  }
}