import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AnalyticsTracker from '../../utils/analyticsTracker';

/**
 * Platform Distribution Pie Chart Component
 * Shows breakdown of shares across different platforms
 */
export function PlatformPieChart() {
  const data = useMemo(() => {
    return AnalyticsTracker.getPlatformBreakdown();
  }, []);

  const COLORS = {
    twitter: '#1DA1F2',
    facebook: '#1877F2',
    whatsapp: '#25D366',
    telegram: '#0088cc',
    reddit: '#FF4500',
    linkedin: '#0A66C2',
    email: '#EA4335',
    clipboard: '#4285F4'
  };

  const chartData = data.map(item => ({
    name: item.platform,
    value: parseInt(item.count)
  }));

  return (
    <div className="w-full h-80 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Shares by Platform</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} shares`} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No sharing data yet
        </div>
      )}
    </div>
  );
}

/**
 * Generation Trend Bar Chart Component
 * Shows memes generated per day over the last 7 days
 */
export function GenerationTrendChart() {
  const data = useMemo(() => {
    return AnalyticsTracker.getGenerationTimeline(7);
  }, []);

  return (
    <div className="w-full h-80 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Generation Trend (7 Days)</h3>
      {data.some(d => d.count > 0) ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" name="Memes Generated" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No generation data yet
        </div>
      )}
    </div>
  );
}

/**
 * Daily Activity Line Chart Component
 * Shows generated vs shared memes over time
 */
export function DailyActivityChart({ days = 30 }) {
  const data = useMemo(() => {
    return AnalyticsTracker.getDailyStats(days);
  }, [days]);

  return (
    <div className="w-full h-80 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview ({days} Days)</h3>
      {data.some(d => d.generated > 0 || d.shared > 0) ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="generated"
              stroke="#10B981"
              strokeWidth={2}
              name="Generated"
              dot={{ fill: '#10B981', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="shared"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Shared"
              dot={{ fill: '#F59E0B', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No activity data yet
        </div>
      )}
    </div>
  );
}

/**
 * Top Templates Bar Chart Component
 * Shows most frequently used templates
 */
export function TopTemplatesChart() {
  const data = useMemo(() => {
    return AnalyticsTracker.getTopTemplates(5);
  }, []);

  return (
    <div className="w-full h-80 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Templates</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="template" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="count" fill="#8B5CF6" name="Usage Count" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No template data yet
        </div>
      )}
    </div>
  );
}

/**
 * Quality Distribution Pie Chart Component
 * Shows distribution across compression quality levels
 */
export function QualityDistributionChart() {
  const data = useMemo(() => {
    const dist = AnalyticsTracker.getQualityDistribution();
    return [
      { name: 'High Quality', value: dist.high, fill: '#10B981' },
      { name: 'Medium Quality', value: dist.medium, fill: '#3B82F6' },
      { name: 'Low Quality', value: dist.low, fill: '#EF4444' }
    ].filter(d => d.value > 0);
  }, []);

  return (
    <div className="w-full h-80 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Distribution</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} memes`} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No quality data yet
        </div>
      )}
    </div>
  );
}

export default {
  PlatformPieChart,
  GenerationTrendChart,
  DailyActivityChart,
  TopTemplatesChart,
  QualityDistributionChart
};
