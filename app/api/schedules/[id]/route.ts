// Lokasi: app/api/schedules/[id]/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { z } from 'zod';

// Skema Zod untuk validasi jadwal, semua field opsional untuk PATCH
const ScheduleSchema = z.object({
  subject_id: z.string().uuid().optional(),
  day: z.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']).optional(),
  start_time: z.string().optional(), // TIME_TYPE
  end_time: z.string().optional(), // TIME_TYPE
  room: z.string().optional(),
});

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- FUNGSI UNTUK UPDATE DATA (PUT) ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const validation = ScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('schedules')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
        return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Jadwal berhasil diperbarui', data });

  } catch (error: any) {
    console.error('Gagal memperbarui jadwal:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

// --- FUNGSI UNTUK MENGHAPUS DATA (DELETE) ---
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const { error } = await supabaseAdmin
            .from('schedules')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Jadwal berhasil dihapus' }, { status: 200 });

    } catch (error: any) {
        console.error('Gagal menghapus jadwal:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}