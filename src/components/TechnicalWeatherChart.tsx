import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HourlyForecast, ThemeMode } from '../types';
import { Droplets, Gauge, Sun } from 'lucide-react';

interface TechnicalWeatherChartProps {
  hourlyData: HourlyForecast[];
  theme: ThemeMode;
  basePressure: number;
}

export default function TechnicalWeatherChart({ hourlyData, theme, basePressure }: TechnicalWeatherChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isIndoor, setIsIndoor] = useState<boolean>(false);

  // SVG dimensions
  const width = 600;
  const height = 220;
  const paddingX = 45;
  const paddingY = 40;

  // Enhance data with synthetic pressure if missing
  const pointsData = hourlyData.map((d, i) => {
    // Generate a believable pressure curve if not provided (simulate diurnal pressure variation)
    const timeHour = parseInt(d.time.split(':')[0], 10);
    // Pressure usually peaks at 10 AM and 10 PM, drops at 4 AM and 4 PM
    let simPressure = basePressure;
    if (timeHour >= 6 && timeHour <= 10) simPressure += (timeHour - 6);
    else if (timeHour > 10 && timeHour <= 16) simPressure += 4 - (timeHour - 10);
    else if (timeHour > 16 && timeHour <= 22) simPressure += -2 + (timeHour - 16) / 2;
    else simPressure -= 2;

    // Generate synthetic UV index
    let simUv = 0;
    if (!isIndoor) {
      if (timeHour >= 7 && timeHour <= 17) {
        // Bell curve peaking at 12:00
        simUv = Math.max(0, Math.round(10 - Math.pow(timeHour - 12, 2) * 0.4));
      }
    }

    return {
      ...d,
      humidity: isIndoor ? Math.max(30, Math.min(60, d.humidity - 10)) : d.humidity, // Indoors usually drier
      pressure: d.pressure || Math.round(simPressure),
      uvIndex: d.uvIndex !== undefined && !isIndoor ? d.uvIndex : simUv
    };
  });

  // Calculate scales
  const pressures = pointsData.map((d) => d.pressure);
  const minPress = Math.min(...pressures) - 2;
  const maxPress = Math.max(...pressures) + 2;
  const pressRange = maxPress - minPress || 1;

  const humids = pointsData.map((d) => d.humidity);
  const minHum = 0; // Humidity from 0 to 100
  const maxHum = 100;
  const humRange = maxHum - minHum;

  const minUv = 0;
  const maxUv = 12; // UV index max
  const uvRange = maxUv - minUv;

  const points = pointsData.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (pointsData.length - 1);
    const yPress = height - paddingY - ((d.pressure - minPress) / pressRange) * (height - 2 * paddingY);
    const yHum = height - paddingY - ((d.humidity - minHum) / humRange) * (height - 2 * paddingY);
    const yUv = height - paddingY - (((d.uvIndex || 0) - minUv) / uvRange) * (height - 2 * paddingY);
    return { x, yPress, yHum, yUv, data: d };
  });

  // Paths
  let pathDHum = '';
  let pathDPress = '';
  let pathDUv = '';

  if (points.length > 0) {
    pathDHum = `M ${points[0].x} ${points[0].yHum}`;
    pathDPress = `M ${points[0].x} ${points[0].yPress}`;
    pathDUv = `M ${points[0].x} ${points[0].yUv}`;

    for (let i = 1; i < points.length; i++) {
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      pathDHum += ` C ${cpX1} ${points[i - 1].yHum}, ${cpX1} ${points[i].yHum}, ${points[i].x} ${points[i].yHum}`;
      pathDPress += ` C ${cpX1} ${points[i - 1].yPress}, ${cpX1} ${points[i].yPress}, ${points[i].x} ${points[i].yPress}`;
      pathDUv += ` C ${cpX1} ${points[i - 1].yUv}, ${cpX1} ${points[i].yUv}, ${points[i].x} ${points[i].yUv}`;
    }
  }

  const fillDHum = points.length > 0
    ? `${pathDHum} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  const selectedPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="w-full mt-6">
      <div className="flex flex-wrap items-end justify-between mb-4 gap-4">
        <div>
          <span className="text-[13px] font-medium tracking-wide uppercase opacity-75">
            Dữ liệu kỹ thuật chuyên sâu
          </span>
          <h3 className={`text-lg font-semibold tracking-tight ${theme === 'deep' ? 'text-indigo-400' : 'text-indigo-600'} flex items-center gap-3`}>
            Độ Ẩm, Áp Suất & Tia UV
            <button
              onClick={() => setIsIndoor(!isIndoor)}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                isIndoor 
                ? 'bg-blue-500/20 border-blue-400/50 text-blue-400' 
                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
              }`}
              title="Chuyển đổi dữ liệu ngoài trời / trong phòng"
            >
              {isIndoor ? 'Trong phòng' : 'Ngoài trời'}
            </button>
          </h3>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-400 inline-block"></span>
            <span>Độ ẩm (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-400 inline-block rounded-full"></span>
            <span>Áp suất (hPa)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-purple-400 inline-block rounded-full"></span>
            <span>Tia UV</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="humLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="pressLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="uvLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>

          {/* Dotted horizontal grids */}
          {[0, 0.5, 1].map((ratio, gridIdx) => {
            const gridY = paddingY + ratio * (height - 2 * paddingY);
            return (
              <line
                key={gridIdx}
                x1={paddingX}
                y1={gridY}
                x2={width - paddingX}
                y2={gridY}
                stroke={theme === 'deep' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)'}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Left Y-axis labels (Humidity) */}
          <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" fontSize="10" fill={theme === 'deep' ? '#94a3b8' : '#64748b'}>100%</text>
          <text x={paddingX - 10} y={paddingY + (height - 2*paddingY)/2 + 4} textAnchor="end" fontSize="10" fill={theme === 'deep' ? '#94a3b8' : '#64748b'}>50%</text>
          <text x={paddingX - 10} y={height - paddingY + 4} textAnchor="end" fontSize="10" fill={theme === 'deep' ? '#94a3b8' : '#64748b'}>0%</text>

          {/* Right Y-axis labels (UV Index) */}
          <text x={width - paddingX + 10} y={paddingY + 4} textAnchor="start" fontSize="10" fill={theme === 'deep' ? '#c084fc' : '#9333ea'}>12 UV</text>
          <text x={width - paddingX + 10} y={paddingY + (height - 2*paddingY)/2 + 4} textAnchor="start" fontSize="10" fill={theme === 'deep' ? '#c084fc' : '#9333ea'}>6 UV</text>
          <text x={width - paddingX + 10} y={height - paddingY + 4} textAnchor="start" fontSize="10" fill={theme === 'deep' ? '#c084fc' : '#9333ea'}>0 UV</text>

          {/* Humidity Area */}
          <motion.path
            d={fillDHum}
            fill="url(#humGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Humidity Line */}
          <motion.path
            d={pathDHum}
            fill="none"
            stroke="url(#humLine)"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          {/* Pressure Line */}
          <motion.path
            d={pathDPress}
            fill="none"
            stroke="url(#pressLine)"
            strokeWidth={2.5}
            strokeDasharray="4 4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
          />

          {/* UV Line */}
          <motion.path
            d={pathDUv}
            fill="none"
            stroke="url(#uvLine)"
            strokeWidth={2.5}
            strokeDasharray="2 6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
          />

          {/* Hover interactive line */}
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

          {/* Nodes */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
              >
                <circle cx={pt.x} cy={height/2} r={100} fill="transparent" />

                {/* Hum node */}
                <circle
                  cx={pt.x} cy={pt.yHum}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#60a5fa' : '#3b82f6'}
                  stroke={theme === 'deep' ? '#0f172a' : '#ffffff'}
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />

                {/* Press node */}
                <circle
                  cx={pt.x} cy={pt.yPress}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#fcd34d' : '#f59e0b'}
                  stroke={theme === 'deep' ? '#0f172a' : '#ffffff'}
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />

                {/* UV node */}
                <circle
                  cx={pt.x} cy={pt.yUv}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#c084fc' : '#9333ea'}
                  stroke={theme === 'deep' ? '#0f172a' : '#ffffff'}
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />

                {/* Time label */}
                <text
                  x={pt.x}
                  y={height - 20}
                  textAnchor="middle"
                  fontSize="10"
                  className={isHovered ? 'font-medium opacity-100' : 'opacity-60'}
                  fill={theme === 'deep' ? '#ffffff' : '#000000'}
                >
                  {pt.data.time}
                </text>
              </g>
            );
          })}
        </svg>

        {selectedPoint && (
          <div
            className={`absolute top-4 pointer-events-none transform -translate-x-1/2 p-2.5 px-3.5 rounded-xl border text-[11px] flex flex-col gap-1.5 backdrop-blur-md shadow-lg transition-all duration-150 ${
              theme === 'deep'
                ? 'bg-slate-900/90 border-white/10 text-white'
                : 'bg-white/95 border-blue-100 text-slate-800'
            }`}
            style={{
              left: `${(selectedPoint.x / width) * 100}%`,
            }}
          >
            <div className="font-semibold text-xs opacity-90 border-b border-white/10 pb-1.5 mb-0.5">
              Thời gian: {selectedPoint.data.time}
            </div>
            <div className="flex items-center gap-2">
              <Droplets size={12} className="text-blue-400" />
              <span className="opacity-80">Độ ẩm:</span>
              <strong className="text-blue-400 text-xs">{selectedPoint.data.humidity}%</strong>
            </div>
            <div className="flex items-center gap-2">
              <Gauge size={12} className="text-amber-400" />
              <span className="opacity-80">Áp suất:</span>
              <strong className="text-amber-500 text-xs">{selectedPoint.data.pressure} hPa</strong>
            </div>
            <div className="flex items-center gap-2">
              <Sun size={12} className="text-purple-400" />
              <span className="opacity-80">Tia UV:</span>
              <strong className="text-purple-400 text-xs">{selectedPoint.data.uvIndex}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
