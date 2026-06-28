import React from 'react';
import { motion } from 'motion/react';
import { WeatherData, ThemeMode } from '../types';
import { Droplets, Wind, Compass, Sun, ShieldAlert, Activity } from 'lucide-react';
import GlassCard from './GlassCard';

interface StatsGridProps {
  weather: WeatherData;
  theme: ThemeMode;
  windSpeedUnit?: 'km/h' | 'm/s';
}

export default function StatsGrid({ weather, theme, windSpeedUnit = 'km/h' }: StatsGridProps) {
  // Convert wind speed helper
  const renderWindSpeed = () => {
    if (windSpeedUnit === 'm/s') {
      const speedMs = Math.round(weather.windSpeed * 0.278 * 10) / 10;
      return `${speedMs} m/s`;
    }
    return `${weather.windSpeed} km/h`;
  };

  // Translate AQI colors
  const getAQIColorClass = (code: number) => {
    if (code <= 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (code <= 100) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-400/20';
  };

  const aqiGlowClass = getAQIColorClass(weather.airQualityCode);

  // UI helpers for descriptive text
  const getHumidityDesc = (h: number) => {
    if (h > 80) return 'Rất ẩm / Oai bức';
    if (h > 60) return 'Hơi ẩm';
    if (h > 30) return 'Thoải mái';
    return 'Khô hanh';
  };

  const getWindDesc = (w: number) => {
    if (w > 30) return 'Gió mạnh (cần lưu ý)';
    if (w > 15) return 'Gió vừa (mát mẻ)';
    return 'Gió nhẹ (yên tĩnh)';
  };

  const getUvDesc = (uv: number) => {
    if (uv > 8) return 'Rất gắt - Cần che chắn kỹ';
    if (uv > 5) return 'Nguy cơ vừa - Nên đội mũ';
    return 'Mức độ an toàn';
  };

  const getPressureDesc = (p: number) => {
    if (p < 1000) return 'Áp suất thấp (Mưa/Bão)';
    if (p <= 1020) return 'Ổn định';
    return 'Áp suất cao (Quang đãng)';
  };

  const getRainDesc = (prob: number) => {
    if (prob > 80) return 'Chắc chắn mưa';
    if (prob > 50) return 'Khả năng mưa cao';
    if (prob > 20) return 'Có thể mưa nhẹ';
    return 'Rất khó mưa';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      
      {/* 1. HUMIDITY (Độ ẩm) */}
      <GlassCard theme={theme} className="flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Độ ẩm</span>
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
            <Droplets size={16} className="text-blue-400" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tight ${theme === 'deep' ? 'text-white' : 'text-slate-800'}`}>
              {weather.humidity}
            </span>
            <span className="text-sm font-semibold opacity-75">%</span>
          </div>
          <div className="mt-2 text-sm font-medium text-blue-400">
            {getHumidityDesc(weather.humidity)}
          </div>
        </div>
      </GlassCard>

      {/* 2. WIND SPEED (Tốc độ gió) */}
      <GlassCard theme={theme} className="flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Tốc độ gió</span>
          <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 group-hover:rotate-45 transition-all duration-300">
            <Wind size={16} className={theme === 'deep' ? 'text-[#FFFF00]' : 'text-emerald-500'} />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tight ${theme === 'deep' ? 'text-white' : 'text-slate-800'}`}>
              {windSpeedUnit === 'm/s' ? (Math.round(weather.windSpeed * 0.278 * 10) / 10) : weather.windSpeed}
            </span>
            <span className="text-sm font-semibold opacity-75">{windSpeedUnit}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            <Compass size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
            {getWindDesc(weather.windSpeed)}
          </div>
        </div>
      </GlassCard>

      {/* 3. UV INDEX (Chỉ số UV) */}
      <GlassCard theme={theme} className="flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Chỉ số UV</span>
          <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 group-hover:scale-110 transition-all">
            <Sun size={16} className="text-amber-400 animate-pulse" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight" style={{ color: theme === 'deep' ? '#FFFF00' : '#d97706' }}>
              {weather.uvIndex}
            </span>
          </div>
          <div className="mt-2 text-sm font-medium" style={{ color: weather.uvIndex >= 8 ? '#ef4444' : weather.uvIndex >= 5 ? '#f59e0b' : '#22c55e' }}>
            {getUvDesc(weather.uvIndex)}
          </div>
        </div>
      </GlassCard>

      {/* 4. AIR QUALITY (Chất lượng không khí - AQI) */}
      <GlassCard theme={theme} className="flex flex-col justify-between min-h-[140px] lg:col-span-1 col-span-2 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Chất lượng không khí (AQI)</span>
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 group-hover:bg-teal-500/20 transition-all">
            <Activity size={16} className="text-emerald-400" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${aqiGlowClass}`}>
              {weather.airQualityCode} AQI
            </div>
            <span className={`text-sm font-semibold ${theme === 'deep' ? 'text-white' : 'text-slate-800'}`}>
              {weather.airQuality}
            </span>
          </div>
          <p className="text-[10px] opacity-60 line-clamp-2 mt-2 leading-relaxed">
            {weather.airQualityDesc}
          </p>
        </div>
      </GlassCard>

      {/* 5. PRESSURE (Áp suất khí quyển) */}
      <GlassCard theme={theme} className="flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Áp suất</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-95 transition-all">
            <ShieldAlert size={16} className="text-indigo-400" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tight ${theme === 'deep' ? 'text-white' : 'text-slate-800'}`}>
              {weather.pressure}
            </span>
            <span className="text-sm font-semibold opacity-75">hPa</span>
          </div>
          <div className="mt-2 text-sm font-medium text-indigo-400">
            {getPressureDesc(weather.pressure)}
          </div>
        </div>
      </GlassCard>

      {/* 6. PRECIPITATION PROBABILITY (Xác suất mưa trung bình) */}
      <GlassCard theme={theme} className="flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Khả năng mưa</span>
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 group-hover:scale-105 transition-all">
            <Droplets size={16} className="text-teal-400" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tight ${theme === 'deep' ? 'text-white' : 'text-slate-800'}`}>
              {weather.daily[0].rainProb}
            </span>
            <span className="text-sm font-semibold opacity-75">%</span>
          </div>
          <div className="mt-2 text-sm font-medium text-teal-400">
            {getRainDesc(weather.daily[0].rainProb)}
          </div>
        </div>
      </GlassCard>

    </div>
  );
}
