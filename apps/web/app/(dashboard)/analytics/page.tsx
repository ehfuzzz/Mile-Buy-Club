'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download } from 'lucide-react';

const analyticsData = {
  dealsViewed: [
    { month: 'Jan', flights: 245, hotels: 180, activities: 120 },
    { month: 'Feb', flights: 320, hotels: 210, activities: 140 },
    { month: 'Mar', flights: 280, hotels: 190, activities: 130 },
    { month: 'Apr', flights: 400, hotels: 280, activities: 180 },
    { month: 'May', flights: 350, hotels: 240, activities: 160 },
    { month: 'Jun', flights: 480, hotels: 320, activities: 220 },
  ],
  dealsBooked: [
    { name: 'Flights', value: 65, color: '#3b82f6' },
    { name: 'Hotels', value: 25, color: '#8b5cf6' },
    { name: 'Activities', value: 10, color: '#ec4899' },
  ],
  avgValue: [
    { program: 'Marriott', value: 1.8 },
    { program: 'Chase', value: 2.1 },
    { program: 'Amex', value: 1.9 },
    { program: 'United', value: 2.0 },
    { program: 'Delta', value: 1.7 },
  ],
};

const stats = [
  { label: 'Total Deals Viewed', value: '2,847', trend: '+12.5%' },
  { label: 'Deals Booked', value: '156', trend: '+8.2%' },
  { label: 'Total Savings', value: '$24,580', trend: '+18.3%' },
  { label: 'Avg Deal Value', value: '1.89x', trend: '+5.1%' },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('6months');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your travel deals and savings</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 flex gap-2">
          {[
            { id: '1month', label: '1 Month' },
            { id: '3months', label: '3 Months' },
            { id: '6months', label: '6 Months' },
            { id: '1year', label: '1 Year' },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-green-600 font-medium mt-2">{stat.trend}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Deals Viewed Over Time */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deals Viewed</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.dealsViewed}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="flights" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="hotels" stroke="#8b5cf6" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="activities"
                  stroke="#ec4899"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Deals Booked Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deals Booked</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.dealsBooked}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.dealsBooked.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Value by Program */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Deal Value by Program</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.avgValue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="program" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Programs Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Programs This Month</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Program</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Deals Found</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Booked</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Avg Value</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Savings</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { program: 'Marriott Bonvoy', found: 245, booked: 18, value: '1.8x', savings: '$3,240' },
                  { program: 'United MileagePlus', found: 312, booked: 28, value: '2.0x', savings: '$5,120' },
                  { program: 'Chase UR', found: 198, booked: 15, value: '2.1x', savings: '$3,680' },
                  { program: 'Amex Membership', found: 156, booked: 12, value: '1.9x', savings: '$2,850' },
                  { program: 'Hilton Honors', found: 134, booked: 9, value: '1.7x', savings: '$1,820' },
                ].map((row) => (
                  <tr key={row.program} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{row.program}</td>
                    <td className="text-right py-3 px-4 text-gray-900">{row.found}</td>
                    <td className="text-right py-3 px-4 text-gray-900 font-semibold text-green-600">
                      {row.booked}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900">{row.value}</td>
                    <td className="text-right py-3 px-4 text-gray-900 font-semibold text-blue-600">
                      {row.savings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
