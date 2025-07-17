// Lokasi: app/api/notifications/route.ts

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

// Buat Supabase Admin Client untuk akses level server
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- FUNGSI UNTUK MENGAMBIL NOTIFIKASI (GET) ---
export async function GET() {
  try {
    // 1. Dapatkan userId dari cookie, sesuai dengan metode di proyek Anda
    const cookieStore = cookies();
    let userId: string | undefined;

    // Coba ambil dari cookie 'supabase-session' yang Anda buat
    const sessionCookie = cookieStore.get("supabase-session")?.value;
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie);
        userId = sessionData.user?.id;
      } catch (e) {
        console.error("Gagal parse cookie supabase-session:", e);
        // Jika gagal parse, biarkan userId undefined
      }
    }

    // Jika tidak ada session, kembalikan error
    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // 2. Ambil semua notifikasi milik pengguna yang sedang login
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select(`
        id,
        user_id,
        event_type,
        read_at,
        link_to,
        entity_id,
        title,
        message,
        created_at,
        actor:profiles!notifications_actor_id_fkey (id, name, avatar_url)
      `)
      .eq('user_id', userId) // Filter berdasarkan userId yang didapat dari cookie
      .order('created_at', { ascending: false }); // Urutkan dari yang paling baru

    if (error) {
      throw error;
    }

    // 3. Kirim data notifikasi sebagai respons
    return NextResponse.json(notifications);

  } catch (error: any) {
    console.error('Gagal mengambil notifikasi:', error);
    return NextResponse.json({ error: 'Gagal mengambil data notifikasi.' }, { status: 500 });
  }
}