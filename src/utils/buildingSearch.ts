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
    
    // Parse the search term to get house number and street name if possible
    const searchParts = searchTermClean.split(/\s+/);
    const potentialHouseNumber = searchParts[0];
    let hasHouseNumber = /^\d+$/.test(potentialHouseNumber);
    
    // First try looking for matches with house number and street name
    let query = supabase.from('nyc_housing_data').select('*');
    
    // If we have what looks like a house number, search more specifically
    if (hasHouseNumber) {
      query = query.eq('"House Number"', potentialHouseNumber);
      
      // If we have more than just a house number, also filter by street name
      if (searchParts.length > 1) {
        const streetName = searchParts.slice(1).join(' ');
        query = query.ilike('"Street Name"', `%${streetName}%`);
      }
    } else {
      // If no house number, do a more general search
      query = query.or(`"House Number".ilike.%${searchTermClean}%,"Street Name".ilike.%${searchTermClean}%`);
    }
    
    // Limit the results
    query = query.limit(100);
    
    // Execute the query
    const { data: matches, error } = await query;
    
    if (error) {
      console.error("Supabase search error:", error);
      throw error;
    }
    
    console.log(`Found ${matches?.length || 0} matches for "${searchTerm}"`);
    
    if (!matches || matches.length === 0) {
      // Try a more permissive search using tokenized parts of the address
      const searchWords = searchTermClean.split(/\s+/);
      
      // Only proceed if we have meaningful search parts
      if (searchWords.length < 2) {
        console.log("Not enough specific information to search");
        return null;
      }
      
      // Filter out common street suffix words
      const relevantWords = searchWords.filter(word => 
        word.length > 2 && !["st", "street", "ave", "avenue", "blvd", "boulevard"].includes(word)
      );
      
      if (relevantWords.length === 0) {
        return null;
      }
      
      // Build a query for each relevant word
      const fuzzySearches = [];
      for (const word of relevantWords) {
        fuzzySearches.push(`"House Number"::text='${word}'`, `"Street Name".ilike.%${word}%`);
      }
      
      const { data: fuzzyMatches, error: fuzzyError } = await supabase
        .from('nyc_housing_data')
        .select('*')
        .or(fuzzySearches.join(','))
        .limit(100);
        
      if (fuzzyError || !fuzzyMatches || fuzzyMatches.length === 0) {
        return null;
      }
      
      console.log(`Found ${fuzzyMatches.length} fuzzy matches`);
      return processSearchResults(fuzzyMatches, searchTerm);
    }
    
    // Process the data
    return processSearchResults(matches, searchTerm);
  } catch (error) {
    console.error("Error in searchBuildingData:", error);
    throw error;
  }
};

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
      .select('"House Number", "Street Name", "Borough"')
      .filter('"House Number"', 'neq', '')  // Ensure house number exists
      .filter('"Street Name"', 'neq', '')   // Ensure street name exists
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
