-- Add missing columns to daily_reports table for backwards compatibility
ALTER TABLE daily_reports 
ADD COLUMN IF NOT EXISTS yesterday_work TEXT,
ADD COLUMN IF NOT EXISTS today_plan TEXT;

-- Update the updated_at trigger to include the new columns
DROP TRIGGER IF EXISTS update_daily_reports_updated_at ON daily_reports;
CREATE TRIGGER update_daily_reports_updated_at 
    BEFORE UPDATE ON daily_reports 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();