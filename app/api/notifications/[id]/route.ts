// Lokasi: app/api/notifications/[id]/route.ts

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

// Buat Supabase Admin Client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- FUNGSI UNTUK UPDATE NOTIFIKASI (PATCH) ---
// Digunakan untuk menandai notifikasi sebagai sudah/belum dibaca
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;
    const body = await request.json();

    // 1. Dapatkan userId dari cookie
    const cookieStore = cookies();
    let userId: string | undefined;
    const sessionCookie = cookieStore.get("supabase-session")?.value;
    if (sessionCookie) {
      try {
        userId = JSON.parse(sessionCookie).user?.id;
      } catch (e) { /* Abaikan jika error */ }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // 2. Tentukan nilai baru untuk `read_at`
    // Jika frontend mengirim `read: true`, kita set `read_at` ke waktu sekarang.
    // Jika frontend mengirim `read: false`, kita set `read_at` ke NULL.
    const newReadAt = body.read ? new Date().toISOString() : null;

    // 3. Update notifikasi di database
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ read_at: newReadAt })
      .eq('id', notificationId) // Hanya update notifikasi dengan ID ini
      .eq('user_id', userId)     // DAN pastikan notifikasi ini milik user yang login
      .select()
      .single();

    if (error) {
      // Jika terjadi error, kemungkinan notifikasi tidak ditemukan atau bukan milik user
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Notifikasi tidak ditemukan atau Anda tidak punya akses.' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'Status notifikasi diperbarui', data });

  } catch (error: any) {
    console.error('Gagal memperbarui notifikasi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}


// --- FUNGSI UNTUK MENGHAPUS NOTIFIKASI (DELETE) ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;

    // 1. Dapatkan userId dari cookie
    const cookieStore = cookies();
    let userId: string | undefined;
    const sessionCookie = cookieStore.get("supabase-session")?.value;
    if (sessionCookie) {
        try {
            userId = JSON.parse(sessionCookie).user?.id;
        } catch (e) { /* Abaikan */ }
    }

    if (!userId) {
        return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // 2. Hapus notifikasi dari database
    const { error, count } = await supabaseAdmin
      .from('notifications')
      .delete({ count: 'exact' }) // 'exact' untuk memastikan kita tahu berapa baris yang terhapus
      .eq('id', notificationId)
      .eq('user_id', userId); // Pastikan hanya bisa menghapus notifikasi milik sendiri

    if (error) {
      throw error;
    }

    // 3. Cek apakah ada baris yang terhapus
    if (count === 0) {
        return NextResponse.json({ error: 'Notifikasi tidak ditemukan atau Anda tidak punya akses.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notifikasi berhasil dihapus.' }, { status: 200 });

  } catch (error: any) {
    console.error('Gagal menghapus notifikasi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
