export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa';
  nim: string;
  semester: number;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: 'rendah' | 'sedang' | 'tinggi';
  status: 'pending' | 'in_progress' | 'completed';
  type: 'pribadi' | 'kelas';
  subject_id?: string | null;
  assigned_to: string;
  assigned_by?: string | null;
  created_at: string;
  updated_at: string;
  // attachments?: string[]; // Dihapus untuk saat ini, bisa ditambahkan lagi nanti
}

export interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  timestamp: Date;
  edited?: boolean;
  reply_to?: string;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  status: 'sent' | 'delivered' | 'read';

  // ✅ Tambahkan ini untuk memperbaiki error
  replied_message?: {
    message: string;
    senderName: string;
  } | null;
}


export interface Subject {
  id: string;
  name: string;
  code: string;
  lecturer: string;
  credits: number;
  description?: string;
  // schedule tidak lagi di sini, karena sudah ada di tabel schedules
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  userId: string;
  createdAt: Date;
}

// Tipe Schedule diperbarui sesuai dengan skema database baru
export interface Schedule {
  id: string;
  subject_id: string; // Foreign key ke tabel subjects
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  start_time: string; // Format 'HH:MM:SS'
  end_time: string; // Format 'HH:MM:SS'
  room?: string;
  created_at: string;
}
