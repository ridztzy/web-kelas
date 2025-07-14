import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const { nim, name, email, password, role, semester } = await request.json();

  if (!email || !password || !nim || !name) {
    return NextResponse.json({ error: 'Data yang diperlukan tidak lengkap.' }, { status: 400 });
  }

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Buat user di Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      name: name,
      nim: nim,
      role: role,
      semester: semester,
    },
  });

  if (authError) {
    // --- CONSOLE LOG YANG DITAMBAHKAN ---
    console.error("===================================");
    console.error("Supabase Auth Error (Detail):", authError);
    console.error("===================================");
    return NextResponse.json({ error: `Gagal membuat pengguna: ${authError.message}` }, { status: 500 });
  }

  // 2. Jika user auth berhasil dibuat, tambahkan profilnya ke tabel 'profiles'
  if (authData.user) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        nim: nim,
        name: name,
        email: email,
        role: role,
        semester: semester,
      });

    if (profileError) {
      // --- CONSOLE LOG YANG DITAMBAHKAN ---
      console.error("======================================");
      console.error("Supabase Profile Error (Detail):", profileError);
      console.error("======================================");
      
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: `Gagal menyimpan profil pengguna: ${profileError.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Pengguna berhasil dibuat' }, { status: 201 });
}

export async function PATCH(request: Request) {
  // 1. Ambil data dari body permintaan
  const { userId, name, email, role, semester } = await request.json();

  // 2. Validasi input
  if (!userId || !name || !email || !role || !semester) {
    return NextResponse.json({ error: 'Data pembaruan tidak lengkap.' }, { status: 400 });
  }

  // 3. Buat Admin Client
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 4. Perbarui data di Supabase Auth (jika email berubah)
  // Anda bisa menambahkan logika untuk hanya update jika email benar-benar berubah
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email: email,
  });

  if (authError) {
    console.error("Gagal memperbarui data auth:", authError);
    return NextResponse.json({ error: `Gagal memperbarui email: ${authError.message}` }, { status: 500 });
  }

  // 5. Perbarui data di tabel profiles
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      name: name,
      email: email, // Pastikan email juga diperbarui di sini
      role: role,
      semester: semester,
      updated_at: new Date().toISOString(), // Perbarui timestamp
    })
    .eq('id', userId);

  if (profileError) {
    console.error("Gagal memperbarui profil:", profileError);
    return NextResponse.json({ error: `Gagal memperbarui profil: ${profileError.message}` }, { status: 500 });
  }

  // 6. Kirim Respons Sukses
  return NextResponse.json({ message: 'Data pengguna berhasil diperbarui.' });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID tidak ditemukan dalam permintaan' }, { status: 400 });
  }

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Coba hapus pengguna dari sistem otentikasi
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  // 2. Periksa jenis error
  if (authError) {
    // JIKA USER TIDAK DITEMUKAN DI AUTH, ANGGAP SUKSES DAN LANJUTKAN
    // untuk membersihkan tabel profiles
    if (authError.message === 'User not found') {
      console.warn(`Pengguna dengan ID: ${userId} tidak ditemukan di auth.users. Melanjutkan untuk menghapus dari profiles.`);
      
      // Hapus langsung dari tabel profiles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error("Gagal menghapus profil yatim piatu:", profileError);
        return NextResponse.json({ error: `Gagal membersihkan data profil: ${profileError.message}` }, { status: 500 });
      }

      // Kirim respons sukses karena data "aneh" sudah berhasil dibersihkan
      return NextResponse.json({ message: 'Pengguna yatim piatu berhasil dibersihkan dari profil.' });

    } else {
      // Jika errornya bukan "User not found", maka itu error lain yang valid
      console.error("Gagal menghapus pengguna:", authError);
      return NextResponse.json({ error: `Gagal menghapus pengguna: ${authError.message}` }, { status: 500 });
    }
  }

  // 3. Jika tidak ada error sama sekali, berarti pengguna berhasil dihapus dari auth
  // dan data di profiles akan otomatis terhapus oleh CASCADE.
  return NextResponse.json({ message: 'Pengguna berhasil dihapus' });
}



export async function PUT(request: Request) {
  // 1. Ambil data dari body permintaan
  const { userId, newPassword } = await request.json();

  // 2. Validasi input
  if (!userId || !newPassword) {
    return NextResponse.json({ error: 'User ID dan password baru tidak boleh kosong.' }, { status: 400 });
  }

  // 3. Buat Admin Client
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 4. Perbarui password pengguna menggunakan ID
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  // 5. Penanganan Error
  if (error) {
    console.error("Gagal mereset password:", error);
    return NextResponse.json({ error: `Gagal mereset password: ${error.message}` }, { status: 500 });
  }

  // 6. Kirim Respons Sukses
  return NextResponse.json({ message: 'Password berhasil diperbarui.' });
}