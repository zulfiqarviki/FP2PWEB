import { createClient } from '@supabase/supabase-js';

// Temporary hardcode untuk testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzhnwgshjgxfviiyudui.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aG53Z3Noamd4ZnZpaXl1ZHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzY0NzksImV4cCI6MjA4MDMxMjQ3OX0.01Gv9aebDPZ729OMT5I9b-yZOc1eIHk0Q0fecYy4MRo';

console.log('🔍 Debug Environment:');
console.log('URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key from env:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Using URL:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://gzhnwgshjgxfviiyudui.supabase.co') {
  console.error('❌ Missing Supabase environment variables!');
  throw new Error('Missing Supabase environment variables');
}

console.log('✅ Supabase client initialized');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);