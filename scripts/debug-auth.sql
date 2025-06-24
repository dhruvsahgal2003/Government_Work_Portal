-- Check if RLS policies are working correctly
-- Run this to see current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('work_records', 'referred_by');

-- Check if auth.users table has data
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;

-- Temporarily disable RLS to test if that's the issue (ONLY FOR DEBUGGING)
-- ALTER TABLE work_records DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE referred_by DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS after testing (IMPORTANT!)
-- ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE referred_by ENABLE ROW LEVEL SECURITY;
