import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Ekstrak path dari public URL Supabase
const getPathFromUrl = (url: string): string | null => {
  try {
    const { pathname } = new URL(url);
    return pathname.split('/public/')[1] || null;
  } catch (error) {
    console.error('URL tidak valid:', error);
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!avatarFile) {
      return NextResponse.json({ error: 'Tidak ada file avatar yang diunggah.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan.' }, { status: 400 });
    }

    // --- 1. Ambil avatar lama dari database
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Gagal mengambil profil:', fetchError);
      throw new Error('Profil tidak ditemukan.');
    }

    // --- 2. Hapus file lama jika ada
    const oldPath = getPathFromUrl(profile?.avatar_url || '');
    if (oldPath) {
      const { error: deleteError } = await supabaseAdmin.storage
        .from('avatars')
        .remove([oldPath]);

      if (deleteError) {
        console.warn('Gagal menghapus avatar lama:', deleteError.message);
        // Tidak perlu throw, lanjut upload saja
      } else {
        console.log('Avatar lama berhasil dihapus:', oldPath);
      }
    }

    // --- 3. Upload avatar baru
    const extension = avatarFile.name.split('.').pop();
    const filename = `${userId}-${Date.now()}.${extension}`;
    const path = `avatars/${filename}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(path, avatarFile, {
        cacheControl: '3600',
        upsert: false, // Tidak ditimpa karena sudah dihapus sebelumnya
      });

    if (uploadError) {
      console.error('Gagal upload avatar baru:', uploadError);
      throw new Error('Upload file avatar gagal.');
    }

    // --- 4. Ambil URL publik file yang baru diupload
    const { data: urlResult } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(path);

    if (!urlResult?.publicUrl) {
      throw new Error('Gagal mendapatkan URL publik.');
    }

    // --- 5. Update avatar_url di profil
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        avatar_url: urlResult.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Gagal update profil:', updateError);
      throw new Error('Update profil gagal.');
    }

    return NextResponse.json({
      message: 'Avatar berhasil diperbarui.',
      url: urlResult.publicUrl,
    });
  } catch (error: any) {
    console.error('Kesalahan:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan.' }, { status: 500 });
  }
}
