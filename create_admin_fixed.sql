-- 1. Create a unique ID for the admin user
DO $$
DECLARE
  new_admin_id UUID := gen_random_uuid();
BEGIN
  -- 2. Insert into auth.users (This sets the password to AdminPass123! and auto-confirms the email)
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
    new_admin_id,
    'authenticated',
    'authenticated',
    'systemadmin@flexi.com',
    crypt('AdminPass123!', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Admin", "role":"admin"}',
    current_timestamp,
    current_timestamp
  );

  -- 3. Insert into auth.identities (CRITICAL: modern Supabase requires this to log in!)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_admin_id,
    new_admin_id,
    format('{"sub":"%s","email":"%s"}', new_admin_id::text, 'systemadmin@flexi.com')::jsonb,
    'email',
    new_admin_id,
    current_timestamp,
    current_timestamp,
    current_timestamp
  );

  -- 4. Force update the role in public.profiles just to be absolutely sure
  UPDATE public.profiles 
  SET role = 'admin', full_name = 'System Admin' 
  WHERE id = new_admin_id;

END $$;
