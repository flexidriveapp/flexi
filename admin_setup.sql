-- Run this in your Supabase SQL Editor to create your first Admin user

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@flexi.com',
  crypt('AdminPass123!', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Super Admin", "role":"admin", "phone":"0000000000"}',
  current_timestamp,
  current_timestamp
);

-- Note: The database trigger `on_auth_user_created` will automatically copy 
-- this user into your `public.profiles` table with the role 'admin'.
