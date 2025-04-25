
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
    
    // Query the database for matching buildings with more specific search
    const { data, error } = await supabase
      .from('nyc_housing_data')
      .select('*')
      .or(`Borough.ilike.%${searchTerm}%, "Street Name".ilike.%${searchTerm}%, "House Number".ilike.%${searchTerm}%, "Post Code".ilike.%${searchTerm}%`)
      .limit(100);
    
    if (error) {
      console.error("Supabase search error:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} records matching "${searchTerm}"`);
    
    if (!data || data.length === 0) {
      return null;
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
    const key = `${item["House Number"] || ""} ${item["Street Name"] || ""}, ${item["Borough"] || ""}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Find the best match (either exact match or first result)
  const addresses = Object.keys(buildingGroups);
  
  console.log("Available addresses:", addresses);
  
  const bestMatch = addresses.find(addr => 
    addr.toLowerCase().includes(searchTerm.toLowerCase())
  ) || addresses[0];
  
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
