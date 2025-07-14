// Lokasi: app/api/subjects/[id]/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { z } from 'zod';

// Skema validasi bisa kita gunakan kembali, tapi kita buat semua field opsional
// karena update mungkin hanya mengubah beberapa field saja (PATCH).
// Namun untuk form edit yang lengkap, kita bisa pakai skema yang sama.
const SubjectSchema = z.object({
  name: z.string().min(3, { message: "Nama mata kuliah minimal 3 karakter" }),
  code: z.string().min(3, { message: "Kode mata kuliah minimal 3 karakter" }),
  lecturer: z.string().optional(),
  credits: z.coerce.number().int().min(1, { message: "SKS harus diisi" }),
  description: z.string().optional(),
});

// Inisialisasi Supabase Admin Client (sama seperti sebelumnya)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- 3. FUNGSI UNTUK MENG-UPDATE DATA (PUT) ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validasi data yang masuk
    const validation = SubjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Data yang dikirim tidak valid.', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Update data di tabel 'subjects' dimana 'id' cocok
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .update(validation.data)
      .eq('id', id)
      .select() // <-- select() untuk memastikan data yang diupdate dikembalikan
      .single(); // <-- single() karena kita hanya update satu baris

    if (error) {
      // Handle error jika kode mata kuliah sudah ada (unique constraint violation)
      if (error.code === '23505') {
          return NextResponse.json({ error: `Kode mata kuliah '${validation.data.code}' sudah digunakan oleh mata kuliah lain.` }, { status: 409 });
      }
      throw error;
    }

    // Jika tidak ada data yang dikembalikan, berarti ID tidak ditemukan
    if (!data) {
        return NextResponse.json({ error: 'Mata kuliah tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Mata kuliah berhasil diperbarui', data });

  } catch (error: any) {
    console.error('Gagal memperbarui mata kuliah:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}


// --- 4. FUNGSI UNTUK MENGHAPUS DATA (DELETE) ---
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Hapus data dari tabel 'subjects' dimana 'id' cocok
        const { error } = await supabaseAdmin
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: 'Mata kuliah berhasil dihapus.' }, { status: 200 });

    } catch (error: any) {
        console.error('Gagal menghapus mata kuliah:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
    }
}