
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
    
    // Format search term for better matching
    const formattedTerm = searchTerm.trim().toLowerCase();
    
    // Try multiple search approaches to increase chances of finding a match
    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select('*')
      .or(`Borough.ilike.%${formattedTerm}%, "Street Name".ilike.%${formattedTerm}%, "House Number".ilike.%${formattedTerm}%, "Post Code".ilike.%${formattedTerm}%`)
      .limit(500); // Increase limit to find more potential matches
    
    if (error) {
      console.error("Supabase search error:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} records matching "${searchTerm}"`);
    
    if (!data || data.length === 0) {
      // Try a more permissive search if no results
      const { data: backupData, error: backupError } = await supabase
        .from('nyc_housing_data')
        .select('*')
        .textSearch('combined_address', formattedTerm, {
          config: 'english',
          type: 'plain'
        })
        .limit(100);
        
      if (backupError || !backupData || backupData.length === 0) {
        return null;
      }
      
      console.log(`Found ${backupData.length} records in backup search`);
      return processSearchResults(backupData, searchTerm);
    }
    
    // Process the data
    return processSearchResults(data, searchTerm);
  } catch (error) {
    console.error("Error in searchBuildingData:", error);
    throw error;
  }
};

// Helper function to process search results
export const processSearchResults = (data: any[], searchTerm: string): BuildingData => {
  // Group by building address
  const buildingGroups = data.reduce((acc, item) => {
    // Create a consistent building key format
    const houseNum = item["House Number"] || "";
    const streetName = item["Street Name"] || "";
    const borough = item["Borough"] || "";
    
    const key = `${houseNum} ${streetName}, ${borough}`.trim();
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Find the best match (either exact match or first result)
  const addresses = Object.keys(buildingGroups);
  
  console.log("Available addresses:", addresses);
  
  // Attempt to find the best match by comparing with search term
  const searchTermLower = searchTerm.toLowerCase();
  
  // First try: exact match
  let bestMatch = addresses.find(addr => 
    addr.toLowerCase() === searchTermLower
  );
  
  // Second try: contains search term
  if (!bestMatch) {
    bestMatch = addresses.find(addr => 
      addr.toLowerCase().includes(searchTermLower)
    );
  }
  
  // Third try: search term contains address
  if (!bestMatch) {
    bestMatch = addresses.find(addr => 
      searchTermLower.includes(addr.toLowerCase())
    );
  }
  
  // Last resort: first address
  if (!bestMatch && addresses.length > 0) {
    bestMatch = addresses[0];
  } else if (!bestMatch) {
    // If we somehow have no addresses, create a minimal placeholder
    bestMatch = searchTerm;
    buildingGroups[bestMatch] = [];
  }
  
  const issues = buildingGroups[bestMatch] || [];
  
  console.log("Selected best match:", bestMatch, "with", issues.length, "issues");
  
  return {
    borough: issues[0]?.Borough || "Unknown",
    address: bestMatch,
    housingIssues: issues,
    buildingId: issues[0]?.["Building ID"],
    totalComplaints: issues.length,
  };
};
