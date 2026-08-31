import { createClient } from '@supabase/supabase-js';

const url = 'https://bxzareikojrlnsaydasz.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4emFyZWlrb2pybG5zYXlkYXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODk2MTMsImV4cCI6MjEwMzc2NTYxM30.Q64iJcUf1GKvrHxZ4XVxF7xiyvM7KAZCsmoMf_M_YRQ';

const supabase = createClient(url, key);

async function test() {
  console.log('Testing connection to Supabase project:', url);
  
  try {
    const { data, error } = await supabase.from('households').select('*').limit(5);
    if (error) {
      console.log('Query result notice:', error.message, 'Code:', error.code);
    } else {
      console.log('Successfully queried households! Records found:', data.length);
    }
  } catch (err) {
    console.error('Fatal connection error:', err);
  }
}

test();
