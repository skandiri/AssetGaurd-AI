import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { HelpCircle } from 'lucide-react';
import '../../styles/chart.css';

const AssetDistributionChart: React.FC = () => {
  const data = [
    { name: 'Healthy', value: 78, color: '#10B981' },
    { name: 'Warning', value: 15, color: '#F59E0B' },
    { name: 'Critical', value: 7, color: '#EF4444' }
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="chart-container asset-distribution-chart">
      <div className="chart-header">
        <h3 className="chart-title">Asset Distribution</h3>
      </div>

      <div className="donut-chart-wrapper">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center-label">
          <span className="donut-value">1.2k</span>
          <span className="donut-unit">Assets</span>
        </div>
      </div>

      <div className="chart-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item" data-legend-color={item.color}>
            <span className="legend-dot"></span>
            <span className="legend-label">
              {item.name}
              {item.name === 'Critical' && <HelpCircle size={12} />}
            </span>
            <span className="legend-percentage">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetDistributionChart;
