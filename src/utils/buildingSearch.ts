
import { type BuildingData } from "./types/building";
import { parseAddress } from "./address/parseAddress";
import { searchExactAddress, searchFuzzyAddress } from "./building/searchQueries";
import { processSearchResults } from "./building/processResults";
import { supabase } from "../lib/supabase";

// Test Supabase connection and log results to console
const testSupabaseConnection = async () => {
  console.log("%c🔌 Testing Supabase connection...", "color: #10b981; font-weight: bold;");
  
  try {
    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error("❌ Supabase connection error:", error);
      return false;
    }
    
    console.log("%c✅ Supabase connection successful!", "color: #10b981; font-weight: bold;");
    console.log("%c📋 First 10 rows of NYC housing data:", "color: #10b981; font-weight: bold;");
    console.table(data);
    
    // Log the total count of records
    const { count } = await supabase
      .from('nyc_housing_data')
      .select('*', { count: 'exact', head: true });
    
    console.log(`%c📊 Total records in database: ${count}`, "color: #10b981; font-weight: bold;");
    return true;
  } catch (err) {
    console.error("❌ Unexpected error testing Supabase connection:", err);
    return false;
  }
};

// Run the test in development mode
if (import.meta.env.DEV) {
  testSupabaseConnection();
}

export const searchBuildingData = async (searchTerm: string): Promise<BuildingData | null> => {
  try {
    console.log("Searching for:", searchTerm);
    
    const addressParts = parseAddress(searchTerm);
    if (!addressParts) return null;
    
    // Try exact match first
    const exactMatches = await searchExactAddress(addressParts.houseNumber, addressParts.streetName);
    if (exactMatches && exactMatches.length > 0) {
      console.log(`Found ${exactMatches.length} exact matches`);
      return processSearchResults(exactMatches, searchTerm);
    }
    
    // Fall back to fuzzy search
    const fuzzyMatches = await searchFuzzyAddress(addressParts.houseNumber, addressParts.streetName);
    if (fuzzyMatches && fuzzyMatches.length > 0) {
      console.log(`Found ${fuzzyMatches.length} fuzzy matches`);
      return processSearchResults(fuzzyMatches, searchTerm);
    }
    
    console.log("No matches found");
    return null;
    
  } catch (error) {
    console.error("Error in searchBuildingData:", error);
    throw error;
  }
};

export const getSampleAddresses = async (limit: number = 10): Promise<string[]> => {
  try {
    console.log(`Fetching ${limit} sample addresses`);
    
    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select('"House Number", "Street Name", "Borough"')
      .limit(limit);
    
    if (error) {
      console.error("Error fetching sample addresses:", error);
      return [];
    }
    
    // Format addresses into readable strings
    const addresses = data.map(item => 
      `${item['House Number']} ${item['Street Name']}, ${item['Borough']}`
    );
    
    console.log("Sample addresses:", addresses);
    return addresses;
  } catch (err) {
    console.error("Unexpected error in getSampleAddresses:", err);
    return [];
  }
};

if (typeof window !== 'undefined') {
  (window as any).getSampleNYCAddresses = getSampleAddresses;
}
