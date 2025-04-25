
import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IssuesCostEstimateProps {
  issues: any[];
}

const IssuesCostEstimate: React.FC<IssuesCostEstimateProps> = ({ issues }) => {
  // Define cost ranges for common issues (in USD)
  const costEstimates = {
    "HEAT/HOT WATER": {min: 500, max: 5000},
    "PLUMBING": {min: 150, max: 3000},
    "ELECTRIC": {min: 200, max: 2500},
    "PAINT/PLASTER": {min: 400, max: 2000},
    "GENERAL CONSTRUCTION": {min: 500, max: 10000},
    "DOOR/WINDOW": {min: 200, max: 1500},
    "ELEVATOR": {min: 1000, max: 15000},
    "OUTSIDE BUILDING": {min: 400, max: 8000},
    "SAFETY": {min: 300, max: 3000},
    "DEFAULT": {min: 200, max: 1000}
  };

  // Calculate cost estimates
  const { totalMin, totalMax, categoryCosts, chartData } = useMemo(() => {
    // Count issues by category
    const categoryCounts: Record<string, number> = {};
    
    issues.forEach(issue => {
      const category = issue["Major Category"] || "OTHER";
      if (!categoryCounts[category]) categoryCounts[category] = 0;
      categoryCounts[category]++;
    });

    // Calculate costs by category
    const categoryCosts: Record<string, {min: number, max: number, count: number}> = {};
    let totalMin = 0;
    let totalMax = 0;

    Object.entries(categoryCounts).forEach(([category, count]) => {
      const { min, max } = costEstimates[category as keyof typeof costEstimates] || costEstimates.DEFAULT;
      
      // Assume diminishing returns - each additional issue of same type costs less
      const calculatedMin = Math.round(min * Math.sqrt(count));
      const calculatedMax = Math.round(max * Math.sqrt(count));
      
      categoryCosts[category] = {
        min: calculatedMin,
        max: calculatedMax,
        count
      };
      
      totalMin += calculatedMin;
      totalMax += calculatedMax;
    });

    // Prepare chart data
    const sortedCategories = Object.entries(categoryCosts)
      .sort((a, b) => b[1].max - a[1].max)
      .slice(0, 6); // Show top 6 categories
    
    const chartData = {
      labels: sortedCategories.map(([category]) => category.split('/')[0]),
      datasets: [
        {
          label: 'Min Cost ($)',
          data: sortedCategories.map(([_, data]) => data.min),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Max Cost ($)',
          data: sortedCategories.map(([_, data]) => data.max),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    };
    
    return { totalMin, totalMax, categoryCosts, chartData };
  }, [issues]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cost ($)'
        }
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Estimated Repair Costs</p>
              <div className="text-3xl font-bold">
                {formatCurrency(totalMin)} - {formatCurrency(totalMax)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {issues.length} reported issues
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Most Expensive Category</p>
              <div className="text-xl font-bold">
                {Object.entries(categoryCosts).length > 0 ? 
                  Object.entries(categoryCosts)
                    .sort((a, b) => b[1].max - a[1].max)[0][0] :
                  "N/A"}
              </div>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {Object.entries(categoryCosts).length > 0 ? 
                  formatCurrency(Object.entries(categoryCosts)
                    .sort((a, b) => b[1].max - a[1].max)[0][1].max) :
                  "N/A"}
                <span className="text-xs text-gray-500"> (max estimate)</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white border rounded-lg p-4 h-[300px]">
        <Bar options={chartOptions} data={chartData} />
      </div>
      
      <div className="text-sm text-gray-500">
        <p className="italic">
          Note: These estimates are based on typical NYC repair costs and may vary. Consult with a professional for accurate quotes.
        </p>
      </div>
    </div>
  );
};

export default IssuesCostEstimate;
