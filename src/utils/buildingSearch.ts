
import { supabase } from "@/integrations/supabase/client";

export interface BuildingData {
  borough: string;
  address: string;
  housingIssues: any[];
  buildingId?: string;
  totalComplaints: number;
}

export const searchBuildingData = async (searchTerm: string): Promise<BuildingData | null> => {
  try {
    console.log("Searching for:", searchTerm);
    
    // Get a clean version of the search term
    const searchTermClean = searchTerm.trim().toLowerCase();
    
    // Require minimum specific search length (more than just a borough name)
    if (searchTermClean.length < 5) {
      console.log("Search term too short or generic");
      return null;
    }
    
    // First check for exact address match with house number and street
    const { data: exactMatches, error: exactMatchError } = await supabase
      .from('nyc_housing_data')
      .select('*')
      .textSearch('combined_address', `'${searchTermClean}'`, {
        config: 'english',
        type: 'plain'
      })
      .limit(100);
    
    if (exactMatchError) {
      console.error("Exact match search error:", exactMatchError);
    }
    
    if (exactMatches && exactMatches.length > 0) {
      console.log(`Found ${exactMatches.length} exact matches`);
      return processSearchResults(exactMatches, searchTerm);
    }
    
    // Try looking for partial matches with house number and street name
    const { data: partialMatches, error } = await supabase
      .from('nyc_housing_data')
      .select('*')
      .or(`"House Number".ilike.%${searchTermClean}%, "Street Name".ilike.%${searchTermClean}%`)
      .limit(200);
    
    if (error) {
      console.error("Supabase search error:", error);
      throw error;
    }
    
    console.log(`Found ${partialMatches?.length || 0} partial matches for "${searchTerm}"`);
    
    if (!partialMatches || partialMatches.length === 0) {
      // Try a more permissive search using tokenized parts of the address
      const searchParts = searchTermClean.split(/\s+/);
      
      // Only proceed if we have meaningful search parts
      if (searchParts.length < 2) {
        console.log("Not enough specific information to search");
        return null;
      }
      
      // Build a query that tries to match parts of the address
      let queryFilters = searchParts
        .filter(part => part.length > 2 && !["st", "street", "ave", "avenue", "blvd", "boulevard"].includes(part))
        .map(part => `"House Number".ilike.%${part}% OR "Street Name".ilike.%${part}%`);
      
      if (queryFilters.length === 0) {
        return null;
      }
      
      const { data: fuzzyMatches, error: fuzzyError } = await supabase
        .from('nyc_housing_data')
        .select('*')
        .or(queryFilters.join(','))
        .limit(100);
        
      if (fuzzyError || !fuzzyMatches || fuzzyMatches.length === 0) {
        return null;
      }
      
      console.log(`Found ${fuzzyMatches.length} fuzzy matches`);
      return processSearchResults(fuzzyMatches, searchTerm);
    }
    
    // Process the data
    return processSearchResults(partialMatches, searchTerm);
  } catch (error) {
    console.error("Error in searchBuildingData:", error);
    throw error;
  }
};

// Improved helper function to process search results
export const processSearchResults = (data: any[], searchTerm: string): BuildingData => {
  // Group by building address
  const buildingGroups = data.reduce((acc, item) => {
    // Create a consistent building key format
    const houseNum = item["House Number"] || "";
    const streetName = item["Street Name"] || "";
    const borough = item["Borough"] || "";
    
    // Create a standardized key format
    const key = `${houseNum} ${streetName}, ${borough}`.trim().toUpperCase();
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Find the best match
  const addresses = Object.keys(buildingGroups);
  
  console.log("Available addresses:", addresses);
  
  if (addresses.length === 0) {
    return {
      borough: "Unknown",
      address: searchTerm,
      housingIssues: [],
      totalComplaints: 0
    };
  }
  
  // Normalize search term for comparison
  const searchTermNorm = searchTerm.toUpperCase();
  
  // Scoring function to find the best address match
  const getAddressScore = (address: string) => {
    let score = 0;
    
    // Exact match gets highest score
    if (address === searchTermNorm) return 100;
    
    // Check for house number match
    const searchParts = searchTermNorm.split(/\s+/);
    const addressParts = address.split(/\s+/);
    
    // Check for house number match (typically the first numeric part)
    const searchHouseNum = searchParts.find(p => /^\d+$/.test(p));
    const addressHouseNum = addressParts.find(p => /^\d+$/.test(p));
    
    if (searchHouseNum && addressHouseNum && searchHouseNum === addressHouseNum) {
      score += 50;
    }
    
    // Check how many words match
    const searchWords = new Set(searchParts);
    addressParts.forEach(word => {
      if (searchWords.has(word)) {
        score += 10;
      }
    });
    
    // Check if address contains the search term
    if (address.includes(searchTermNorm)) {
      score += 30;
    }
    
    // Check if search term contains the address
    if (searchTermNorm.includes(address)) {
      score += 20;
    }
    
    return score;
  };
  
  // Find the best matching address using our scoring function
  let bestMatch = addresses[0];
  let bestScore = getAddressScore(addresses[0]);
  
  for (let i = 1; i < addresses.length; i++) {
    const score = getAddressScore(addresses[i]);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = addresses[i];
    }
  }
  
  const issues = buildingGroups[bestMatch] || [];
  
  console.log("Selected best match:", bestMatch, "with", issues.length, "issues (score:", bestScore, ")");
  
  return {
    borough: issues[0]?.Borough || "Unknown",
    address: bestMatch,
    housingIssues: issues,
    buildingId: issues[0]?.["Building ID"],
    totalComplaints: issues.length,
  };
};

export const getSampleAddresses = async (limit: number = 10): Promise<string[]> => {
  try {
    console.log(`Fetching ${limit} sample addresses`);
    
    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select('House Number, Street Name, Borough')
      .filter('House Number', 'neq', '')  // Ensure house number exists
      .filter('Street Name', 'neq', '')   // Ensure street name exists
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

// Add a window method to easily retrieve addresses from browser console
if (typeof window !== 'undefined') {
  (window as any).getSampleNYCAddresses = getSampleAddresses;
}
