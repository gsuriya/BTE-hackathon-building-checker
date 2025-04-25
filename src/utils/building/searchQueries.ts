import { supabase } from "@/lib/supabase";

// Columns needed for initial search display and linking to results
const SEARCH_RESULT_COLUMNS = '"House Number", "Street Name", "Borough"';

export const searchExactAddress = async (houseNumber: string, streetName: string) => {
  try {
    const cleanHouseNumber = houseNumber.trim();
    const cleanStreetName = streetName.trim().replace(/\s+/g, ' ');

    console.log('[searchExactAddress] Executing with:', { cleanHouseNumber, cleanStreetName });

    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select(SEARCH_RESULT_COLUMNS)
      .eq('House Number', cleanHouseNumber)
      .ilike('Street Name', cleanStreetName)
      .limit(10); // Reduce limit for faster initial search
      
    if (error) {
      console.error("[searchExactAddress] Supabase error:", error);
      throw error;
    }
    
    console.log(`[searchExactAddress] Found ${data?.length || 0} results`);
    return data;
  } catch (err) {
    console.error("[searchExactAddress] Caught error:", err);
    throw err;
  }
};

export const searchFuzzyAddress = async (houseNumber: string, streetName: string) => {
  try {
    const cleanHouseNumber = houseNumber.trim();
    const cleanStreetName = streetName.trim().replace(/\s+/g, ' ');

    console.log('[searchFuzzyAddress] Executing with:', { cleanHouseNumber, cleanStreetName });

    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select(SEARCH_RESULT_COLUMNS)
      .or(`"House Number".eq.${cleanHouseNumber},"Street Name".ilike.%${cleanStreetName}%`) // Ensure column names are quoted if they contain spaces
      .limit(10); // Reduce limit for faster initial search
      
    if (error) {
      console.error("[searchFuzzyAddress] Supabase error:", error);
      throw error;
    }
    
    console.log(`[searchFuzzyAddress] Found ${data?.length || 0} results`);
    return data;
  } catch (err) {
    console.error("[searchFuzzyAddress] Caught error:", err);
    throw err;
  }
};
