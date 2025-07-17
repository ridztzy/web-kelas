// Lokasi: app/api/announcements/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Gunakan Supabase Admin Client agar bisa menulis data dari server
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // 1. Ambil sesi pengguna saat ini
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Anda harus login" }, { status: 401 });
    }

    // 2. Ambil profil pengguna untuk mengecek role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Gagal memverifikasi pengguna" }, { status: 500 });
    }

    // 3. Logika Otorisasi: Hanya role tertentu yang diizinkan
    const allowedRoles = ['admin', 'ketua_kelas', 'sekretaris'];
    if (!allowedRoles.includes(profile.role || '')) {
      return NextResponse.json({ error: "Forbidden: Anda tidak punya izin untuk aksi ini" }, { status: 403 });
    }

    const body = await request.json();

    // Validasi input dasar
    if (!body.title || !body.message || !body.type) {
      return NextResponse.json(
        { error: "Judul, pesan, dan tipe wajib diisi" },
        { status: 400 }
      );
    }

    // Masukkan data baru ke tabel 'announcements'
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .insert({
        title: body.title,
        message: body.message,
        type: body.type,
        urgent: body.urgent || false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: "Pengumuman berhasil dibuat", data },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Gagal membuat pengumuman:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
    // ... (Tambahkan pengecekan role di sini jika diperlukan)
    const { data, error } = await supabaseAdmin
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}