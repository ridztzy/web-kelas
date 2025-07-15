// Lokasi: app/api/schedules/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { z } from 'zod';

// Skema Zod untuk validasi jadwal
const ScheduleSchema = z.object({
  subject_id: z.string().uuid(),
  day: z.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']),
  start_time: z.string(), // TIME_TYPE
  end_time: z.string(), // TIME_TYPE
  room: z.string().optional(),
});


const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- FUNGSI UNTUK MENGAMBIL SEMUA JADWAL ---
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('schedules')
      .select(`
        id,
        day,
        start_time,
        end_time,
        room,
        subjects ( id, name, lecturer )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Gagal mengambil data jadwal:', error);
    return NextResponse.json({ error: 'Gagal mengambil data jadwal' }, { status: 500 });
  }
}

// --- FUNGSI UNTUK MEMBUAT JADWAL BARU ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validation = ScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('schedules')
      .insert(validation.data);

    if (error) {
        throw error;
    }

    return NextResponse.json({ message: 'Jadwal berhasil ditambahkan' }, { status: 201 });

  } catch (error: any) {
    console.error('Gagal membuat jadwal:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}