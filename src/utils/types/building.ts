
export interface BuildingData {
  borough: string;
  address: string;
  housingIssues: any[];
  buildingId?: string;
  totalComplaints: number;
}

export interface AddressParts {
  houseNumber: string;
  streetName: string;
}
