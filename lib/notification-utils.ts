// Lokasi: lib/notification-utils.ts

import {
  Info,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Mail,
  XCircle,
} from "lucide-react";

/**
 * Menerjemahkan event_type dari notifikasi menjadi properti visual.
 * @param eventType - String event_type dari database (contoh: 'new_task').
 * @returns Objek yang berisi komponen Ikon, kelas warna, dan label tipe.
 */
export const getNotificationVisuals = (eventType: string) => {
  switch (eventType) {
    // Tipe Info (Biru)
    case "new_task":
    case "new_personal_task":
      return {
        Icon: BookOpen,
        colorClass: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20",
        iconColorClass: "text-blue-600",
        typeLabel: "Tugas Baru",
      };

    case "task_updated":
      return {
        Icon: Info,
        colorClass: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20",
        iconColorClass: "text-orange-600",
        typeLabel: "Tugas Diperbarui",
      };
    
    case "task_completed":
      return {
        Icon: CheckCircle,
        colorClass: "border-l-green-500 bg-green-50 dark:bg-green-900/20",
        iconColorClass: "text-green-600",
        typeLabel: "Tugas Selesai",
      };
    
    case "task_deleted":
      return {
        Icon: XCircle,
        colorClass: "border-l-red-500 bg-red-50 dark:bg-red-900/20",
        iconColorClass: "text-red-600",
        typeLabel: "Tugas Dihapus",
      };

    // Tipe Sukses (Hijau)
    case "grade_updated":
      return {
        Icon: CheckCircle,
        colorClass: "border-l-green-500 bg-green-50 dark:bg-green-900/20",
        iconColorClass: "text-green-600",
        typeLabel: "Nilai",
      };

    // Tipe Peringatan (Oranye)
    case "task_reminder":
      return {
        Icon: AlertTriangle,
        colorClass: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20",
        iconColorClass: "text-orange-600",
        typeLabel: "Pengingat",
      };

    // Tipe Pesan (Ungu)
    case "new_message":
      return {
        Icon: Mail,
        colorClass: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20",
        iconColorClass: "text-purple-600",
        typeLabel: "Pesan Baru",
      };

    // Tipe Error/Sistem (Merah)
    case "system_maintenance":
      return {
        Icon: XCircle,
        colorClass: "border-l-red-500 bg-red-50 dark:bg-red-900/20",
        iconColorClass: "text-red-600",
        typeLabel: "Sistem",
      };

    // Tipe Default (Abu-abu)
    default:
      return {
        Icon: Info,
        colorClass: "border-l-gray-500 bg-gray-50 dark:bg-gray-900/20",
        iconColorClass: "text-gray-600",
        typeLabel: "Info",
      };
  }
};
