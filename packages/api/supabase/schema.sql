-- =============================================
-- FLEXI CAR RENTAL - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- optional, for geo queries

-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE user_role AS ENUM ('guest', 'host', 'admin');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE protection_plan AS ENUM ('basic', 'standard', 'premium');
CREATE TYPE vehicle_type AS ENUM ('sedan', 'suv', 'hatchback', 'luxury', 'electric', 'van', 'sports', 'pickup');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'cng');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic');
CREATE TYPE earnings_status AS ENUM ('pending_payout', 'paid_out');
CREATE TYPE payout_status AS ENUM ('processing', 'completed', 'failed');
CREATE TYPE notification_type AS ENUM ('booking_request', 'booking_confirmed', 'booking_cancelled', 'payment_success', 'kyc_submitted', 'kyc_approved', 'kyc_rejected', 'vehicle_approved', 'vehicle_rejected', 'new_message', 'review_received');

-- =============================================
-- PROFILES (extends Supabase auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role NOT NULL DEFAULT 'guest',
  rating NUMERIC(3,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  response_time TEXT DEFAULT 'N/A',
  acceptance_rate INTEGER DEFAULT 0,
  is_all_star BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- KYC DOCUMENTS
-- =============================================
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driving_license_front TEXT NOT NULL,
  driving_license_back TEXT,
  id_proof TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status kyc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================
-- VEHICLES
-- =============================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  type vehicle_type NOT NULL,
  fuel_type fuel_type NOT NULL DEFAULT 'petrol',
  transmission transmission_type NOT NULL DEFAULT 'manual',
  seats INTEGER NOT NULL DEFAULT 5,
  registration_number TEXT,
  description TEXT,
  city TEXT NOT NULL,
  address TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  price_per_day NUMERIC(10,2) NOT NULL,
  weekly_discount NUMERIC(5,2) DEFAULT 0,
  monthly_discount NUMERIC(5,2) DEFAULT 0,
  security_deposit NUMERIC(10,2) DEFAULT 0,
  instant_book BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VEHICLE IMAGES
-- =============================================
CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VEHICLE FEATURES
-- =============================================
CREATE TABLE vehicle_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  UNIQUE(vehicle_id, feature)
);

-- =============================================
-- BOOKINGS
-- =============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  guest_id UUID NOT NULL REFERENCES profiles(id),
  host_id UUID NOT NULL REFERENCES profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  pickup_location TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  protection_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  protection_plan protection_plan NOT NULL DEFAULT 'basic',
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  host_id UUID NOT NULL REFERENCES profiles(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- =============================================
-- MESSAGES
-- =============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  receiver_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- HOST EARNINGS
-- =============================================
CREATE TABLE host_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES profiles(id),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount NUMERIC(10,2) NOT NULL,
  status earnings_status NOT NULL DEFAULT 'pending_payout',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYOUTS
-- =============================================
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(10,2) NOT NULL,
  status payout_status NOT NULL DEFAULT 'processing',
  razorpay_payout_id TEXT,
  bank_account JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_vehicles_host ON vehicles(host_id);
CREATE INDEX idx_vehicles_city ON vehicles(city);
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_available ON vehicles(is_available, is_approved);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_host ON bookings(host_id);
CREATE INDEX idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX idx_reviews_host ON reviews(host_id);

-- =============================================
-- TRIGGERS: updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kyc_updated BEFORE UPDATE ON kyc_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_earnings_updated BEFORE UPDATE ON host_earnings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, only update own
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Vehicles: anyone can read approved, host manages own
CREATE POLICY "vehicles_read_approved" ON vehicles FOR SELECT USING (is_approved = true OR host_id = auth.uid());
CREATE POLICY "vehicles_insert_host" ON vehicles FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "vehicles_update_host" ON vehicles FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "vehicles_delete_host" ON vehicles FOR DELETE USING (auth.uid() = host_id);

-- Bookings: only involved parties
CREATE POLICY "bookings_own" ON bookings FOR SELECT USING (auth.uid() = guest_id OR auth.uid() = host_id);
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "bookings_update_involved" ON bookings FOR UPDATE USING (auth.uid() = guest_id OR auth.uid() = host_id);

-- KYC: own only
CREATE POLICY "kyc_own" ON kyc_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "kyc_insert" ON kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kyc_update_own" ON kyc_documents FOR UPDATE USING (auth.uid() = user_id);

-- Messages: booking participants only
CREATE POLICY "messages_own" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: own only
CREATE POLICY "notifications_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: public read
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_guest" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Host earnings: own only
CREATE POLICY "earnings_own" ON host_earnings FOR SELECT USING (auth.uid() = host_id);

-- Payouts: own only
CREATE POLICY "payouts_own" ON payouts FOR SELECT USING (auth.uid() = host_id);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Run these in Supabase Storage section or via API:
-- 1. Create bucket: "vehicle-images" (public)
-- 2. Create bucket: "kyc-documents" (private)
-- 3. Create bucket: "avatars" (public)
