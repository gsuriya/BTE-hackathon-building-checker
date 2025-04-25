import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  db: {
    schema: 'public'
  }
});

// Test the connection
/* (async () => {
  try {
    const { error, count } = await supabase
      .from('nyc_housing_data')
      .select('count', { count: 'exact', head: true }); // Use head:true for faster count

    if (error) {
      console.error('Supabase connection test failed:', error);
      // Log specific details if available
      if (error.message) console.error('Error Message:', error.message);
      if (error.details) console.error('Error Details:', error.details);
      if (error.hint) console.error('Error Hint:', error.hint);
    } else {
      console.log(`✅ Supabase connection successful. Found ${count} records (approx).`);
    }
  } catch (err) {
    console.error('Failed to test Supabase connection:', err);
  }
})(); */ 