import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import {
  PlatformPieChart,
  GenerationTrendChart,
  DailyActivityChart,
  TopTemplatesChart,
  QualityDistributionChart
} from './ChartComponents';
import AnalyticsTracker from '../utils/analyticsTracker';

function Analytics() {
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const loadStats = () => {
    setStats(AnalyticsTracker.getSummaryStats());
  };

  const handleExportJSON = () => {
    const jsonData = AnalyticsTracker.exportJSON();
    downloadFile(jsonData, 'meme_analytics.json', 'application/json');
  };

  const handleExportCSV = () => {
    const csvData = AnalyticsTracker.exportCSV();
    downloadFile(csvData, 'meme_analytics.csv', 'text/csv');
  };

  const downloadFile = (content, filename, type) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      AnalyticsTracker.clearAllData();
      setRefreshKey(prev => prev + 1);
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your meme generation and sharing activity</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <FiRefreshCw /> Refresh
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <FiDownload /> JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              <FiDownload /> CSV
            </button>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <FiTrash2 /> Clear
            </button>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Memes Generated"
            value={stats.totalGenerated}
            icon="🎨"
            color="blue"
          />
          <StatCard
            label="Total Shares"
            value={stats.totalShares}
            icon="📤"
            color="green"
          />
          <StatCard
            label="Top Platform"
            value={stats.topPlatform ? stats.topPlatform.charAt(0).toUpperCase() + stats.topPlatform.slice(1) : 'N/A'}
            subValue={stats.topPlatformCount ? `${stats.topPlatformCount} shares` : ''}
            icon="🚀"
            color="purple"
          />
          <StatCard
            label="Popular Topics"
            value={stats.popularTopics.length}
            subValue={`${stats.popularTopics.length > 0 ? stats.popularTopics[0].topic : 'None'}`}
            icon="🔥"
            color="orange"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          {['overview', 'trends', 'platforms', 'quality'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlatformPieChart />
            <QualityDistributionChart />
            <GenerationTrendChart />
            <TopTemplatesChart />
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <DailyActivityChart days={30} />
            <GenerationTrendChart />
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div>
            <PlatformBreakdownTable />
          </div>
        )}

        {/* Quality Tab */}
        {activeTab === 'quality' && (
          <div>
            <QualityDistributionChart />
            <QualityStatsTable />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, subValue, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700'
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-lg p-6`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {subValue && <p className="text-sm text-gray-600 mt-1">{subValue}</p>}
    </div>
  );
}

/**
 * Platform Breakdown Table Component
 */
function PlatformBreakdownTable() {
  const data = AnalyticsTracker.getPlatformBreakdown();

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        No sharing data available yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Platform</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Shares</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Percentage</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Progress</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-medium text-gray-800">{item.platform}</td>
              <td className="px-6 py-4 text-gray-700">{item.count}</td>
              <td className="px-6 py-4 text-gray-700">{item.percentage}%</td>
              <td className="px-6 py-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Quality Statistics Table Component
 */
function QualityStatsTable() {
  const dist = AnalyticsTracker.getQualityDistribution();
  const total = dist.high + dist.medium + dist.low || 1;

  const qualityData = [
    { name: 'High Quality', count: dist.high, percentage: ((dist.high / total) * 100).toFixed(1), color: 'green' },
    { name: 'Medium Quality', count: dist.medium, percentage: ((dist.medium / total) * 100).toFixed(1), color: 'blue' },
    { name: 'Low Quality', count: dist.low, percentage: ((dist.low / total) * 100).toFixed(1), color: 'red' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
      <table className="w-full">
        <thead className="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Quality Level</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Count</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {qualityData.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-700">{item.count}</td>
              <td className="px-6 py-4 text-gray-700">{item.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Analytics;
