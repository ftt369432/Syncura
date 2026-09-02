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
  chronic_conditions JSONB DEFAULT '[]'::jsonb,
  voice_intake_notes JSONB DEFAULT '[]'::jsonb,
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
-- PRODUCTION MULTI-TENANT ROW LEVEL SECURITY (RLS) POLICIES
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

-- Helper function: Resolve active user household
CREATE OR REPLACE FUNCTION current_user_household_id()
RETURNS UUID AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Households: Isolated to member users
CREATE POLICY "Household members can view household"
  ON households FOR SELECT
  USING (id = current_user_household_id());

CREATE POLICY "Household admins can update household"
  ON households FOR UPDATE
  USING (id = current_user_household_id());

CREATE POLICY "Users can create household"
  ON households FOR INSERT
  WITH CHECK (true);

-- 2. Profiles: Strict isolation within the same household
CREATE POLICY "Household members view co-profiles"
  ON profiles FOR SELECT
  USING (household_id = current_user_household_id() OR id = auth.uid());

CREATE POLICY "Household members manage profiles"
  ON profiles FOR ALL
  USING (household_id = current_user_household_id() OR id = auth.uid());

-- 3. Medications: Strict isolation within the household
CREATE POLICY "Household members view medications"
  ON medications FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

CREATE POLICY "Household members manage medications"
  ON medications FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

-- 4. Dose Logs: Isolated to household patients
CREATE POLICY "Household view dose logs"
  ON dose_logs FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

CREATE POLICY "Household insert dose logs"
  ON dose_logs FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

-- 5. Family Messages: Private household stream
CREATE POLICY "Household view messages"
  ON family_messages FOR SELECT
  USING (household_id = current_user_household_id());

CREATE POLICY "Household post messages"
  ON family_messages FOR INSERT
  WITH CHECK (household_id = current_user_household_id());

-- 6. Biometrics & Telemetry: Private patient readings
CREATE POLICY "Household view biometrics"
  ON biometric_readings FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

CREATE POLICY "Household insert biometrics"
  ON biometric_readings FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

-- Enable Realtime for live cross-device synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE households, profiles, medications, dose_logs, biometric_readings, family_messages;
