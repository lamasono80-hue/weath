import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyForecast, ThemeMode } from '../types';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Wind, ChevronDown, ChevronUp, Droplets, Umbrella, SunDim } from 'lucide-react';
import GlassCard from './GlassCard';

interface WeeklyForecastProps {
  days: DailyForecast[];
  theme: ThemeMode;
  tempUnit?: 'C' | 'F';
}

export default function WeeklyForecast({ days, theme, tempUnit = 'C' }: WeeklyForecastProps) {
  const [expandedDayIdx, setExpandedDayIdx] = useState<number | null>(null);

  const renderTemp = (tempC: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°`;
    }
    return `${tempC}°`;
  };

  // Compute absolute extremes for the horizontal visual temperature range bar
  const allMins = days.map((d) => d.tempMin);
  const allMaxs = days.map((d) => d.tempMax);
  const absoluteMin = Math.min(...allMins);
  const absoluteMax = Math.max(...allMaxs);
  const absoluteRange = absoluteMax - absoluteMin || 1;

  // Retrieve matching weather icon
  const getWeatherIcon = (iconName: string, size: number = 22) => {
    switch (iconName) {
      case 'sunny':
        return <Sun size={size} className={theme === 'deep' ? 'text-[#FFFF00]' : 'text-amber-500'} />;
      case 'cloudy':
        return <Cloud size={size} className="text-blue-200" />;
      case 'rainy':
        return <CloudRain size={size} className="text-blue-400" />;
      case 'stormy':
        return <CloudLightning size={size} className="text-amber-400" />;
      case 'snowy':
        return <Snowflake size={size} className="text-teal-200 animate-spin" style={{ animationDuration: '20s' }} />;
      case 'windy':
        return <Wind size={size} className="text-slate-300" />;
      default:
        return <Sun size={size} />;
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'sunny': return 'Nắng đẹp';
      case 'cloudy': return 'Nhiều mây';
      case 'rainy': return 'Mưa rào';
      case 'stormy': return 'Giông bão';
      case 'snowy': return 'Băng tuyết';
      case 'windy': return 'Nhiều gió';
      default: return 'Có mây';
    }
  };

  const toggleExpandDay = (idx: number) => {
    if (expandedDayIdx === idx) {
      setExpandedDayIdx(null);
    } else {
      setExpandedDayIdx(idx);
    }
  };

  return (
    <GlassCard theme={theme} className="w-full">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <h3 className={`text-lg font-bold ${theme === 'deep' ? 'text-white' : 'text-slate-800'}`}>
          Dự báo 7 ngày tới
        </h3>
        <span className="text-[10px] uppercase tracking-wider opacity-60">Chu kỳ tuần</span>
      </div>

      <div className="space-y-2">
        {days.map((day, idx) => {
          const isExpanded = expandedDayIdx === idx;

          // Compute horizontal percentages for the temperature bar
          const leftPercent = ((day.tempMin - absoluteMin) / absoluteRange) * 100;
          const widthPercent = ((day.tempMax - day.tempMin) / absoluteRange) * 100;

          return (
            <div key={idx} className="border-b border-white/5 last:border-b-0 pb-1">
              <div
                onClick={() => toggleExpandDay(idx)}
                className={`flex flex-wrap items-center justify-between py-3 px-2 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group`}
              >
                {/* 1. Day Name & Date */}
                <div className="w-24 flex-shrink-0">
                  <p className={`font-semibold text-sm ${theme === 'deep' ? 'text-slate-100' : 'text-slate-900'}`}>
                    {day.day}
                  </p>
                  <p className="text-[10px] opacity-50">{day.date}</p>
                </div>

                {/* 2. Weather Icon + Weather Subtitle */}
                <div className="flex items-center gap-2.5 w-24">
                  {getWeatherIcon(day.icon)}
                  <span className="text-xs font-medium opacity-80 whitespace-nowrap hidden sm:inline">
                    {getConditionLabel(day.condition)}
                  </span>
                </div>

                {/* 3. TEMPERATURE RANGE BAR (High-end modern visualizer) */}
                <div className="flex-1 max-w-[160px] mx-4 hidden md:flex items-center gap-3">
                  <span className="text-xs font-semibold w-6 text-right opacity-70">
                    {renderTemp(day.tempMin)}
                  </span>
                  
                  {/* Gauge line */}
                  <div className="relative flex-1 h-2 rounded-full bg-slate-800/40 border border-white/5 overflow-hidden">
                    <div
                       className="absolute h-full rounded-full bg-gradient-to-r from-[#FFFF00] to-emerald-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(widthPercent, 5)}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-semibold w-6 text-left" style={{ color: theme === 'deep' ? '#FFFF00' : '#1e293b' }}>
                    {renderTemp(day.tempMax)}
                  </span>
                </div>

                {/* 4. Rain & Humidity Chance */}
                <div className="flex items-center gap-3.5 text-xs">
                  {day.rainProb > 20 ? (
                    <span className="flex items-center gap-0.5 text-blue-400 font-semibold">
                      <Umbrella size={12} />
                      {day.rainProb}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 opacity-40">
                      <Umbrella size={12} />
                      --
                    </span>
                  )}
                  
                  {/* Mobile High/Low Temp display fallback */}
                  <div className="md:hidden flex items-baseline gap-1 font-semibold text-xs ml-1">
                    <span className="opacity-60">{renderTemp(day.tempMin)}</span>
                    <span className="opacity-40">/</span>
                    <span className={theme === 'deep' ? 'text-[#FFFF00]' : 'text-slate-800'}>{renderTemp(day.tempMax)}</span>
                  </div>

                  <div className="opacity-45 group-hover:opacity-100 transition-opacity ml-1 pt-0.5">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </div>

              {/* Expandable detailed data for selected day */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden bg-white/[0.02] rounded-2xl mx-1"
                  >
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="opacity-65 block mb-1">Mức bức xạ cực tím</span>
                        <span className="font-semibold flex items-center gap-1">
                          <SunDim size={13} className="text-amber-400" />
                          UV {day.uvIndex} ({day.uvIndex >= 8 ? 'Nguy hiểm' : 'An toàn'})
                        </span>
                      </div>
                      <div>
                        <span className="opacity-65 block mb-1">Độ ẩm tối đa dự kiến</span>
                        <span className="font-semibold flex items-center gap-1 text-blue-300">
                          <Droplets size={13} />
                          {day.humidity}% RH
                        </span>
                      </div>
                      <div>
                        <span className="opacity-65 block mb-1">Tình hình lượng mây</span>
                        <span className="font-semibold text-emerald-400">
                          {day.condition === 'sunny' ? 'Trong xanh 10%' : 'Mây phủ dày làm mát'}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-65 block mb-1">Mức độ khuyến nghị</span>
                        <span className="font-semibold text-slate-200">
                          {day.rainProb > 60 ? 'Mang ô chống ướt' : 'Mũ chống nắng tốt'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
