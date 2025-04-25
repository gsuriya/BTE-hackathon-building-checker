
import { supabase } from "@/integrations/supabase/client";

export const searchExactAddress = async (houseNumber: string, streetName: string) => {
  const { data, error } = await supabase
    .from('nyc_housing_data')
    .select('*')
    .eq('House Number', houseNumber)
    .ilike('Street Name', streetName)
    .limit(100);
    
  if (error) {
    console.error("Database error in exact search:", error);
    return null;
  }
  
  return data;
};

export const searchFuzzyAddress = async (houseNumber: string, streetName: string) => {
  const { data, error } = await supabase
    .from('nyc_housing_data')
    .select('*')
    .or(`House Number.eq.${houseNumber},Street Name.ilike.%${streetName}%`)
    .limit(100);
    
  if (error) {
    console.error("Database error in fuzzy search:", error);
    return null;
  }
  
  return data;
};
