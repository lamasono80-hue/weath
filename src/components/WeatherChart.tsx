import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HourlyForecast, ThemeMode } from '../types';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Wind, Droplets } from 'lucide-react';

interface WeatherChartProps {
  hourlyData: HourlyForecast[];
  theme: ThemeMode;
  onHoverHour?: (hour: HourlyForecast | null) => void;
  tempUnit?: 'C' | 'F';
}

export default function WeatherChart({ hourlyData, theme, onHoverHour, tempUnit = 'C' }: WeatherChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const formatTemp = (tempC: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    }
    return `${tempC}°C`;
  };

  // SVG dimensions
  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 40;

  // Compute temp bounds for scaled rendering
  const temps = hourlyData.map((d) => d.temp);
  const minTemp = Math.min(...temps) - 2;
  const maxTemp = Math.max(...temps) + 2;
  const tempRange = maxTemp - minTemp || 1;

  // Get coordinates for each data point
  const points = hourlyData.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (hourlyData.length - 1);
    // Invert Y since (0,0) is top-left
    const y = height - paddingY - ((d.temp - minTemp) / tempRange) * (height - 2 * paddingY);
    return { x, y, data: d };
  });

  // Create SVG path string for line chart (spline-like or direct line)
  // Let's create a beautiful bezier curve path or smooth polyline path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Control points for a smooth cubic bezier curve
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
  }

  // Create gradient fill path D (closing the path below)
  const fillD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  // Weather mini icon component
  const getWeatherIcon = (iconName: string, size: number = 16) => {
    switch (iconName) {
      case 'sunny':
        return <Sun size={size} className={theme === 'deep' ? 'text-[#FFFF00]' : 'text-amber-500'} />;
      case 'cloudy':
        return <Cloud size={size} className="text-blue-300" />;
      case 'rainy':
        return <CloudRain size={size} className="text-blue-400" />;
      case 'stormy':
        return <CloudLightning size={size} className="text-amber-400" />;
      case 'snowy':
        return <Snowflake size={size} className="text-teal-200" />;
      case 'windy':
        return <Wind size={size} className="text-slate-300" />;
      default:
        return <Sun size={size} />;
    }
  };

  const selectedPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div>
          <span className="text-sm font-medium tracking-wide uppercase opacity-75">
            Dữ liệu kết hợp thời gian thực
          </span>
          <h3 className={`text-lg font-semibold tracking-tight ${theme === 'deep' ? 'text-[#FFFF00]' : 'text-pink-600'}`}>
            Biến Thiên Nhiệt Độ & Lượng Mưa (24h)
          </h3>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-[#FFFF00] to-emerald-400 inline-block"></span>
            <span>Nhiệt độ (Biên độ đường)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/30 inline-block"></span>
            <span>Xác suất mưa (Biểu đồ cột)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 select-none">
        {/* SVG Container */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => {
            setHoveredIdx(null);
            if (onHoverHour) onHoverHour(null);
          }}
        >
          <defs>
            {/* Gradient definition for the main temperature line & area */}
            <linearGradient id="tempGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFF00" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>

            <linearGradient id="tempGradientVertical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFF00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradient for bar columns */}
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
            </linearGradient>

            <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFF00" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Dotted horizontal grids */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIdx) => {
            const gridY = paddingY + ratio * (height - 2 * paddingY);
            return (
              <line
                key={gridIdx}
                x1={paddingX}
                y1={gridY}
                x2={width - paddingX}
                y2={gridY}
                stroke={theme === 'deep' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* BACKGROUND BAR CHART: Rain Probability columns */}
          {points.map((pt, idx) => {
            const colWidth = 22;
            const barHeight = ((pt.data.rainProb) / 100) * (height - 2 * paddingY);
            const x = pt.x - colWidth / 2;
            const y = height - paddingY - barHeight;

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={colWidth}
                  height={barHeight}
                  rx={4}
                  fill="url(#barGradient)"
                  stroke={theme === 'deep' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.3)'}
                  strokeWidth={0.5}
                />
                
                {/* Print Rain Probability above/in bar */}
                {pt.data.rainProb > 10 && (
                  <text
                    x={pt.x}
                    y={Math.min(y - 5, height - paddingY - 10)}
                    textAnchor="middle"
                    className="text-[9px] font-semibold opacity-60"
                    fill={theme === 'deep' ? '#4ade80' : '#15803d'}
                  >
                    {pt.data.rainProb}%
                  </text>
                )}
              </g>
            );
          })}

          {/* FOREGROUND LINE CHART: Filled gradient background area */}
          <motion.path
            d={fillD}
            fill="url(#tempGradientVertical)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Glowing Neon Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#tempGradient)"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          {/* Grid interactive tracking line on hover */}
          {selectedPoint && (
            <line
              x1={selectedPoint.x}
              y1={paddingY}
              x2={selectedPoint.x}
              y2={height - paddingY}
              stroke={theme === 'deep' ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.15)'}
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}

          {/* NODES and LABELS on chart */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredIdx(idx);
                  if (onHoverHour) onHoverHour(pt.data);
                }}
              >
                {/* Bigger invisible touch target circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={22}
                  fill="transparent"
                />

                {/* Outer shadow node halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 10 : 5}
                  fill={theme === 'deep' ? 'rgba(255, 255, 0, 0.2)' : 'rgba(34, 197, 94, 0.15)'}
                  className="transition-all duration-200"
                />

                {/* Inner beautiful node dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#FFFF00' : '#4ade80'}
                  stroke={theme === 'deep' ? '#0f172a' : '#ffffff'}
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />

                {/* Temperature label text */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-bold ${isHovered ? 'opacity-100 scale-105' : 'opacity-85'}`}
                  fill={isHovered ? '#FFFF00' : theme === 'deep' ? '#ffffff' : '#1e293b'}
                >
                  {formatTemp(pt.data.temp)}
                </text>

                {/* Hour timeline label */}
                <text
                  x={pt.x}
                  y={height - 20}
                  textAnchor="middle"
                  className={`text-[10px] font-normal tracking-wide ${
                    isHovered ? 'font-medium opacity-100' : 'opacity-60'
                  }`}
                  fill={theme === 'deep' ? '#ffffff' : '#000000'}
                >
                  {pt.data.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic HTML Tooltip overlaid inside card on hover */}
        {selectedPoint && (
          <div
            className={`absolute top-4 pointer-events-none transform -translate-x-1/2 p-2 px-3 rounded-xl border text-[11px] flex items-center gap-3 backdrop-blur-md shadow-lg transition-all duration-150 ${
              theme === 'deep'
                ? 'bg-slate-900/90 border-white/10 text-white'
                : 'bg-white/95 border-pink-100 text-slate-800'
            }`}
            style={{
              left: `${(selectedPoint.x / width) * 100}%`,
            }}
          >
            <div className="flex items-center gap-1">
              {getWeatherIcon(selectedPoint.data.icon, 14)}
              <span className="font-semibold text-xs text-[#FFFF00]">{selectedPoint.data.time}</span>
            </div>
            <div className="h-3 w-[1px] bg-white/20"></div>
            <div>
              <span className="opacity-70 mr-1">T độ:</span>
              <strong className="text-emerald-400">{formatTemp(selectedPoint.data.temp)}</strong>
            </div>
            <div className="h-3 w-[1px] bg-white/20"></div>
            <div className="flex items-center gap-0.5">
              <Droplets size={11} className="text-blue-400" />
              <span>{selectedPoint.data.humidity}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Hourly Quick Tip bar */}
      <div className={`mt-3 text-xs flex items-center justify-between px-2 opacity-80 ${theme === 'deep' ? 'text-slate-300' : 'text-slate-600'}`}>
        <span>💡 Nhấp hoặc chuyển con trỏ qua các khung mốc giờ để xem độ ẩm & mưa tăng dần.</span>
        {selectedPoint && (
          <span className="font-medium flex items-center gap-1">
            Mốc <span className="text-emerald-400 font-bold">{selectedPoint.data.time}</span> dự kiến có độ ẩm là {selectedPoint.data.humidity}%
          </span>
        )}
      </div>
    </div>
  );
}
