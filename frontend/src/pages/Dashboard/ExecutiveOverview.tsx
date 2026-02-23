import React from 'react';
import MetricCard from '../../components/dashboard/MetricCard';
import AssetStatusChart from '../../components/dashboard/AssetStatusChart';
import AssetDistributionChart from '../../components/dashboard/AssetDistributionChart';
import '../../styles/executive-overview.css';

const ExecutiveOverview: React.FC = () => {
  const metrics = [
    {
      title: "Total Assets",
      value: "1,284",
      change: 12,
      changeLabel: "vs last week",
      icon: "activity" as const,
      color: "purple" as const
    },
    {
      title: "System Health",
      value: "94.2%",
      change: 0.5,
      changeLabel: "vs last week",
      icon: "zap" as const,
      color: "green" as const
    },
    {
      title: "Active Alerts",
      value: "23",
      change: -5,
      changeLabel: "vs last week",
      icon: "alert-circle" as const,
      color: "red" as const
    },
    {
      title: "Devices Online",
      value: "892",
      change: 98,
      changeLabel: "vs last week",
      icon: "check-circle" as const,
      color: "yellow" as const,
      changeType: "percent" as const
    }
  ];

  return (
    <div className="executive-overview">
      {/* Metric Cards Row */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <AssetStatusChart />
        <AssetDistributionChart />
      </div>
    </div>
  );
};

export default ExecutiveOverview;
