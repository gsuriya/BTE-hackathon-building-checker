export const parseAddress = (searchTerm: string): { houseNumber: string; streetName: string; borough: string } | null => {
  const searchTermClean = searchTerm.trim();
  
  // Split by comma to separate address and borough
  const parts = searchTermClean.split(',');
  if (parts.length !== 2) {
    console.log("Could not parse address: missing comma separator for borough");
    return null;
  }

  const addressPart = parts[0].trim();
  const borough = parts[1].trim().toUpperCase();

  // Parse house number and street name from the address part
  const addressMatch = addressPart.match(/^(\d+)\s+(.+)$/i);
  if (!addressMatch) {
    console.log("Could not parse house number and street name");
    return null;
  }

  const [_, houseNumber, streetName] = addressMatch;
  
  console.log("Parsed address:", { houseNumber, streetName, borough });
  
  return {
    houseNumber,
    streetName: streetName.trim(),
    borough
  };
};
