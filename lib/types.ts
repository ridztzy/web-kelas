export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'ketua_kelas' | 'sekretaris' | 'mahasiswa';
  npm: string;
  semester: number;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'rendah' | 'sedang' | 'tinggi';
  status: 'pending' | 'in_progress' | 'completed';
  type: 'pribadi' | 'kelas';
  assignedTo?: string;
  assignedBy?: string;
  subject?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  timestamp: Date;
  edited?: boolean;
  replyTo?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  lecturer: string;
  schedule: string;
  credits: number;
  description?: string;
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

export interface Schedule {
  id: string;
  subject: string;
  time: string;
  day: string;
  room: string;
  lecturer: string;
}