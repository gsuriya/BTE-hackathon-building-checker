
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface IssuesListProps {
  issues: any[];
}

const IssuesList: React.FC<IssuesListProps> = ({ issues }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get unique categories for filter
  const categories = Array.from(new Set(issues.map(issue => issue["Major Category"] || "Other"))).sort();

  // Filter issues based on search and category
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchTerm === '' || 
      Object.values(issue).some(value => 
        value && typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCategory = categoryFilter === 'all' || 
      issue["Major Category"] === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Function to determine badge color based on status
  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes('closed') || lowercaseStatus.includes('resolved')) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
    } else if (lowercaseStatus.includes('open') || lowercaseStatus.includes('active')) {
      return <Badge variant="destructive">Open</Badge>;
    } else if (lowercaseStatus.includes('pending')) {
      return <Badge variant="secondary">Pending</Badge>;
    }
    
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search issues..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          value={categoryFilter} 
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredIssues.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    {issue["Received Date"] || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{issue["Major Category"] || "Unknown"}</div>
                      <div className="text-sm text-gray-500">{issue["Minor Category"] || ""}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{issue["Status Description"] || issue["Type"] || "No details available"}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(issue["Complaint Status"])}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-12 text-center border rounded-md">
          <p className="text-gray-500">No issues found matching your filters.</p>
        </div>
      )}
      
      <div className="text-xs text-gray-500 italic">
        Displaying {filteredIssues.length} of {issues.length} total issues
      </div>
    </div>
  );
};

export default IssuesList;
