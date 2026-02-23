import { useEffect, useState, useRef } from 'react';
import { getDashboardData } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import MetricCard from '../components/dashboard/MetricCard';
import './Dashboard.css';

interface DashboardData {
  success: boolean;
  data: {
    totalAssets: number;
    activeDevices: number;
    systemHealth: number;
    recentAlerts: number;
    assets: Array<{
      id: string;
      name: string;
      status: string;
      health: number;
    }>;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      getDashboardData(token)
        .then((response) => setData(response.data ? { success: true, data: response.data } : response))
        .catch((err) => setError(err.message || 'Failed to load dashboard data'))
        .finally(() => setLoading(false));
    } else {
      setError('No token found. Please log in.');
      setLoading(false);
    }
  }, [token]);

  if (!token) {
    return <div className="p-8 text-red-600">No token found. Please log in.</div>;
  }

  if (loading) {
    return <div className="p-8 text-gray-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!data?.data) {
    return <div className="p-8 text-gray-600">No data available</div>;
  }

  const dashboardData = data.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Executive Overview</h1>
            <p>Real-time asset monitoring and performance metrics</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="dashboard-metrics">
          <MetricCard
            title="Total Assets"
            value={dashboardData.totalAssets.toString()}
            change={12}
            changeLabel="vs last week"
            icon="activity"
            color="purple"
          />
          <MetricCard
            title="System Health"
            value={`${dashboardData.systemHealth}%`}
            change={0.5}
            changeLabel="vs last week"
            icon="zap"
            color="green"
          />
          <MetricCard
            title="Active Alerts"
            value={dashboardData.recentAlerts.toString()}
            change={-5}
            changeLabel="vs last week"
            icon="alert-circle"
            color="red"
          />
          <MetricCard
            title="Devices Online"
            value={dashboardData.activeDevices.toString()}
            change={98}
            changeLabel="vs last week"
            icon="check-circle"
            color="green"
          />
        </div>

        {/* Assets List */}
        <div className="dashboard-assets">
          <h2>Asset Status</h2>
          <div className="asset-list">
            {dashboardData.assets.map((asset) => (
              <AssetRow key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Asset Row Component with ref for dynamic width
interface AssetRowProps {
  asset: {
    id: string;
    name: string;
    status: string;
    health: number;
  };
}

function AssetRow({ asset }: AssetRowProps) {
  const healthBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (healthBarRef.current) {
      healthBarRef.current.style.width = `${asset.health}%`;
    }
  }, [asset.health]);

  const getHealthBarClass = () => {
    if (asset.health >= 90) return 'health-bar healthy';
    if (asset.health >= 70) return 'health-bar warning';
    return 'health-bar critical';
  };

  return (
    <div className="asset-item">
      <div className="asset-info">
        <h3 className="asset-name">{asset.name}</h3>
        <span className={`asset-status ${asset.status}`}>
          {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
        </span>
      </div>
      <div className="asset-stats">
        <div className="asset-health-value">{asset.health}%</div>
        <div className="health-bar-container">
          <div ref={healthBarRef} className={getHealthBarClass()}></div>
        </div>
      </div>
    </div>
  );
}