import React from 'react';
import { motion } from 'motion/react';
import { WeatherData, ThemeMode } from '../types';
import { MapPin, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface WeatherHeroProps {
  weather: WeatherData;
  theme: ThemeMode;
  currentHourScrub?: string | null;
  tempUnit?: 'C' | 'F';
  lastUpdated?: Date;
  isRefreshing?: boolean;
  onRefetch?: () => void;
}

export default function WeatherHero({ weather, theme, currentHourScrub, tempUnit = 'C', lastUpdated, isRefreshing, onRefetch }: WeatherHeroProps) {
  // Convert temperature helper
  const renderTemp = (tempC: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    }
    return `${tempC}°C`;
  };

  const renderTempFormatted = (tempC: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}`;
    }
    return `${tempC}`;
  };

  // Translate weather status
  const conditionLabels: { [key: string]: string } = {
    sunny: 'Trời nắng đẹp',
    cloudy: 'Nhiều mây',
    rainy: 'Có mưa rào',
    stormy: 'Giông bão',
    snowy: 'Tuyết rơi',
    windy: 'Gió thổi mạnh',
  };

  // Weather Interactive Animated SVG Artwork
  const renderWeatherArtwork = () => {
    switch (weather.condition) {
      case 'sunny':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Ambient heat rays aura */}
            <motion.div
              className="absolute inset-0 bg-yellow-400/25 rounded-full blur-3xl"
              animate={{ scale: [1, 1.25, 0.95, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            />
            {/* Glowing cute Sun */}
            <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
              <defs>
                <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFA6" />
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </radialGradient>
              </defs>
              
              {/* Outer sun rays spinning gracefully */}
              <motion.g
                stroke="#FBBF24"
                strokeWidth="4.5"
                strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                style={{ transformOrigin: '60px 60px' }}
              >
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, j) => {
                  const isEven = j % 2 === 0;
                  return (
                    <line
                      key={j}
                      x1="60"
                      y1={isEven ? "15" : "22"}
                      x2="60"
                      y2="5"
                      transform={`rotate(${angle} 60 60)`}
                      className="opacity-90"
                    />
                  );
                })}
              </motion.g>

              {/* Core Sun sphere */}
              <motion.circle
                cx="60"
                cy="60"
                r="30"
                fill="url(#sunGrad)"
                animate={{ scale: [0.96, 1.04, 0.96] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              />

              {/* Smiling sun face for high friendliness */}
              <g className="opacity-90 pointer-events-none">
                {/* Cheerful curve eyes */}
                <path d="M48,56 Q51,52 54,56" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M66,56 Q69,52 72,56" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Rosy blush */}
                <circle cx="44" cy="62" r="3" fill="#f43f5e" opacity="0.7" />
                <circle cx="76" cy="62" r="3" fill="#f43f5e" opacity="0.7" />
                {/* Cute smile */}
                <path d="M56,64 Q60,68 64,64" stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>

              {/* Little sparkle star decoration */}
              <motion.path
                d="M15,25 L18,28 L23,28 L19,31 L21,36 L15,32 L9,36 L11,31 L7,28 L12,28 Z"
                fill="#FFFF00"
                animate={{ scale: [0.6, 1.1, 0.6], rotate: [0, 45, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                style={{ transformOrigin: '15px 25px' }}
              />
            </svg>
          </div>
        );

      case 'cloudy':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background glowing disk */}
            <motion.div
              className="absolute inset-0 bg-sky-300/15 rounded-full blur-3xl animate-pulse"
              style={{ animationDuration: '8s' }}
            />
            
            <svg width="130" height="110" viewBox="0 0 130 110" className="overflow-visible">
              <defs>
                <linearGradient id="cloudBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="backCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>

              {/* Gentle gliding bird for a warm, closer human vibe */}
              <motion.g
                animate={{
                  x: [-35, 125],
                  y: [2, 12, 2],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 11,
                  ease: 'linear',
                }}
              >
                <path
                  d="M0,20 Q5,14 10,20 Q15,14 20,20 Q10,13 0,20"
                  fill="none"
                  stroke={theme === 'deep' ? '#38bdf8' : '#475569'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Back Cloud */}
              <motion.path
                d="M30,48 A20,20 0 0,1 70,42 A16,16 0 0,1 96,48 A14,14 0 0,1 110,62 A16,16 0 0,1 94,78 L38,78 A20,20 0 0,1 30,48 Z"
                fill="url(#backCloudGrad)"
                opacity="0.8"
                animate={{ x: [-3, 5, -3], y: [-1, 2, -1] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              />

              {/* Front Main Cloud */}
              <motion.path
                d="M15,62 A24,24 0 0,1 63,55 A20,20 0 0,1 92,59 A16,16 0 0,1 108,75 A20,20 0 0,1 88,95 L25,95 A24,24 0 0,1 15,62 Z"
                fill="url(#cloudBgGrad)"
                className="drop-shadow-[0_8px_16px_rgba(100,116,139,0.3)]"
                animate={{ x: [3, -3, 3], y: [1, -1.5, 1] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              />

              {/* Cute sleepy expression on the cloud itself */}
              <motion.g
                className="opacity-75"
                animate={{ x: [3, -3, 3], y: [1, -1.5, 1] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              >
                <path d="M48,72 C49,74 51,74 52,72" stroke="#475569" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <path d="M64,72 C65,74 67,74 68,72" stroke="#475569" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <path d="M57,78 Q59,80 61,78" stroke="#e11d48" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </motion.g>
            </svg>
          </div>
        );

      case 'rainy':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background water blue glow */}
            <motion.div
              className="absolute inset-0 bg-blue-500/15 rounded-full blur-3xl"
            />
            
            <svg width="130" height="130" viewBox="0 0 130 130" className="overflow-visible">
              <defs>
                <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bfdbfe" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>

              {/* Grass line with ripples where raindrops fall */}
              <g className="opacity-95">
                {/* Grass silhouette path */}
                <path
                  d="M10,110 Q40,105 70,112 Q100,106 120,110 L120,122 L10,122 Z"
                  fill="url(#grassGrad)"
                  className="drop-shadow-sm"
                />
                
                {/* Cozy blades of grass */}
                <path d="M22,108 L20,101 L25,107" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                <path d="M55,111 L54,103 L59,110" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                <path d="M95,108 L96,101 L100,108" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

                {/* Animated dynamic ripple rings on landing */}
                <motion.circle
                  cx="35"
                  cy="111"
                  r="6"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  fill="none"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.6, 2.5], opacity: [0.9, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, delay: 0.2, ease: 'easeOut' }}
                />
                <motion.circle
                  cx="78"
                  cy="112"
                  r="6"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  fill="none"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 2.8], opacity: [0.8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, delay: 0.7, ease: 'easeOut' }}
                />
              </g>

              {/* Rain cloud */}
              <motion.path
                d="M20,45 A20,20 0 0,1 66,39 A18,18 0 0,1 92,42 A15,15 0 0,1 106,56 L25,56 A20,20 0 0,1 20,45 Z"
                fill="url(#rainCloudGrad)"
                className="drop-shadow-[0_6px_12px_rgba(15,23,42,0.25)]"
                animate={{ y: [-2, 3, -2] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              />

              {/* Raindrops dripping beautifully */}
              <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
                {[
                  { x: 32, y: 64, delay: 0 },
                  { x: 48, y: 68, delay: 0.35 },
                  { x: 62, y: 62, delay: 0.18 },
                  { x: 80, y: 66, delay: 0.53 },
                  { x: 92, y: 60, delay: 0.28 },
                ].map((drop, idx) => (
                  <motion.line
                    key={idx}
                    x1={drop.x}
                    y1={drop.y}
                    x2={drop.x - 2.5}
                    y2={drop.y + 14}
                    initial={{ opacity: 0, y: -2 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [0, 24, 45],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.85,
                      delay: drop.delay,
                      ease: 'linear',
                    }}
                  />
                ))}
              </g>
            </svg>
          </div>
        );

      case 'stormy':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Violent dynamic flash overlay in backdrop */}
            <motion.div
              className="absolute inset-0 bg-yellow-300/10 rounded-full blur-3xl opacity-0"
              animate={{ opacity: [0, 0, 0.6, 0, 0.9, 0, 0, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1.5 }}
            />
            
            <svg width="130" height="130" viewBox="0 0 130 130" className="overflow-visible">
              <defs>
                <linearGradient id="stormCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              {/* Giant Flash Lightning Bolt */}
              <motion.path
                d="M58,58 L46,78 L56,78 L48,106 L72,74 L60,74 Z"
                fill="#FBBF24"
                stroke="#F59E0B"
                strokeWidth="1.5"
                className="drop-shadow-[0_0_15px_rgba(251,191,36,1)]"
                animate={{
                  opacity: [0, 0, 1, 0, 1, 0, 0, 0.8, 0],
                  scale: [0.95, 0.95, 1.05, 0.95, 1.1, 0.95, 0.95, 1.02, 0.95],
                }}
                transition={{ repeat: Infinity, duration: 4, delay: 1.5 }}
                style={{ transformOrigin: '58px 58px' }}
              />

              {/* Rain droplets */}
              <g stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
                {[30, 45, 60, 75, 90].map((xOffset, k) => (
                  <motion.line
                    key={k}
                    x1={xOffset}
                    y1="64"
                    x2={xOffset - 4}
                    y2="82"
                    animate={{ y: [0, 36], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: k * 0.15, ease: 'linear' }}
                  />
                ))}
              </g>

              {/* Back storm cloud */}
              <motion.path
                d="M32,45 A18,18 0 0,1 68,39 A15,15 0 0,1 92,42 L25,48 Z"
                fill="#334155"
                opacity="0.8"
                animate={{ x: [-2, 3, -2], y: [-1, 2, -1] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              />

              {/* Dark main storm cloud */}
              <motion.path
                d="M18,50 A22,22 0 0,1 66,43 A18,18 0 0,1 94,46 A16,16 0 0,1 108,62 L20,62 A22,22 0 0,1 18,50 Z"
                fill="url(#stormCloudGrad)"
                className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                animate={{ y: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              />
            </svg>
          </div>
        );

      case 'snowy':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* White snowy halo light */}
            <motion.div
              className="absolute inset-0 bg-teal-100/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDuration: '6s' }}
            />
            
            <svg width="130" height="130" viewBox="0 0 130 130" className="overflow-visible">
              <defs>
                <linearGradient id="snowCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#b4f4f4" />
                </linearGradient>
              </defs>

              {/* Forest bottom setup: Cute snowy evergreen tree */}
              <g className="opacity-90">
                {/* Triangular snowy pine tree */}
                <path d="M90,115 L110,115 L100,92 Z" fill="#047857" />
                <path d="M94,103 L106,103 L100,82 Z" fill="#059669" />
                {/* Snow landing on trees */}
                <path d="M97,94 L103,94 L100,82 Z" fill="#ffffff" />
                <path d="M93,105 L107,105 L100,92 L94,103" fill="#ffffff" />
                
                {/* Snowy ground cushion */}
                <path d="M10,115 Q40,110 80,117 Q110,112 120,115 L120,124 L10,124 Z" fill="#e2e8f0" />
                <path d="M12,115 Q35,112 70,117 L70,119 L12,119 Z" fill="#ffffff" />
              </g>

              {/* soft fluffy snow clouds */}
              <motion.path
                d="M20,44 A18,18 0 0,1 60,39 A15,15 0 0,1 86,42 A12,12 0 0,1 98,54 L22,54 Z"
                fill="url(#snowCloudGrad)"
                className="drop-shadow-md"
                animate={{ x: [-2, 2, -2], y: [-1, 1.5, -1] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              />

              {/* Rich falling winter snow crystals */}
              {Array.from({ length: 6 }).map((_, idx) => {
                const step = 22 + idx * 14;
                const delay = idx * 0.3;
                return (
                  <motion.circle
                    key={idx}
                    cx={step}
                    cy="58"
                    r={2 + (idx % 2)}
                    fill="#38bdf8"
                    animate={{
                      opacity: [0, 0.9, 0.9, 0],
                      y: [0, 24, 52],
                      x: [step, step + (idx % 2 === 0 ? 5 : -5)],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.1,
                      delay: delay,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
            </svg>
          </div>
        );

      case 'windy':
        return (
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Sky breeze green-teal glow */}
            <motion.div
              className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl"
            />
            
            <svg width="130" height="130" viewBox="0 0 130 130" className="overflow-visible">
              {/* Blowing breeze ribbons */}
              <g stroke={theme === 'deep' ? '#38bdf8' : '#334155'} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8">
                {/* Wind ribbon 1 */}
                <motion.path
                  d="M10,38 L55,38 C68,38 68,46 55,46 C45,46 45,55 58,55 L110,55"
                  animate={{ pathLength: [0, 1, 0.9, 0], x: [-10, 12, 18] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                />
                {/* Wind ribbon 2 */}
                <motion.path
                  d="M5,68 L40,68 C52,68 52,75 40,75 C30,75 30,83 45,83 L100,83"
                  animate={{ pathLength: [0, 1, 0.8, 0], x: [0, 16, 26] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.4, ease: 'easeInOut' }}
                />
              </g>

              {/* Dynamic flying spring leaves swirling beautifully */}
              {[
                { delay: 0.1, yStart: 42, length: 30 },
                { delay: 1.1, yStart: 60, length: 40 },
                { delay: 0.6, yStart: 25, length: 25 },
              ].map((leaf, lIdx) => (
                <motion.g
                  key={lIdx}
                  initial={{ x: -20, y: leaf.yStart }}
                  animate={{
                    x: [10, 130],
                    y: [leaf.yStart, leaf.yStart - 15, leaf.yStart + 10, leaf.yStart - 5],
                    rotate: [0, 120, 240, 360],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.8,
                    delay: leaf.delay,
                    ease: 'linear',
                  }}
                  className="origin-center"
                >
                  {/* Organic cute emerald leaf illustration */}
                  <path
                    d="M 0 0 C 10 -10, 20 -10, 25 0 C 15 10, 5 10, 0 0 Z M 0 0 L 25 0"
                    fill="#10b981"
                    stroke="#047857"
                    strokeWidth="1.2"
                    transform="scale(0.8)"
                  />
                </motion.g>
              ))}
            </svg>
          </div>
        );

      default:
        return <div className="w-16 h-16 bg-yellow-400 rounded-full animate-bounce"></div>;
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Decorative inner light points */}
      <div className="absolute top-2 right-4 flex items-center gap-3">
        {lastUpdated && (
          <div className="flex items-center gap-1.5 opacity-70">
            <span className="text-[10px] tracking-wider uppercase">
              Cập nhật: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onRefetch) onRefetch();
          }}
          disabled={isRefreshing}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all ${
            isRefreshing 
              ? 'opacity-50 cursor-not-allowed border-transparent bg-white/5' 
              : 'hover:bg-white/10 border-white/10 text-white/80 hover:text-white cursor-pointer'
          }`}
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span className="text-[10px] tracking-wider uppercase font-semibold">Refetch</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
        {/* Left column: Location & Weather Description */}
        <div className="flex-1 flex flex-col justify-center min-w-0 md:pr-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${
              theme === 'deep' ? 'bg-[#FFFF00]/10 text-[#FFFF00] border border-[#FFFF00]/20' : 'bg-pink-600/10 text-pink-700 border border-pink-200'
            }`}>
              {weather.country}
            </span>
            <div className="flex items-center gap-1 opacity-70 text-xs">
              <Calendar size={13} />
              <span>Hôm nay, 21 Th6</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-1 text-slate-100">
            <MapPin size={22} className={theme === 'deep' ? 'text-[#FFFF00]' : 'text-pink-600'} />
            <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${theme === 'deep' ? 'text-white' : 'text-slate-900'}`}>
              {weather.city}
            </h1>
          </div>

          <p className={`text-sm md:text-base opacity-95 mt-1 leading-relaxed font-semibold break-words ${
            theme === 'deep' ? 'text-slate-200' : 'text-slate-700'
          }`}>
            ⛅ {weather.description}
          </p>

          <div className="flex items-center gap-5 mt-6 border-t border-white/5 pt-4">
            {/* Min-Max ranges */}
            <div>
              <span className="text-[10px] block opacity-60 uppercase tracking-widest">
                Phạm vi ngày
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                  <ArrowUpRight size={13} /> Max {renderTemp(weather.daily[0].tempMax)}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-semibold opacity-70">
                  <ArrowDownRight size={13} /> Min {renderTemp(weather.daily[0].tempMin)}
                </span>
              </div>
            </div>

            {/* Feels Like temp */}
            <div className="border-l border-white/10 pl-5">
              <span className="text-[10px] block opacity-60 uppercase tracking-widest">
                Cảm nhận thực tế
              </span>
              <span className={`text-base font-bold ${theme === 'deep' ? 'text-[#FFFF00]' : 'text-slate-800'}`}>
                {renderTemp(weather.feelsLike)}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Huge temperature displaying the #FFFF00 lime accent + artwork */}
        <div className="flex-shrink-0 flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 p-2 md:p-0">
          <div className="flex flex-col text-left md:text-right">
            <span className="text-[11px] uppercase tracking-widest opacity-60">
              {currentHourScrub ? `Nhiệt độ lúc ${currentHourScrub}` : 'Nhiệt độ hiện tại'}
            </span>
            <div className="relative inline-block select-none mt-1">
              <motion.span
                id="current-temp"
                className="text-7xl md:text-8xl font-black tracking-tighter block text-center"
                style={{
                  color: theme === 'deep' ? '#FFFF00' : '#1e293b',
                  textShadow: theme === 'deep' ? '0 0 35px rgba(255, 255, 0, 0.45)' : 'none',
                }}
                key={weather.temp}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                {renderTempFormatted(weather.temp)}°
              </motion.span>
            </div>
            <span className="text-xs font-medium tracking-wide uppercase opacity-75 mt-1">
              {conditionLabels[weather.condition]}
            </span>
          </div>

          {/* Icon Animated Illustration */}
          <div className="flex-shrink-0">
            {renderWeatherArtwork()}
          </div>
        </div>
      </div>
    </div>
  );
}
