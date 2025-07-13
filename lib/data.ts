import { User, Task, ChatMessage, Subject, Schedule } from './types';

// Sample data for development
export const users: User[] = [
  {
    id: '1',
    name: 'Ahmad Rizki',
    email: 'ahmad.rizki@student.ac.id',
    role: 'admin',
    npm: '2021001',
    semester: 7,
    avatar: '/api/placeholder/40/40',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@student.ac.id',
    role: 'ketua_kelas',
    npm: '2021002',
    semester: 7,
    avatar: '/api/placeholder/40/40',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi.santoso@student.ac.id',
    role: 'sekretaris',
    npm: '2021003',
    semester: 7,
    avatar: '/api/placeholder/40/40',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    name: 'Dewi Sartika',
    email: 'dewi.sartika@student.ac.id',
    role: 'mahasiswa',
    npm: '2021004',
    semester: 7,
    avatar: '/api/placeholder/40/40',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Implementasi Algoritma Sorting',
    description: 'Implementasikan algoritma bubble sort, quick sort, dan merge sort dalam bahasa C++',
    dueDate: new Date('2024-02-15'),
    priority: 'tinggi',
    status: 'pending',
    type: 'kelas',
    assignedBy: '2',
    subject: 'Algoritma dan Struktur Data',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    title: 'Laporan Praktikum Database',
    description: 'Buat laporan praktikum database untuk pertemuan 5-6',
    dueDate: new Date('2024-02-10'),
    priority: 'sedang',
    status: 'in_progress',
    type: 'kelas',
    assignedBy: '3',
    subject: 'Basis Data',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    title: 'Belajar untuk UTS',
    description: 'Persiapan untuk ujian tengah semester mata kuliah Pemrograman Web',
    dueDate: new Date('2024-02-20'),
    priority: 'tinggi',
    status: 'pending',
    type: 'pribadi',
    assignedTo: '4',
    subject: 'Pemrograman Web',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  }
];

export const chatMessages: ChatMessage[] = [
  {
    id: '1',
    message: 'Selamat pagi semua! Jangan lupa tugas algoritma harus dikumpulkan hari Jumat ini.',
    senderId: '2',
    senderName: 'Siti Nurhaliza',
    senderRole: 'ketua_kelas',
    timestamp: new Date('2024-01-25T08:00:00')
  },
  {
    id: '2',
    message: 'Terima kasih remindernya kak! Apakah ada format khusus untuk laporan?',
    senderId: '4',
    senderName: 'Dewi Sartika',
    senderRole: 'mahasiswa',
    timestamp: new Date('2024-01-25T08:15:00')
  },
  {
    id: '3',
    message: 'Format laporan sudah saya share di grup WhatsApp ya. Kalau ada pertanyaan bisa tanya di sini.',
    senderId: '3',
    senderName: 'Budi Santoso',
    senderRole: 'sekretaris',
    timestamp: new Date('2024-01-25T08:30:00')
  }
];

export const subjects: Subject[] = [
  {
    id: '1',
    name: 'Algoritma dan Struktur Data',
    code: 'CS201',
    lecturer: 'Dr. Agus Setiawan',
    schedule: 'Senin 08:00-10:00',
    credits: 3,
    description: 'Mata kuliah yang membahas berbagai algoritma dan struktur data'
  },
  {
    id: '2',
    name: 'Basis Data',
    code: 'CS202',
    lecturer: 'Prof. Maria Ulfa',
    schedule: 'Selasa 10:00-12:00',
    credits: 3,
    description: 'Mata kuliah yang membahas konsep dan implementasi basis data'
  },
  {
    id: '3',
    name: 'Pemrograman Web',
    code: 'CS203',
    lecturer: 'Drs. Bambang Sutrisno',
    schedule: 'Rabu 13:00-15:00',
    credits: 3,
    description: 'Mata kuliah yang membahas pengembangan aplikasi web'
  },
  {
    id: '4',
    name: 'Sistem Operasi',
    code: 'CS204',
    lecturer: 'Dr. Sari Dewi',
    schedule: 'Kamis 08:00-10:00',
    credits: 3,
    description: 'Mata kuliah yang membahas konsep sistem operasi'
  }
];

export const schedules: Schedule[] = [
  {
    id: '1',
    subject: 'Algoritma dan Struktur Data',
    time: '08:00-10:00',
    day: 'Senin',
    room: 'Lab 1',
    lecturer: 'Dr. Agus Setiawan'
  },
  {
    id: '2',
    subject: 'Basis Data',
    time: '10:00-12:00',
    day: 'Selasa',
    room: 'Lab 2',
    lecturer: 'Prof. Maria Ulfa'
  },
  {
    id: '3',
    subject: 'Pemrograman Web',
    time: '13:00-15:00',
    day: 'Rabu',
    room: 'Lab 3',
    lecturer: 'Drs. Bambang Sutrisno'
  },
  {
    id: '4',
    subject: 'Sistem Operasi',
    time: '08:00-10:00',
    day: 'Kamis',
    room: 'Ruang 201',
    lecturer: 'Dr. Sari Dewi'
  }
];