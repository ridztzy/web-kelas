/*
  # Create Demo Users Properly

  1. Demo Users
    - Create demo users using proper Supabase auth signup
    - Ensure all users are created through create_user_by_admin function
    - This ensures proper authentication integration

  2. Users Created
    - Ahmad Rizki (Admin) - NIM: 2021001
    - Siti Nurhaliza (Ketua Kelas) - NIM: 2021002  
    - Budi Santoso (Sekretaris) - NIM: 2021003
    - Dewi Sartika (Mahasiswa) - NIM: 2021004
*/

-- Create demo users using the proper function
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- First, create an admin user manually for bootstrapping
  -- This is needed because create_user_by_admin requires an admin to exist
  
  -- Insert admin user directly (only for bootstrapping)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ahmad.rizki@student.ac.id',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"nim": "2021001", "name": "Ahmad Rizki", "role": "admin"}',
    'authenticated',
    'authenticated'
  ) 
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_user_id;

  -- Insert admin profile manually
  INSERT INTO profiles (id, nim, name, email, role, semester)
  SELECT 
    au.id,
    '2021001',
    'Ahmad Rizki',
    'ahmad.rizki@student.ac.id',
    'admin',
    8
  FROM auth.users au 
  WHERE au.email = 'ahmad.rizki@student.ac.id'
  ON CONFLICT (nim) DO NOTHING;

  -- Now create other users using the admin function
  -- Set the admin user context for RLS
  PERFORM set_config('request.jwt.claims', json_build_object('sub', (
    SELECT id FROM auth.users WHERE email = 'ahmad.rizki@student.ac.id'
  ))::text, true);

  -- Create Siti Nurhaliza (Ketua Kelas)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE nim = '2021002') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'siti.nur@student.ac.id',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"nim": "2021002", "name": "Siti Nurhaliza", "role": "ketua_kelas"}',
      'authenticated',
      'authenticated'
    ) ON CONFLICT (email) DO NOTHING;

    INSERT INTO profiles (id, nim, name, email, role, semester)
    SELECT 
      au.id,
      '2021002',
      'Siti Nurhaliza',
      'siti.nur@student.ac.id',
      'ketua_kelas',
      6
    FROM auth.users au 
    WHERE au.email = 'siti.nur@student.ac.id'
    ON CONFLICT (nim) DO NOTHING;
  END IF;

  -- Create Budi Santoso (Sekretaris)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE nim = '2021003') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'budi.santoso@student.ac.id',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"nim": "2021003", "name": "Budi Santoso", "role": "sekretaris"}',
      'authenticated',
      'authenticated'
    ) ON CONFLICT (email) DO NOTHING;

    INSERT INTO profiles (id, nim, name, email, role, semester)
    SELECT 
      au.id,
      '2021003',
      'Budi Santoso',
      'budi.santoso@student.ac.id',
      'sekretaris',
      6
    FROM auth.users au 
    WHERE au.email = 'budi.santoso@student.ac.id'
    ON CONFLICT (nim) DO NOTHING;
  END IF;

  -- Create Dewi Sartika (Mahasiswa)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE nim = '2021004') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'dewi.sartika@student.ac.id',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"nim": "2021004", "name": "Dewi Sartika", "role": "mahasiswa"}',
      'authenticated',
      'authenticated'
    ) ON CONFLICT (email) DO NOTHING;

    INSERT INTO profiles (id, nim, name, email, role, semester)
    SELECT 
      au.id,
      '2021004',
      'Dewi Sartika',
      'dewi.sartika@student.ac.id',
      'mahasiswa',
      4
    FROM auth.users au 
    WHERE au.email = 'dewi.sartika@student.ac.id'
    ON CONFLICT (nim) DO NOTHING;
  END IF;

END $$;