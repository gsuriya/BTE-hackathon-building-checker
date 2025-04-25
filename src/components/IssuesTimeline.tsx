
import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface IssuesTimelineProps {
  issues: any[];
}

const IssuesTimeline: React.FC<IssuesTimelineProps> = ({ issues }) => {
  // Sort issues by date (most recent first)
  const sortedIssues = useMemo(() => {
    return [...issues]
      .filter(issue => issue["Received Date"])
      .sort((a, b) => {
        const dateA = new Date(a["Received Date"]);
        const dateB = new Date(b["Received Date"]);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 15); // Show only the 15 most recent issues
  }, [issues]);

  // Group issues by year and month
  const issuesByMonth = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    sortedIssues.forEach(issue => {
      const date = new Date(issue["Received Date"]);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(issue);
    });
    
    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0])) // Sort by date descending
      .map(([key, issues]) => {
        const [year, month] = key.split('-').map(Number);
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
        return {
          month: `${monthName} ${year}`,
          issues
        };
      });
  }, [sortedIssues]);

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    if (!status) return <Clock className="h-4 w-4 text-gray-400" />;
    
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes('closed') || lowercaseStatus.includes('resolved')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (issues.length === 0) {
    return (
      <div className="py-12 text-center border rounded-md">
        <p className="text-gray-500">No issue history available for this building.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Issue Timeline</h3>
        <p className="text-sm text-gray-500">
          History of reported issues for this building
        </p>
      </div>
      
      <div className="space-y-8">
        {issuesByMonth.map((group, groupIndex) => (
          <div key={groupIndex} className="relative">
            <div className="sticky top-0 z-10 bg-white py-2">
              <h4 className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-md inline-block">
                {group.month}
              </h4>
            </div>
            
            <div className="mt-3 space-y-3">
              {group.issues.map((issue, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(issue["Complaint Status"])}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div className="font-medium">{issue["Major Category"] || "Unknown Issue"}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(issue["Received Date"]).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue["Minor Category"] || "No details"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant={
                            issue["Complaint Status"]?.toLowerCase().includes('closed') 
                              ? "outline" 
                              : "destructive"
                          }>
                            {issue["Complaint Status"] || "Status Unknown"}
                          </Badge>
                          {issue["Status Description"] && (
                            <Badge variant="secondary" className="bg-gray-100">
                              {issue["Status Description"]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 italic text-center">
        Showing the {sortedIssues.length} most recent issues from {issues.length} total reports
      </p>
    </div>
  );
};

export default IssuesTimeline;
