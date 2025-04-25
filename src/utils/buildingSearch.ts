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
    
    // Extract house number and street name
    const parts = searchTermClean.match(/^(\d+)\s+(.+?)(?:,|$)/i);
    if (!parts) {
      console.log("Could not parse house number and street name");
      return null;
    }
    
    const [_, houseNumber, streetName] = parts;
    console.log("Parsed address:", { houseNumber, streetName });
    
    // First try an exact match
    let { data: exactMatches, error } = await supabase
      .from('nyc_housing_data')
      .select('*')
      .eq('House Number', houseNumber)
      .ilike('Street Name', streetName.trim())
      .limit(100);
      
    if (error) {
      console.error("Database error:", error);
      return null;
    }
    
    if (exactMatches && exactMatches.length > 0) {
      console.log(`Found ${exactMatches.length} exact matches`);
      return processSearchResults(exactMatches, searchTerm);
    }
    
    // If no exact match, try a more flexible search
    const { data: fuzzyMatches } = await supabase
      .from('nyc_housing_data')
      .select('*')
      .or(`House Number.eq.${houseNumber},Street Name.ilike.%${streetName.trim()}%`)
      .limit(100);
    
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

export const processSearchResults = (data: any[], searchTerm: string): BuildingData => {
  // Group by building address
  const buildingGroups: Record<string, any[]> = {};
  
  data.forEach(item => {
    // Create a consistent building key format
    const houseNum = item["House Number"] || "";
    const streetName = item["Street Name"] || "";
    const borough = item["Borough"] || "";
    
    // Create a standardized key format
    const key = `${houseNum} ${streetName}, ${borough}`.trim().toUpperCase();
    
    if (!buildingGroups[key]) buildingGroups[key] = [];
    buildingGroups[key].push(item);
  });
  
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
