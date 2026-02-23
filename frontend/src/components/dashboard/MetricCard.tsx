import React from 'react';
import {
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import '../../styles/metric-card.css';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: 'activity' | 'zap' | 'alert-circle' | 'check-circle';
  color: 'purple' | 'green' | 'red' | 'yellow';
  changeType?: 'default' | 'percent';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  changeType = 'default'
}) => {
  const iconMap = {
    'activity': Activity,
    'zap': Zap,
    'alert-circle': AlertCircle,
    'check-circle': CheckCircle
  };

  const IconComponent = iconMap[icon];
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`metric-card metric-${color}`}>
      {/* Top Section */}
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <div className={`metric-icon-circle icon-${color}`}>
          <IconComponent size={24} />
        </div>
      </div>

      {/* Value Section */}
      <div className="metric-value">{value}</div>

      {/* Change Section */}
      <div className="metric-change">
        <TrendIcon size={16} />
        <span className={`change-text ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{change}
          {changeType === 'percent' ? '%' : ''}
        </span>
        <span className="change-label">{changeLabel}</span>
      </div>
    </div>
  );
};

export default MetricCard;
