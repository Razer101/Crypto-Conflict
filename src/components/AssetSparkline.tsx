import React from 'react';

interface AssetSparklineProps {
  data: number[];
  color?: string;
  isPositive: boolean;
  height?: number;
}

export const AssetSparkline: React.FC<AssetSparklineProps> = ({
  data,
  isPositive,
  height = 48,
}) => {
  if (!data || data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-slate-600 font-mono">
        NO SPARKLINE DATA
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 200;
  const paddingY = 4;
  const innerHeight = height - paddingY * 2;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - paddingY - ((val - min) / range) * innerHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)';
  const firstPoint = `0,${height}`;
  const lastPoint = `${width},${height}`;
  const areaPoints = `${firstPoint} ${points} ${lastPoint}`;

  return (
    <div className="w-full relative overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <polygon points={areaPoints} fill={fillColor} />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
        <span>5D LOW: ${min.toLocaleString()}</span>
        <span>5D HIGH: ${max.toLocaleString()}</span>
      </div>
    </div>
  );
};
