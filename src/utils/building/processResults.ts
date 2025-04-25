
import { BuildingData } from "../types/building";

export const processSearchResults = (data: any[], searchTerm: string): BuildingData => {
  const buildingGroups: Record<string, any[]> = {};
  
  // Group by building address
  data.forEach(item => {
    const houseNum = item["House Number"] || "";
    const streetName = item["Street Name"] || "";
    const borough = item["Borough"] || "";
    const key = `${houseNum} ${streetName}, ${borough}`.trim().toUpperCase();
    
    if (!buildingGroups[key]) buildingGroups[key] = [];
    buildingGroups[key].push(item);
  });
  
  const addresses = Object.keys(buildingGroups);
  
  if (addresses.length === 0) {
    return {
      borough: "Unknown",
      address: searchTerm,
      housingIssues: [],
      totalComplaints: 0
    };
  }
  
  // Find best match using scoring
  const bestMatch = findBestMatch(addresses, searchTerm.toUpperCase());
  const issues = buildingGroups[bestMatch] || [];
  
  return {
    borough: issues[0]?.Borough || "Unknown",
    address: bestMatch,
    housingIssues: issues,
    buildingId: issues[0]?.["Building ID"],
    totalComplaints: issues.length,
  };
};

const findBestMatch = (addresses: string[], searchTermNorm: string): string => {
  const getAddressScore = (address: string): number => {
    let score = 0;
    
    if (address === searchTermNorm) return 100;
    
    const searchParts = searchTermNorm.split(/\s+/);
    const addressParts = address.split(/\s+/);
    
    const searchHouseNum = searchParts.find(p => /^\d+$/.test(p));
    const addressHouseNum = addressParts.find(p => /^\d+$/.test(p));
    
    if (searchHouseNum && addressHouseNum && searchHouseNum === addressHouseNum) {
      score += 50;
    }
    
    const searchWords = new Set(searchParts);
    addressParts.forEach(word => {
      if (searchWords.has(word)) score += 10;
    });
    
    if (address.includes(searchTermNorm)) score += 30;
    if (searchTermNorm.includes(address)) score += 20;
    
    return score;
  };
  
  let bestMatch = addresses[0];
  let bestScore = getAddressScore(addresses[0]);
  
  for (let i = 1; i < addresses.length; i++) {
    const score = getAddressScore(addresses[i]);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = addresses[i];
    }
  }
  
  console.log("Selected best match:", bestMatch, "with score:", bestScore);
  return bestMatch;
};
