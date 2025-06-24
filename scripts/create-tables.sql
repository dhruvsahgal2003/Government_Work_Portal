-- Create work_records table
CREATE TABLE IF NOT EXISTS work_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  place TEXT NOT NULL,
  village VARCHAR(255) NOT NULL,
  constituency_origin VARCHAR(255) NOT NULL,
  constituency_work VARCHAR(255) NOT NULL,
  referred_by JSONB DEFAULT '[]'::jsonb,
  nature_of_work VARCHAR(100) NOT NULL,
  nature_details TEXT,
  action_taken TEXT,
  concerned_person VARCHAR(255),
  work_allocated_to VARCHAR(255),
  status VARCHAR(50) DEFAULT 'In Progress',
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_records_record_id ON work_records(record_id);
CREATE INDEX IF NOT EXISTS idx_work_records_full_name ON work_records(full_name);
CREATE INDEX IF NOT EXISTS idx_work_records_constituency_origin ON work_records(constituency_origin);
CREATE INDEX IF NOT EXISTS idx_work_records_constituency_work ON work_records(constituency_work);
CREATE INDEX IF NOT EXISTS idx_work_records_nature_of_work ON work_records(nature_of_work);
CREATE INDEX IF NOT EXISTS idx_work_records_status ON work_records(status);
CREATE INDEX IF NOT EXISTS idx_work_records_created_at ON work_records(created_at);
CREATE INDEX IF NOT EXISTS idx_work_records_is_draft ON work_records(is_draft);

-- Create RLS (Row Level Security) policies
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all records
CREATE POLICY "Allow authenticated users to read work records" ON work_records
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert records
CREATE POLICY "Allow authenticated users to insert work records" ON work_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update records
CREATE POLICY "Allow authenticated users to update work records" ON work_records
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete records
CREATE POLICY "Allow authenticated users to delete work records" ON work_records
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create referred_by table
CREATE TABLE IF NOT EXISTS referred_by (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_record_id UUID REFERENCES work_records(id) ON DELETE CASCADE,
  referrer_name VARCHAR(255) NOT NULL,
  referrer_contact VARCHAR(255),
  is_self BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for referred_by table
CREATE INDEX IF NOT EXISTS idx_referred_by_work_record_id ON referred_by(work_record_id);
CREATE INDEX IF NOT EXISTS idx_referred_by_referrer_name ON referred_by(referrer_name);

-- Create RLS policies for referred_by table
ALTER TABLE referred_by ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read referred_by" ON referred_by
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert referred_by" ON referred_by
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update referred_by" ON referred_by
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete referred_by" ON referred_by
  FOR DELETE USING (auth.role() = 'authenticated');
