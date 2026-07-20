-- Fix: Generate a unique dummy phone number for email-only signups (like Admins) 
-- to prevent UNIQUE constraint violations in public.profiles.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    -- Use the actual phone if provided, otherwise generate a unique dummy string
    COALESCE(new.raw_user_meta_data->>'phone', 'no-phone-' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'role', 'guest')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
