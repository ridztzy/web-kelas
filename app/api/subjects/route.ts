// Lokasi: app/api/subjects/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { z } from 'zod';

// Skema validasi menggunakan Zod, sama seperti pada file users
const SubjectSchema = z.object({
  name: z.string().min(3, { message: "Nama mata kuliah minimal 3 karakter" }),
  code: z.string().min(3, { message: "Kode mata kuliah minimal 3 karakter" }),
  lecturer: z.string().optional(),
  schedule: z.string().optional(),
  credits: z.coerce.number().int().min(1, { message: "SKS harus diisi" }),
  description: z.string().optional(),
});

// Membuat Supabase Admin Client untuk berinteraksi dengan database
// (Sama seperti pada /api/users/route.ts)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- 1. FUNGSI UNTUK MENGAMBIL DATA (GET) ---
export async function GET() {
  try {
    // Mengambil data subjects dan menggabungkannya dengan data schedules
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .select(`
        *,
        schedules (
          id,
          day,
          start_time,
          end_time
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Gagal mengambil data mata kuliah:', error);
    return NextResponse.json({ error: 'Gagal mengambil data mata kuliah.' }, { status: 500 });
  }
}

// --- 2. FUNGSI UNTUK MEMBUAT DATA (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validation = SubjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data yang dikirim tidak valid.', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Pisahkan 'schedule' dari sisa data
    const { schedule, ...subjectData } = validation.data;

    // Masukkan hanya data yang relevan (tanpa schedule)
    const { error } = await supabaseAdmin
      .from('subjects')
      .insert(subjectData); // <-- Gunakan subjectData di sini

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: `Kode mata kuliah '${validation.data.code}' sudah ada.` }, { status: 409 });
        }
        throw error;
    }

    return NextResponse.json({ message: 'Mata kuliah berhasil ditambahkan' }, { status: 201 });

  } catch (error: any) {
    console.error('Gagal membuat mata kuliah:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}