
import React, { useMemo } from 'react';
import { ArrowUp } from 'lucide-react';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend, 
  ChartData 
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface LiveabilityScoreProps {
  issues: any[];
}

const LiveabilityScore: React.FC<LiveabilityScoreProps> = ({ issues }) => {
  // Calculate livability score based on issues
  const { overallScore, categoryScores, radarData } = useMemo(() => {
    // Count issues by category
    const categoryCounts: Record<string, number> = {};
    issues.forEach(issue => {
      const category = issue["Major Category"] || "Other";
      if (!categoryCounts[category]) categoryCounts[category] = 0;
      categoryCounts[category]++;
    });
    
    // Define main categories to analyze
    const mainCategories = [
      "HEAT/HOT WATER", 
      "PLUMBING", 
      "ELECTRIC", 
      "GENERAL CONSTRUCTION", 
      "ELEVATOR",
      "PAINT/PLASTER",
      "SAFETY"
    ];
    
    // Calculate scores for each category (inverse relationship - more issues = lower score)
    const categoryScores: Record<string, number> = {};
    mainCategories.forEach(category => {
      const count = categoryCounts[category] || 0;
      // Scale: 0 issues = 10, 10+ issues = 0
      const score = Math.max(0, 10 - Math.min(count, 10));
      categoryScores[category] = score;
    });
    
    // Calculate overall score (average of category scores)
    const scores = Object.values(categoryScores);
    const overallScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 10) / 10
      : 0;
    
    // Create radar chart data
    const radarData: ChartData<'radar'> = {
      labels: Object.keys(categoryScores).map(cat => cat.split('/')[0]),
      datasets: [
        {
          label: 'Building Score',
          data: Object.values(categoryScores),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        }
      ]
    };
    
    return { overallScore, categoryScores, radarData };
  }, [issues]);

  // Helper to get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 lg:p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Building Livability Score</h3>
        <div className="text-3xl font-bold flex items-center justify-center gap-2">
          <span className={getScoreColor(overallScore)}>
            {overallScore.toFixed(1)}/10
          </span>
          <span className={
            `text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5
            ${overallScore >= 8 ? 'bg-green-100 text-green-700' : 
              overallScore >= 5 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'}`
          }>
            {overallScore >= 8 ? 'Excellent' : 
             overallScore >= 5 ? 'Average' : 'Poor'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-lg p-4 shadow-sm h-[240px]">
          <Radar 
            data={radarData} 
            options={{
              scales: {
                r: {
                  beginAtZero: true,
                  max: 10,
                  ticks: {
                    stepSize: 2
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              },
              elements: {
                line: {
                  borderWidth: 2
                }
              }
            }}
          />
        </div>
        
        {/* Score breakdown */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-medium mb-2 text-gray-600">Score Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(radarData.labels).map((entry, i) => {
              const [_, label] = entry;
              const score = radarData.datasets[0].data[i] as number;
              
              return (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{String(label)}</span>
                  <span className={`font-medium text-sm ${getScoreColor(score)}`}>
                    {score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-2 border-t text-xs text-gray-500">
            Based on {issues.length} reported issues
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveabilityScore;
