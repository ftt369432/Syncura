-- ==============================================================================
-- 🧬 SYNCURA UNIFIED DATABASE SCHEMA & POSTGRESQL MIGRATION
-- Project: https://bxzareikojrlnsaydasz.supabase.co
-- ==============================================================================

-- Enable UUID & Crypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Households (Shared multi-caregiver tenant)
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Profiles (Managed members: Eleanor, David, etc.)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  dob DATE,
  role TEXT NOT NULL DEFAULT 'dependent',
  allergies JSONB DEFAULT '[]'::jsonb,
  blood_type TEXT,
  ice_contact_name TEXT,
  ice_contact_phone TEXT,
  emergency_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Medications (Active cabinet inventory)
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT,
  rx_number TEXT,
  ndc_code TEXT,
  rxcui TEXT,
  dosage_strength TEXT NOT NULL,
  form TEXT NOT NULL DEFAULT 'tablet',
  instructions TEXT NOT NULL,
  requires_food BOOLEAN NOT NULL DEFAULT false,
  empty_stomach BOOLEAN NOT NULL DEFAULT false,
  pre_alert_offset_minutes INT DEFAULT 0,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  unit_of_measure TEXT NOT NULL DEFAULT 'tablets',
  refill_warning_threshold NUMERIC NOT NULL DEFAULT 5,
  remaining_refills INT NOT NULL DEFAULT 0,
  pharmacy_name TEXT,
  pharmacy_phone TEXT,
  doctor_name TEXT,
  is_prn BOOLEAN NOT NULL DEFAULT false,
  prn_min_interval_hours NUMERIC,
  prn_max_daily_doses INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Regimen Rules (Dynamic context & schedules)
CREATE TABLE IF NOT EXISTS regimen_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL DEFAULT 'fixed_clock',
  fixed_time TIME,
  meal_anchor TEXT,
  meal_offset_minutes INT DEFAULT 0,
  dose_quantity NUMERIC NOT NULL DEFAULT 1,
  days_of_week JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Dose Logs (Historical administration & audit trail)
CREATE TABLE IF NOT EXISTS dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT NOT NULL UNIQUE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'taken',
  administered_by_profile_id UUID REFERENCES profiles(id),
  meal_correlated_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Biometric Readings (BLE Cuffs, Dexcom CGM, Steps, Sleep)
CREATE TABLE IF NOT EXISTS biometric_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'blood_pressure', 'blood_glucose', 'steps', 'sleep', 'water_intake'
  source_device_name TEXT,
  systolic_mmhg INT,
  diastolic_mmhg INT,
  pulse_bpm INT,
  glucose_mg_dl INT,
  glucose_trend TEXT,
  step_count INT,
  sleep_minutes INT,
  deep_sleep_minutes INT,
  water_amount_ml INT,
  notes TEXT,
  flag TEXT DEFAULT 'normal',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Family Messages & Activity Feed
CREATE TABLE IF NOT EXISTS family_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  sender_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  audio_url TEXT,
  audio_duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Inventory Transactions & Physical Pill Audits
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  tx_type TEXT NOT NULL,
  qty_delta NUMERIC NOT NULL,
  resulting_stock NUMERIC NOT NULL,
  reason_code TEXT,
  photo_evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Enterprise Nurse Visit Sessions (EVV & GPS Billing)
CREATE TABLE IF NOT EXISTS nurse_visit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_time TIMESTAMPTZ,
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  evv_verified BOOLEAN NOT NULL DEFAULT true,
  meds_administered_count INT NOT NULL DEFAULT 0,
  clinical_notes TEXT,
  witness_staff_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE regimen_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_visit_sessions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon access for initial prototype and mobile app
CREATE POLICY "Public Read Access" ON households FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON profiles FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON medications FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON regimen_rules FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON dose_logs FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON biometric_readings FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON family_messages FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON inventory_transactions FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON nurse_visit_sessions FOR ALL USING (true);

-- Enable Realtime for live cross-device synchronizations
ALTER PUBLICATION supabase_realtime ADD TABLE households, profiles, medications, dose_logs, biometric_readings, family_messages;
