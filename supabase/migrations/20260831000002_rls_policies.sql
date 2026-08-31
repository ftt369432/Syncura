-- 🧬 SYNCURA ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20260831000002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE regimen_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's active household ID from JWT claim or profile link
CREATE OR REPLACE FUNCTION current_user_household_id()
RETURNS UUID AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Households: Members can view and update their own household
CREATE POLICY "Household members can view household"
  ON households FOR SELECT
  USING (id = current_user_household_id());

CREATE POLICY "Household admins can update household"
  ON households FOR UPDATE
  USING (id = current_user_household_id());

-- 2. Profiles: Household members can view all profiles in same household
CREATE POLICY "Household members can view co-profiles"
  ON profiles FOR SELECT
  USING (household_id = current_user_household_id());

CREATE POLICY "Admins can manage household profiles"
  ON profiles FOR ALL
  USING (household_id = current_user_household_id());

-- 3. Medications: Household members can view medications
CREATE POLICY "Household members view medications"
  ON medications FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

CREATE POLICY "Caregivers manage medications"
  ON medications FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

-- 4. Dose Logs: Household members can view and insert dose logs
CREATE POLICY "Household view dose logs"
  ON dose_logs FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

CREATE POLICY "Household insert dose logs"
  ON dose_logs FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE household_id = current_user_household_id()));

-- 5. Family Messages: Household stream
CREATE POLICY "Household view messages"
  ON family_messages FOR SELECT
  USING (household_id = current_user_household_id());

CREATE POLICY "Household post messages"
  ON family_messages FOR INSERT
  WITH CHECK (household_id = current_user_household_id());
