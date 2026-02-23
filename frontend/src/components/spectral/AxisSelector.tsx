import React from 'react';

export type Axis = 'horiz' | 'vert' | 'axial';

interface AxisSelectorProps {
  selectedAxis: Axis;
  onAxisChange: (axis: Axis) => void;
}

export const AxisSelector: React.FC<AxisSelectorProps> = ({ selectedAxis, onAxisChange }) => {
  const axes: { value: Axis; label: string }[] = [
    { value: 'horiz', label: 'Horizontal' },
    { value: 'vert', label: 'Vertical' },
    { value: 'axial', label: 'Axial' },
  ];

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
      {axes.map((axis) => (
        <button
          key={axis.value}
          onClick={() => onAxisChange(axis.value)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            selectedAxis === axis.value
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {axis.label}
        </button>
      ))}
    </div>
  );
};
