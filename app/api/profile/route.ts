
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PATCH(request: Request) {
  const { id, name, semester, phone, bio } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'User ID tidak ditemukan.' }, { status: 400 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // pakai key admin
  );

  const { data: updatedProfile, error: profileError } = await supabase
    .from('profiles')
    .update({
      name,
      semester,
      phone,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (profileError) {
    console.error('Gagal memperbarui profil:', profileError);
    return NextResponse.json(
      { error: `Gagal memperbarui profil: ${profileError.message}` },
      { status: 500 }
    );
  }

  await supabase.auth.admin.updateUserById(id, {
    user_metadata: { name },
  });

  return NextResponse.json({
    message: 'Profil berhasil diperbarui.',
    user: updatedProfile,
  });
}

// [SOLUSI BARU] Handler untuk PUT (Ubah Password)
export async function PUT(request:Request) {
  const { userId, currentPassword, newPassword } = await request.json();

  if (!userId || !currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Data tidak lengkap (membutuhkan userId, currentPassword, newPassword).' }, { status: 400 });
  }
  
  // Buat client biasa untuk verifikasi password
  const supabaseClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Buat client dengan akses Admin untuk operasi di server
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Dapatkan email user dari tabel 'profiles' menggunakan Admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    // 2. Verifikasi password lama menggunakan client biasa
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: profile.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Password saat ini salah.' }, { status: 401 });
    }

    // 3. Jika verifikasi berhasil, update password menggunakan Admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      // Memberikan pesan error yang lebih spesifik
      if (updateError.message.includes("same as the old")) {
        return NextResponse.json({ error: 'Password baru tidak boleh sama dengan password lama.' }, { status: 400 });
      }
      if (updateError.message.includes("short")) {
        return NextResponse.json({ error: 'Password baru terlalu pendek.' }, { status: 400 });
      }
      throw updateError; // Lemparkan error lain untuk ditangkap di bawah
    }

    return NextResponse.json({ message: 'Password berhasil diubah.' });

  } catch (error: any) {
    console.error('Gagal update password:', error);
    return NextResponse.json({ error: `Gagal memperbarui password: ${error.message}` }, { status: 500 });
  }
}
