import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import '../../styles/chart.css';

const AssetStatusChart: React.FC = () => {
  const data = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 52 },
    { day: 'Wed', value: 49 },
    { day: 'Thu', value: 63 },
    { day: 'Fri', value: 58 },
    { day: 'Sat', value: 55 },
    { day: 'Sun', value: 39 }
  ];

  return (
    <div className="chart-container asset-status-chart">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Asset Status Trend</h3>
          <p className="chart-subtitle">Weekly performance and health tracking</p>
        </div>
        <select className="chart-dropdown" aria-label="Select time range">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5B4FDB" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#5B4FDB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="day"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            domain={[0, 80]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#5B4FDB"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetStatusChart;
