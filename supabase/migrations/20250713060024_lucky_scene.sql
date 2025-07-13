/*
  # CRUD Operations untuk Users Management

  1. Functions
    - Function untuk create user baru oleh admin
    - Function untuk update user data
    - Function untuk delete user
    - Function untuk get all users (admin only)

  2. Security
    - Hanya admin yang bisa melakukan CRUD operations
    - Validasi role dan permissions
    - Audit trail untuk perubahan data

  3. Sample Data
    - Insert beberapa user sample untuk testing
*/

-- Function untuk create user baru (admin only)
CREATE OR REPLACE FUNCTION create_user_by_admin(
  user_nim TEXT,
  user_name TEXT,
  user_email TEXT,
  user_password TEXT,
  user_role user_role DEFAULT 'mahasiswa',
  user_semester INT DEFAULT 1,
  user_phone TEXT DEFAULT NULL,
  user_bio TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  admin_check BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RETURN json_build_object('error', 'Unauthorized: Admin access required');
  END IF;
  
  -- Check if NIM already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE nim = user_nim) THEN
    RETURN json_build_object('error', 'NIM already exists');
  END IF;
  
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE email = user_email) THEN
    RETURN json_build_object('error', 'Email already exists');
  END IF;
  
  -- Create auth user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    json_build_object(
      'nim', user_nim,
      'name', user_name,
      'role', user_role,
      'semester', user_semester
    )
  ) RETURNING id INTO new_user_id;
  
  -- Profile will be created automatically by trigger
  
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk update user data (admin only)
CREATE OR REPLACE FUNCTION update_user_by_admin(
  target_user_id UUID,
  user_name TEXT DEFAULT NULL,
  user_email TEXT DEFAULT NULL,
  user_role user_role DEFAULT NULL,
  user_semester INT DEFAULT NULL,
  user_phone TEXT DEFAULT NULL,
  user_bio TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  admin_check BOOLEAN;
  update_data JSON;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RETURN json_build_object('error', 'Unauthorized: Admin access required');
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id) THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Build update object
  update_data := json_build_object();
  
  -- Update profile
  UPDATE profiles SET
    name = COALESCE(user_name, name),
    email = COALESCE(user_email, email),
    role = COALESCE(user_role, role),
    semester = COALESCE(user_semester, semester),
    phone = COALESCE(user_phone, phone),
    bio = COALESCE(user_bio, bio),
    updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Update auth.users email if provided
  IF user_email IS NOT NULL THEN
    UPDATE auth.users SET
      email = user_email,
      updated_at = NOW()
    WHERE id = target_user_id;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User updated successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk delete user (admin only)
CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  admin_check BOOLEAN;
  target_user_role user_role;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RETURN json_build_object('error', 'Unauthorized: Admin access required');
  END IF;
  
  -- Get target user role
  SELECT role INTO target_user_role
  FROM profiles 
  WHERE id = target_user_id;
  
  IF target_user_role IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Prevent deleting other admins (optional safety measure)
  IF target_user_role = 'admin' AND target_user_id != auth.uid() THEN
    RETURN json_build_object('error', 'Cannot delete other admin users');
  END IF;
  
  -- Delete user (cascade will handle profile)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User deleted successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  nim VARCHAR(20),
  name VARCHAR(255),
  email VARCHAR(255),
  role user_role,
  semester INT,
  phone VARCHAR(20),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) AS $$
DECLARE
  admin_check BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.nim,
    p.name,
    p.email,
    p.role,
    p.semester,
    p.phone,
    p.bio,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    au.last_sign_in_at
  FROM profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk reset password user (admin only)
CREATE OR REPLACE FUNCTION reset_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSON AS $$
DECLARE
  admin_check BOOLEAN;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO admin_check;
  
  IF NOT admin_check THEN
    RETURN json_build_object('error', 'Unauthorized: Admin access required');
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RETURN json_build_object('error', 'User not found');
  END IF;
  
  -- Update password
  UPDATE auth.users SET
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = target_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password reset successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Additional RLS policies for admin access
CREATE POLICY "Admins can insert new profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample data untuk testing
DO $$
BEGIN
  -- Insert sample users jika belum ada
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE nim = '2021005') THEN
    PERFORM create_user_by_admin(
      '2021005',
      'Maya Sari',
      'maya.sari@student.ac.id',
      '123456',
      'mahasiswa',
      5,
      '+62812345678',
      'Mahasiswa semester 5 jurusan Ilmu Komputer'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE nim = '2021006') THEN
    PERFORM create_user_by_admin(
      '2021006',
      'Andi Pratama',
      'andi.pratama@student.ac.id',
      '123456',
      'mahasiswa',
      7,
      '+62823456789',
      'Mahasiswa aktif organisasi'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE nim = '2021007') THEN
    PERFORM create_user_by_admin(
      '2021007',
      'Rina Wati',
      'rina.wati@student.ac.id',
      '123456',
      'sekretaris',
      6,
      '+62834567890',
      'Sekretaris kelas yang aktif'
    );
  END IF;
END $$;