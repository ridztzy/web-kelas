
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
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
