-- 🧬 SYNCURA CORE DATABASE SCHEMA
-- Migration: 20260831000001_core_schema.sql

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

-- 2. Profiles (Managed members: Self, Mom, Child, Pet)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  dob DATE,
  role TEXT NOT NULL DEFAULT 'dependent', -- 'primary_admin', 'caregiver_full', 'caregiver_log_only', 'dependent'
  allergies JSONB DEFAULT '[]'::jsonb,
  blood_type TEXT,
  ice_contact_name TEXT,
  ice_contact_phone TEXT,
  emergency_notes TEXT,
  encrypted_dek TEXT, -- Zero-Knowledge profile DEK wrapped with household KEK
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
  form TEXT NOT NULL DEFAULT 'tablet', -- 'tablet', 'capsule', 'liquid_ml', 'inhaler_puff', 'insulin_unit'
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
  rule_type TEXT NOT NULL DEFAULT 'fixed_clock', -- 'fixed_clock', 'meal_relative', 'prn_sliding', 'tapering'
  fixed_time TIME,
  meal_anchor TEXT, -- 'breakfast', 'lunch', 'dinner', 'bedtime'
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
  status TEXT NOT NULL DEFAULT 'taken', -- 'taken', 'snoozed', 'skipped', 'missed'
  administered_by_profile_id UUID REFERENCES profiles(id),
  meal_correlated_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Family Messages & Activity Feed
CREATE TABLE IF NOT EXISTS family_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  sender_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'voice_memo', 'auto_dose_log', 'refill_alert'
  content TEXT NOT NULL,
  audio_url TEXT,
  audio_duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Inventory Transactions & Physical Pill Audits
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  tx_type TEXT NOT NULL, -- 'dose_taken', 'recount_audit', 'refill_added', 'discarded_or_spilled'
  qty_delta NUMERIC NOT NULL,
  resulting_stock NUMERIC NOT NULL,
  reason_code TEXT,
  photo_evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for sub-second timeline lookups
CREATE INDEX IF NOT EXISTS idx_medications_profile ON medications(profile_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_profile_time ON dose_logs(profile_id, scheduled_time DESC);
CREATE INDEX IF NOT EXISTS idx_family_messages_household ON family_messages(household_id, created_at DESC);
