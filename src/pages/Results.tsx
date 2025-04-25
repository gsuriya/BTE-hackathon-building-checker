// analyzeIssues() --> use Deepseek API to analyze issues
// fetchData() --> get data from supabase


import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "../lib/supabase";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  DollarSign, 
  Home, 
  ThumbsUp, 
  Activity,
  Bug,
  Wrench,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { parseAddress } from '@/utils/address/parseAddress';

interface BuildingIssue {
  Type: string;
  "Major Category": string;
  "Complaint Status": string;
  "Received Date": string;
  "Status Description"?: string;
  "Apartment"?: string;
  location?: string;
}

interface IssueCategory {
  category: string;
  count: number;
  severity: number;
  examples: {
    Type: string;
    "Complaint Status": string;
    "Received Date": string;
    "Status Description"?: string;
    location: string;
  }[];
}

interface AnalysisResult {
  livabilityScore: number;
  estimatedRepairCosts: {
    low: number;
    high: number;
  };
  impactScore: number;
  summary: string;
  recommendations: string[];
  issueCategories: IssueCategory[];
  monthlyTrends: {
    month: string;
    count: number;
  }[];
  severityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const [issues, setIssues] = useState<BuildingIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<'idle' | 'fetching' | 'analyzing' | 'error' | 'done'>('idle');

  const address = searchParams.get('address');
  const borough = searchParams.get('borough');


  // GET DATA FROM SUPABASE
  const fetchBuildingData = async () => {
    if (!address || !borough) return;

    setLoading(true);
    setLoadingStep('fetching'); // Start fetching
    setIssues([]);
    setError(null);
    setAnalysis(null); // Reset analysis

    const parsedAddress = parseAddress(address);
    if (!parsedAddress) {
      setError('Invalid address format.');
      setLoading(false);
      setLoadingStep('error');
      return;
    }
    console.log('Parsed address:', parsedAddress);
    const { houseNumber, streetName } = parsedAddress;

    try {
      // Fetch building data from Supabase using correct column names
      const { data, error: dbError } = await supabase
        .from('nyc_housing_data')
        .select(`
          "Type",
          "Major Category",
          "Complaint Status",
          "Received Date",
          "Status Description",
          "Apartment"
        `) // Removed "Floor"
        .eq('"House Number"', houseNumber.toUpperCase())
        .ilike('"Street Name"', streetName.toUpperCase())
        .eq('Borough', borough)
        .limit(500);

      if (dbError) {
        console.error('Supabase query error:', dbError);
        setError(`Failed to fetch building data. Error: ${dbError.message}`);
        setIssues([]);
        setLoadingStep('error'); // Fetching error
        return; // Stop here, but finally will still run
      } else if (data && data.length > 0) {
        console.log('=== RAW BUILDING DATA FROM SUPABASE ===');
        console.log('Total issues found:', data.length);
        
        // Group issues by type with location details
        const issueDetails = data.reduce((groups, issue) => {
          const type = issue.Type;
          if (!groups[type]) {
            groups[type] = [];
          }
          groups[type].push({
            location: issue.Apartment || 'Building-wide',
            status: issue["Complaint Status"],
            date: issue["Received Date"],
            description: issue["Status Description"]
          });
          return groups;
        }, {});
        
        console.log('=== DETAILED ISSUE BREAKDOWN BY LOCATION ===');
        console.log(JSON.stringify(issueDetails, null, 2));
        
        console.log('Full data:', JSON.stringify(data, null, 2));
        setIssues(data as BuildingIssue[]); 
        setError(null);

        setLoadingStep('analyzing'); // Switch step before analysis
        await analyzeIssues(data as BuildingIssue[]); // Call analysis

      } else {
        console.log('No data found for:', { houseNumber: houseNumber.toUpperCase(), streetName: streetName.toUpperCase(), borough }); // Add logging
        setIssues([]);
        setError('No building data found for this address.');
        setLoadingStep('error'); // No data found
      }
    } catch (err) {
      console.error('Error during data fetching or analysis:', err);
      // Avoid overwriting specific error from analyzeIssues if it threw
      if (!error) {
         setError('An unexpected error occurred during data processing.');
      }
      setIssues([]);
      setAnalysis(null);
      setLoadingStep('error'); // Mark step as error
    } finally {
      // Set final step only if no error occurred
      if (loadingStep !== 'error') {
        setLoadingStep('done');
      }
      setLoading(false); // Always set loading false
    }
  };


  // USE DEEPSEEK API HERE TO ANALYZE ISSUES
  const analyzeIssues = async (buildingIssues: BuildingIssue[]) => {
    try {
      // Prepare a more detailed summary for the AI, including location
      const issueSummary = buildingIssues.slice(0, 20).map(issue => ({ // Increased sample size slightly
          type: issue.Type,
          category: issue["Major Category"],
          status: issue["Complaint Status"],
          date: issue["Received Date"],
          location: issue.Apartment || 'Building-wide', // Updated location logic, removed Floor
          description: issue["Status Description"] || 'N/A'
      }));

      console.log('=== PROMPT BEING SENT TO DEEPSEEK ===');
      // Log only the summary part of the prompt for brevity
      console.log('Building Issues Summary (first 20 with location):', JSON.stringify(issueSummary, null, 2));

      const prompt = `
        Analyze these building issues and provide a detailed analysis in JSON format:
        
        Building Address: ${address}, ${borough}
        Total Issues Found: ${buildingIssues.length} 
        Issue Sample (first 20, including location):
        ${JSON.stringify(issueSummary, null, 2)}

        Please provide a JSON object matching the TypeScript interface AnalysisResult structure. 
        
        **CRITICAL SCORING GUIDELINES:**
        - **Accuracy is paramount.** Base scores strictly on the provided data (severity, frequency, recency, status). Avoid generic scores.
        - **Livability Score (0-100):** 
            - Start at 100. 
            - Deduct heavily for unresolved critical issues (HEAT/HOT WATER, PLUMBING major leaks, UNSANITARY serious infestations, STRUCTURAL, ELECTRIC fire hazards). 
            - Deduct moderately for recurring non-critical issues or slow resolution times.
            - Deduct less for isolated, minor, or quickly resolved issues.
            - Consider the *density* of issues relative to the building size (if inferrable). Many complaints in a small building is worse than few in a large one.
        - **Impact Score (0-100):** 
            - Reflects how severely daily life is affected. 
            - High impact (low score) for issues disrupting essential services (heat, water, safety).
            - Medium impact for persistent nuisances (pests, noise, minor leaks).
            - Low impact (high score) for cosmetic or isolated minor issues.
        - **Estimated Repair Costs { low: number, high: number }:** Base on the *types* and *number* of issues reported. Electrical/Plumbing/Structural issues cost more than Paint/Plaster.
        - **Severity Breakdown { high: number, medium: number, low: number } (%):** Categorize issues based on potential impact (Safety > Essential Services > Nuisance > Cosmetic). Calculate percentages based on the *entire* dataset provided, not just the sample.

        **JSON STRUCTURE REQUIREMENTS:**
        1. livabilityScore (number)
        2. estimatedRepairCosts { low: number, high: number }
        3. impactScore (number)
        4. summary (string - concise overview reflecting the scores)
        5. recommendations (string[] - actionable advice based on findings)
        6. issueCategories (array of { category: string, count: number, severity: number (1-5, 5=highest), examples: array of { Type: string, "Complaint Status": string, "Received Date": string, "Status Description"?: string, location: string } }) - **Include the 'location' for each example.**
        7. monthlyTrends (array of { month: string, count: number })
        8. severityBreakdown { high: number, medium: number, low: number } (as percentages)

        Base your analysis on the provided sample, inferring potential overall conditions for the whole building.
        IMPORTANT: Return **only** the raw JSON object without any markdown formatting, code blocks, or explanatory text.
      `;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log('=== RAW RESPONSE FROM DEEPSEEK ===');
        console.log(data.choices[0].message.content);
        
        try {
          let content = data.choices[0].message.content;
          
          // Remove markdown code blocks if present
          content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          // Try to find JSON object in the content
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            content = jsonMatch[0];
          }
          
          console.log('Attempting to parse JSON:', content);
          
          const analysisResult = JSON.parse(content);
          setAnalysis(analysisResult);
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          console.error('Raw content:', data.choices[0].message.content);
          setError('Failed to parse analysis results');
        }
      }
    } catch (err) {
      console.error('Error analyzing issues:', err);
      setError('Failed to analyze building issues');
      setAnalysis(null);
      throw err; // Re-throw error so fetchBuildingData's catch block can handle the step
    }
  };

  useEffect(() => {
    fetchBuildingData();
  }, [address, borough]);

  const getSeverityColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    let loadingText = 'Loading...';
    let progressValue = 10; // Start with a small initial value

    if (loadingStep === 'fetching') {
        loadingText = 'Fetching building data from database...';
        progressValue = 25;
    } else if (loadingStep === 'analyzing') {
        loadingText = 'Analyzing issues with AI... (this may take a moment)';
        progressValue = 75;
    }
    return (
      // Use flex column layout to push footer down
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <Header />
        {/* Content area that grows */}
        <div className="container mx-auto px-4 py-12 text-center flex-grow flex flex-col justify-center items-center">
          {/* Replace spinner with Progress component */}
          <div className="w-full max-w-md mb-4">
            <Progress value={progressValue} className="h-2 bg-neutral-800" />
          </div>
          <p className="text-neutral-400">{loadingText}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    // Use flex column layout to push footer down
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Header />
      {/* Make content area grow */}
      <div className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Building Analysis Report
        </h1>
        
        <div className="text-xl mb-8 text-neutral-400">
          {address}, {borough}
        </div>

        {error ? (
          <Card className="bg-red-900/20 border-red-900">
            <CardContent className="p-6">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Scores Section */}
            <div className="lg:col-span-1 space-y-6">
              {analysis && (
                <>
                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold text-white">Livability Score</h2>
                      </div>
                      <Progress value={analysis.livabilityScore} className="h-2" />
                      <p className={`text-2xl font-bold ${getSeverityColor(analysis.livabilityScore)}`}>
                        {analysis.livabilityScore}/100
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold text-white">Estimated Repair Costs</h2>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        ${analysis.estimatedRepairCosts.low.toLocaleString()} - ${analysis.estimatedRepairCosts.high.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold text-white">Impact on Daily Life</h2>
                      </div>
                      <Progress value={analysis.impactScore} className="h-2" />
                      <p className={`text-2xl font-bold ${getSeverityColor(analysis.impactScore)}`}>
                        {analysis.impactScore}/100
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold text-white">Severity Breakdown</h2>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-red-400">High Severity</span>
                          <span className="text-white">{analysis.severityBreakdown.high}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400">Medium Severity</span>
                          <span className="text-white">{analysis.severityBreakdown.medium}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-400">Low Severity</span>
                          <span className="text-white">{analysis.severityBreakdown.low}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Issues and Categories Section */}
            <div className="lg:col-span-2 space-y-6">
              {analysis && (
                <>
                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-lg font-semibold text-white">Summary</h2>
                      <p className="text-neutral-400">{analysis.summary}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-lg font-semibold text-white">Issue Categories</h2>
                      <div className="space-y-4">
                        {analysis.issueCategories.map((category, index) => (
                          <div key={index} className="border border-neutral-800 rounded-lg">
                            <button
                              className="w-full p-4 flex items-center justify-between text-left"
                              onClick={() => setExpandedCategory(
                                expandedCategory === category.category ? null : category.category
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{category.category}</span>
                                <span className="text-sm text-neutral-400">({category.count} issues)</span>
                              </div>
                              {expandedCategory === category.category ? (
                                <ChevronUp className="h-5 w-5 text-neutral-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-neutral-400" />
                              )}
                            </button>
                            {expandedCategory === category.category && (
                              <div className="p-4 border-t border-neutral-800 space-y-3">
                                {category.examples.map((issue, i) => (
                                  <div key={i} className="p-3 bg-neutral-800 rounded-lg">
                                    <div className="flex items-start gap-3"> {/* Increased gap slightly */}
                                      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                      <div className="flex-1"> {/* Allow text to wrap */}
                                        <p className="text-sm font-medium text-white">
                                          {issue.Type} 
                                          {/* Display Location */}
                                          <span className="ml-2 text-xs font-normal text-neutral-400 bg-neutral-700 px-1.5 py-0.5 rounded">
                                            📍 {issue.location || 'Unknown Location'} 
                                          </span>
                                        </p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                          Status: {issue["Complaint Status"]} | Reported: {formatDate(issue["Received Date"])}
                                        </p>
                                        {issue["Status Description"] && (
                                          <p className="text-xs text-neutral-400 mt-1">
                                            {issue["Status Description"]}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-neutral-900 border-neutral-800">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-emerald-500" />
                          <h2 className="text-lg font-semibold text-white">Monthly Trends</h2>
                        </div>
                        <div className="space-y-3">
                          {analysis.monthlyTrends.map((month, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-neutral-400">{month.month}</span>
                              <span className="text-white">{month.count} issues</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-neutral-900 border-neutral-800">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5 text-emerald-500" />
                          <h2 className="text-lg font-semibold text-white">Recommendations</h2>
                        </div>
                        <div className="space-y-3">
                          {analysis.recommendations.map((rec, index) => (
                            <div key={index} className="p-3 bg-neutral-800 rounded-lg">
                              <p className="text-sm text-white">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Results; 