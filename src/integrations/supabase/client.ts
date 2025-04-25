
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to log sample addresses to console and return the data
export async function logSampleAddresses() {
  try {
    console.log('Fetching sample addresses from Supabase...');
    
    // First, get a count of total records
    const { count, error: countError } = await supabase
      .from('nyc_housing_data')
      .select('id', { count: 'exact', head: true });

    if (countError) throw countError;
    
    // Calculate a random offset to get different addresses each time
    const randomOffset = Math.floor(Math.random() * (count - 5));
    
    // Fetch 5 random addresses
    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select('"House Number", "Street Name", Borough')
      .range(randomOffset, randomOffset + 4);

    if (error) throw error;
    
    console.log('Sample Addresses:');
    data.forEach((address, index) => {
      console.log(`${index + 1}. ${address['House Number']} ${address['Street Name']}, ${address.Borough}`);
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    if (error.code === '57014') {
      console.error('Query timed out. The database might be under heavy load or the query is too complex.');
    }
    throw error;
  }
}

// Export getSampleAddresses as an alias of logSampleAddresses for backwards compatibility
export const getSampleAddresses = logSampleAddresses;
