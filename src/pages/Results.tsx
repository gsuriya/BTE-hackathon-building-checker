import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Building, AlertTriangle, Info } from "lucide-react";
import IssuesList from '@/components/IssuesList';
import LiveabilityScore from '@/components/LiveabilityScore';
import AISummary from '@/components/AISummary';
import IssuesCostEstimate from '@/components/IssuesCostEstimate';
import AddressSearch from '@/components/AddressSearch';
import { useToast } from '@/hooks/use-toast';
import { searchBuildingData, BuildingData } from '@/utils/buildingSearch';

const Results = () => {
  const [searchParams] = useSearchParams();
  const address = searchParams.get('address');
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);
  
  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!address) {
        setIsLoading(false);
        setShowNoResults(true);
        return;
      }
      
      setIsLoading(true);
      setShowNoResults(false);
      
      try {
        // Parse the search term - could be a full address, borough, etc.
        const searchTerm = decodeURIComponent(address).trim();
        console.log("Searching for:", searchTerm);
        
        // Use the new search utility
        const data = await searchBuildingData(searchTerm);
        
        if (!data) {
          setShowNoResults(true);
        } else {
          setBuildingData(data);
        }
        
      } catch (error) {
        console.error("Error fetching building data:", error);
        toast({
          title: "Error",
          description: "Failed to retrieve building data. Please try again.",
          variant: "destructive",
        });
        setShowNoResults(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBuildingData();
  }, [address, toast]);
  
  // Helper function to count issues by category
  const getCategoryBreakdown = (issues: any[]) => {
    const categories: Record<string, number> = {};
    
    // Count issues by major category
    issues.forEach(issue => {
      const category = issue["Major Category"] || "Other";
      if (!categories[category]) categories[category] = 0;
      categories[category]++;
    });
    
    // Format as array for display
    return Object.entries(categories).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for building information...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (showNoResults) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="mb-6">
          <AddressSearch />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              No Results Found
            </CardTitle>
            <CardDescription>
              We couldn't find any buildings matching your search.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-center">
              <p className="text-gray-600 mb-4">
                Try modifying your search or try searching for a different address, borough, or neighborhood.
              </p>
              <p className="text-sm text-gray-500">
                Note: Our database only includes NYC buildings with reported issues.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 md:py-12 px-4">
      <div className="mb-8">
        <AddressSearch />
      </div>
      
      {buildingData && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Building className="h-6 w-6" />
                {buildingData.address}
              </h1>
              <p className="text-gray-600 mt-1">{buildingData.borough}, New York City</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-600 hover:bg-blue-700">
                {buildingData.totalComplaints} Reported Issues
              </Badge>
              <Button variant="outline" size="sm">
                Save Building
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Building Overview</CardTitle>
                <CardDescription>
                  Summary of reported issues in this building
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <LiveabilityScore issues={buildingData.housingIssues} />
                </div>
                
                <Tabs defaultValue="issues">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="issues">Issues</TabsTrigger>
                    <TabsTrigger value="summary">AI Summary</TabsTrigger>
                    <TabsTrigger value="costs">Cost Estimates</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="issues">
                    <IssuesList issues={buildingData.housingIssues} />
                  </TabsContent>
                  
                  <TabsContent value="summary">
                    <AISummary issues={buildingData.housingIssues} address={buildingData.address} />
                  </TabsContent>
                  
                  <TabsContent value="costs">
                    <IssuesCostEstimate issues={buildingData.housingIssues} />
                  </TabsContent>
                  
                  <TabsContent value="timeline">
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-500">Timeline view coming soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Building Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Building ID:</dt>
                      <dd>{buildingData.buildingId || "Not available"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Borough:</dt>
                      <dd>{buildingData.borough}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">ZIP Code:</dt>
                      <dd>{buildingData.housingIssues[0]?.["Post Code"] || "Not available"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Community Board:</dt>
                      <dd>{buildingData.housingIssues[0]?.["Community Board"] || "Not available"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Issue Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getCategoryBreakdown(buildingData.housingIssues).map((category, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <Badge variant={category.count > 5 ? "destructive" : "outline"}>
                          {category.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Alert>
                <AlertTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Student Housing Alert
                </AlertTitle>
                <AlertDescription className="mt-2 text-sm">
                  This building has several issues that may affect student living comfort. Review the full report before signing.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Similar Buildings Nearby</CardTitle>
              <CardDescription>
                Compare with other buildings in this neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 bg-slate-100 rounded-lg">
                <p className="text-gray-500">Coming soon: Building comparisons</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Results;
