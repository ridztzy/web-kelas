// Lokasi: app/api/tasks/[id]/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { z } from 'zod';
import { cookies } from "next/headers";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Skema untuk update, semua opsional
const TaskUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  priority: z.enum(['rendah', 'sedang', 'tinggi']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  subject_id: z.string().uuid().optional().nullable(),
});

// --- FUNGSI UNTUK UPDATE DATA (PUT/PATCH) ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // --- AWAL BLOK YANG DIPERBAIKI ---
    const cookieStore = cookies();
    let userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      const sessionCookie = cookieStore.get("supabase-session")?.value;
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(sessionCookie);
          userId = sessionData.user?.id;
        } catch {}
      }
    }
    // --- AKHIR BLOK YANG DIPERBAIKI ---

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // ... (sisa logika fungsi PUT Anda tidak perlu diubah)
    // ...

    const validation = TaskUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Cek kepemilikan tugas
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_by')
      .eq('id', id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    if (task.assigned_by !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Tugas berhasil diperbarui', data });

  } catch (error: any) {
    console.error('Gagal memperbarui tugas:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

// --- FUNGSI UNTUK MENGHAPUS DATA (DELETE) ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // --- AWAL BLOK YANG DIPERBAIKI ---
    const cookieStore = cookies();
    let userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      const sessionCookie = cookieStore.get("supabase-session")?.value;
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(sessionCookie);
          userId = sessionData.user?.id;
        } catch {}
      }
    }
    // --- AKHIR BLOK YANG DIPERBAIKI ---

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Cek apakah tugas ada dan milik user ini (atau admin)
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('id, assigned_by')
      .eq('id', id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    // (Opsional) Cek role user jika ingin admin bisa hapus semua
    // const isAdmin = ...ambil dari cookie atau query profile...

    if (task.assigned_by !== userId /* && !isAdmin */) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Tugas berhasil dihapus' }, { status: 200 });

  } catch (error: any) {
    console.error('Gagal menghapus tugas:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
