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

interface BuildingIssue {
  "Complaint Type": string;
  "Complaint Category": string;
  Status: string;
  "Created Date": string;
  Description?: string;
}

interface IssueCategory {
  category: string;
  count: number;
  severity: number;
  examples: BuildingIssue[];
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

  const address = searchParams.get('address');
  const borough = searchParams.get('borough');

  const categorizeIssues = (issues: BuildingIssue[]): Record<string, number> => {
    return issues.reduce((acc, issue) => {
      const category = issue["Complaint Category"] || issue["Complaint Type"];
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const fetchBuildingData = async () => {
    if (!address || !borough) {
      setError('Missing address information');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching data for:', { address, borough });
      
      const [houseNumber, ...streetParts] = address.split(' ');
      const streetName = streetParts.join(' ');

      console.log('Parsed address:', { houseNumber, streetName });

      const { data, error: dbError } = await supabase
        .from('nyc_housing_data')
        .select(`
          "Complaint Type",
          "Complaint Category",
          "Status",
          "Created Date",
          "Description"
        `)
        .eq('House Number', houseNumber)
        .ilike('Street Name', streetName)
        .eq('Borough', borough)
        .limit(500);

      if (dbError) {
        console.error('Supabase query error:', dbError);
        throw dbError;
      }

      if (!data || data.length === 0) {
        setError('No records found for this address');
        setLoading(false);
        return;
      }

      console.log('Found building data:', data);
      setIssues(data);
      await analyzeIssues(data);
    } catch (err) {
      console.error('Error fetching building data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch building data');
    } finally {
      setLoading(false);
    }
  };

  const analyzeIssues = async (buildingIssues: BuildingIssue[]) => {
    try {
      const categories = categorizeIssues(buildingIssues);
      
      const prompt = `
        Analyze these building issues and provide a detailed analysis in JSON format:
        
        Building Address: ${address}, ${borough}
        Total Issues: ${buildingIssues.length}
        Issue Categories: ${JSON.stringify(categories)}
        Recent Issues (last 5):
        ${JSON.stringify(buildingIssues.slice(0, 5), null, 2)}

        Please provide:
        1. Livability Score (0-100) based on issue severity
        2. Estimated repair costs range (low and high estimates)
        3. Impact score on daily life (0-100)
        4. Brief summary of major concerns
        5. Specific recommendations for potential tenants
        6. Analysis of issue categories with severity ratings
        7. Monthly trends in issues
        8. Severity breakdown (percentage of high/medium/low severity issues)

        Consider factors like:
        - Health impacts (mold, pests, etc.)
        - Safety concerns (structural issues, fire safety)
        - Quality of life impacts (noise, heating/cooling)
        - Maintenance responsiveness
        - Recurring issues

        Format your response as a JSON object matching the TypeScript interface AnalysisResult.
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
        try {
          const analysisResult = JSON.parse(data.choices[0].message.content);
          setAnalysis(analysisResult);
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          setError('Failed to parse analysis results');
        }
      }
    } catch (err) {
      console.error('Error analyzing issues:', err);
      setError('Failed to analyze building issues');
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
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      <div className="container mx-auto px-4 py-12">
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
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium text-white">
                                          {issue["Complaint Type"]}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                          Status: {issue.Status}
                                        </p>
                                        {issue.Description && (
                                          <p className="text-xs text-neutral-400 mt-1">
                                            {issue.Description}
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