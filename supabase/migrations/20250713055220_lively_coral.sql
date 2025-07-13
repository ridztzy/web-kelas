/*
  # Buat tabel profiles dan sistem autentikasi

  1. Enum dan Tabel
    - `user_role` enum untuk membatasi role yang valid
    - `profiles` tabel untuk data pengguna tambahan
    - Relasi one-to-one dengan auth.users

  2. Security
    - Enable RLS pada tabel profiles
    - Policy untuk users hanya bisa akses data mereka sendiri
    - Policy untuk admin bisa akses semua data

  3. Functions
    - Function untuk handle user registration
    - Trigger untuk auto-create profile setelah user signup
*/

-- Enum untuk role pengguna
CREATE TYPE user_role AS ENUM ('admin', 'ketua_kelas', 'sekretaris', 'mahasiswa');

-- Tabel untuk data profil pengguna tambahan
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nim VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role user_role DEFAULT 'mahasiswa' NOT NULL,
  semester INT DEFAULT 1,
  phone VARCHAR(20),
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy untuk users bisa view profile mereka sendiri
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy untuk users bisa update profile mereka sendiri
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy untuk admin bisa view semua profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy untuk admin bisa update semua profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy untuk admin bisa insert profiles
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function untuk handle user registration dengan NIM
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nim, name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nim',
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'mahasiswa')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create profile setelah user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function untuk login dengan NIM
CREATE OR REPLACE FUNCTION login_with_nim(nim_input TEXT, password_input TEXT)
RETURNS JSON AS $$
DECLARE
  user_email TEXT;
  auth_result JSON;
BEGIN
  -- Cari email berdasarkan NIM
  SELECT email INTO user_email
  FROM profiles
  WHERE nim = nim_input;
  
  IF user_email IS NULL THEN
    RETURN json_build_object('error', 'NIM tidak ditemukan');
  END IF;
  
  -- Return email untuk digunakan di client
  RETURN json_build_object('email', user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'ahmad.rizki@student.ac.id', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"nim": "2021001", "name": "Ahmad Rizki", "role": "admin"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'siti.nur@student.ac.id', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"nim": "2021002", "name": "Siti Nurhaliza", "role": "ketua_kelas"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'budi.santoso@student.ac.id', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"nim": "2021003", "name": "Budi Santoso", "role": "sekretaris"}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'dewi.sartika@student.ac.id', crypt('123456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"nim": "2021004", "name": "Dewi Sartika", "role": "mahasiswa"}')
ON CONFLICT (id) DO NOTHING;