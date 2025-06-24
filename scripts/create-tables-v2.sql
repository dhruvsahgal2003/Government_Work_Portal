-- Drop existing tables if they exist (be careful with this in production)
DROP TABLE IF EXISTS referred_by CASCADE;
DROP TABLE IF EXISTS work_records CASCADE;

-- Create work_records table with correct structure
CREATE TABLE work_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  place_address TEXT NOT NULL,
  village_city VARCHAR(255) NOT NULL,
  constituency_origin VARCHAR(255) NOT NULL,
  constituency_work VARCHAR(255) NOT NULL,
  nature_of_work VARCHAR(100) NOT NULL CHECK (nature_of_work IN ('development', 'jan_kalyan', 'transfers_employment', 'other')),
  nature_of_work_details TEXT,
  action_taken TEXT,
  concerned_person_contact VARCHAR(255),
  work_allocated_to VARCHAR(255),
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('done', 'in_progress', 'incomplete')),
  date_of_entry DATE DEFAULT CURRENT_DATE,
  is_draft BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID
);

-- Create referred_by table
CREATE TABLE referred_by (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_record_id UUID REFERENCES work_records(id) ON DELETE CASCADE,
  referrer_name VARCHAR(255) NOT NULL,
  referrer_contact VARCHAR(255),
  is_self BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_work_records_full_name ON work_records(full_name);
CREATE INDEX idx_work_records_phone_number ON work_records(phone_number);
CREATE INDEX idx_work_records_constituency_origin ON work_records(constituency_origin);
CREATE INDEX idx_work_records_constituency_work ON work_records(constituency_work);
CREATE INDEX idx_work_records_nature_of_work ON work_records(nature_of_work);
CREATE INDEX idx_work_records_status ON work_records(status);
CREATE INDEX idx_work_records_date_of_entry ON work_records(date_of_entry);
CREATE INDEX idx_work_records_created_at ON work_records(created_at);
CREATE INDEX idx_work_records_is_draft ON work_records(is_draft);
CREATE INDEX idx_work_records_created_by ON work_records(created_by);

-- Create indexes for referred_by table
CREATE INDEX idx_referred_by_work_record_id ON referred_by(work_record_id);
CREATE INDEX idx_referred_by_referrer_name ON referred_by(referrer_name);

-- Enable RLS (Row Level Security)
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE referred_by ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for work_records
CREATE POLICY "Allow authenticated users to read work records" ON work_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert work records" ON work_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update work records" ON work_records
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete work records" ON work_records
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for referred_by
CREATE POLICY "Allow authenticated users to read referred_by" ON referred_by
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert referred_by" ON referred_by
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update referred_by" ON referred_by
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete referred_by" ON referred_by
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_work_records_updated_at 
    BEFORE UPDATE ON work_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
