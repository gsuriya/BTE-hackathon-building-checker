
export const parseAddress = (searchTerm: string): { houseNumber: string; streetName: string; } | null => {
  const searchTermClean = searchTerm.trim().toLowerCase();
  const parts = searchTermClean.match(/^(\d+)\s+(.+?)(?:,|$)/i);
  
  if (!parts) {
    console.log("Could not parse address into house number and street name");
    return null;
  }
  
  const [_, houseNumber, streetName] = parts;
  console.log("Parsed address:", { houseNumber, streetName });
  
  return {
    houseNumber,
    streetName: streetName.trim()
  };
};
