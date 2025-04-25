
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
import IssuesTimeline from '@/components/IssuesTimeline';
import AddressSearch from '@/components/AddressSearch';
import { useToast } from '@/hooks/use-toast';
import { searchBuildingData, BuildingData } from '@/utils/buildingSearch';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
        const searchTerm = decodeURIComponent(address).trim();
        console.log("Searching for:", searchTerm);
        
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
  
  const getCategoryBreakdown = (issues: any[]) => {
    const categories: Record<string, number> = {};
    
    issues.forEach(issue => {
      const category = issue["Major Category"] || "Other";
      if (!categories[category]) categories[category] = 0;
      categories[category]++;
    });
    
    return Object.entries(categories).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-400">Searching for building information...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (showNoResults) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="container mx-auto py-12 px-4">
          <div className="mb-6">
            <AddressSearch />
          </div>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Info className="h-5 w-5 text-emerald-500" />
                No Results Found
              </CardTitle>
              <CardDescription className="text-neutral-400">
                We couldn't find any buildings matching your search.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <p className="text-neutral-400 mb-4">
                  Try modifying your search or try searching for a different address, borough, or neighborhood.
                </p>
                <p className="text-sm text-neutral-500">
                  Note: Our database only includes NYC buildings with reported issues.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />
      <div className="container mx-auto py-6 md:py-12 px-4 flex-1">
        <div className="mb-8">
          <AddressSearch />
        </div>
        
        {buildingData && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
                  <Building className="h-6 w-6 text-emerald-500" />
                  {buildingData.address}
                </h1>
                <p className="text-neutral-400 mt-1">{buildingData.borough}, New York City</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                  {buildingData.totalComplaints} Reported Issues
                </Badge>
                <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800">
                  Save Building
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2 bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Building Overview</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Summary of reported issues in this building
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <LiveabilityScore issues={buildingData.housingIssues} />
                  </div>
                  
                  <Tabs defaultValue="issues" className="text-white">
                    <TabsList className="grid grid-cols-4 mb-4 bg-neutral-800">
                      <TabsTrigger value="issues" className="text-neutral-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Issues</TabsTrigger>
                      <TabsTrigger value="summary" className="text-neutral-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">AI Summary</TabsTrigger>
                      <TabsTrigger value="costs" className="text-neutral-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Cost Estimates</TabsTrigger>
                      <TabsTrigger value="timeline" className="text-neutral-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Timeline</TabsTrigger>
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
                      <IssuesTimeline issues={buildingData.housingIssues} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white">Building Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Building ID:</dt>
                        <dd className="text-white">{buildingData.buildingId || "Not available"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Borough:</dt>
                        <dd className="text-white">{buildingData.borough}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">ZIP Code:</dt>
                        <dd className="text-white">{buildingData.housingIssues[0]?.["Post Code"] || "Not available"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-400">Community Board:</dt>
                        <dd className="text-white">{buildingData.housingIssues[0]?.["Community Board"] || "Not available"}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white">Issue Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getCategoryBreakdown(buildingData.housingIssues).map((category, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-neutral-300">{category.name}</span>
                          <Badge variant={category.count > 5 ? "destructive" : "outline"} className={category.count > 5 ? "" : "text-neutral-300 border-neutral-600"}>
                            {category.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Alert className="bg-neutral-900 border-neutral-700">
                  <AlertTitle className="flex items-center gap-2 text-white">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Student Housing Alert
                  </AlertTitle>
                  <AlertDescription className="mt-2 text-sm text-neutral-400">
                    This building has several issues that may affect student living comfort. Review the full report before signing.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
            
            <Card className="mb-8 bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Similar Buildings Nearby</CardTitle>
                <CardDescription className="text-neutral-400">
                  Compare with other buildings in this neighborhood
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden bg-neutral-800 border-neutral-700">
                      <CardContent className="p-3">
                        <h4 className="text-sm font-medium mb-1 text-white">
                          {buildingData.address.split(',')[0].replace(/\d+/, (num) => String(Number(num) + i * 2))}
                        </h4>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-400">
                            {Math.max(1, buildingData.totalComplaints - i * 5)} issues
                          </span>
                          <Badge variant="outline" className={
                            i === 0 ? "bg-red-950/30 text-red-400 border-red-800" : 
                            i === 1 ? "bg-amber-950/30 text-amber-400 border-amber-800" : 
                            "bg-green-950/30 text-green-400 border-green-800"
                          }>
                            {i === 0 ? "High" : i === 1 ? "Medium" : "Low"} Risk
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Results;
