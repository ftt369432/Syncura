-- 🧬 SYNCURA TRIGGERS & REALTIME REPLICATION
-- Migration: 20260831000003_triggers_and_realtime.sql

-- Trigger Function: Auto-decrement inventory stock and record transaction when a dose is logged as 'taken'
CREATE OR REPLACE FUNCTION handle_dose_logged_inventory_decrement()
RETURNS TRIGGER AS $$
DECLARE
  v_current_stock NUMERIC;
  v_new_stock NUMERIC;
BEGIN
  IF NEW.status = 'taken' THEN
    -- Fetch current stock
    SELECT current_stock INTO v_current_stock
    FROM medications
    WHERE id = NEW.medication_id;

    -- Decrement stock (cannot go below 0)
    v_new_stock := GREATEST(0, v_current_stock - 1);

    -- Update medication stock
    UPDATE medications
    SET current_stock = v_new_stock
    WHERE id = NEW.medication_id;

    -- Record immutable inventory transaction
    INSERT INTO inventory_transactions (
      medication_id,
      tx_type,
      qty_delta,
      resulting_stock,
      reason_code
    ) VALUES (
      NEW.medication_id,
      'dose_taken',
      -1,
      v_new_stock,
      'auto_dose_log'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to dose_logs
DROP TRIGGER IF EXISTS trg_dose_logged_inventory ON dose_logs;
CREATE TRIGGER trg_dose_logged_inventory
  AFTER INSERT ON dose_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_dose_logged_inventory_decrement();

-- Enable Supabase Realtime publication for dose_logs and family_messages
ALTER PUBLICATION supabase_realtime ADD TABLE dose_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE family_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE medications;
