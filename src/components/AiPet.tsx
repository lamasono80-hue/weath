import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, MessageCircle, X, Volume2, Sparkles, AlertTriangle, BellRing } from 'lucide-react';
import { WeatherData, ThemeMode, WeatherCondition } from '../types';

interface AiPetProps {
  weather: WeatherData;
  theme: ThemeMode;
  onOpenChat: () => void;
  isChatOpen: boolean;
}

export default function AiPet({ weather, theme, onOpenChat, isChatOpen }: AiPetProps) {
  const [bubbleText, setBubbleText] = useState<string>('');
  const [showBubble, setShowBubble] = useState(true);
  const [animationState, setAnimationState] = useState<'idle' | 'happy' | 'sad' | 'scared'>('idle');
  const [proactiveNotification, setProactiveNotification] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic reaction & speech generation based on weather conditions
  useEffect(() => {
    let anim: 'idle' | 'happy' | 'sad' | 'scared' = 'idle';
    let warning: string | null = null;

    const cityLabel = weather.city;

    switch (weather.condition) {
      case 'sunny':
        anim = 'happy';
        if (weather.uvIndex >= 9) {
          warning = `CẢNH BÁO KHẨN CẤP: Chỉ số UV tại ${cityLabel} đang ở mức nguy hiểm cực độ (Mức ${weather.uvIndex})! Chủ nhân hạn chế tiếp xúc trực tiếp nhé!`;
        }
        break;

      case 'rainy':
        anim = 'sad';
        break;

      case 'stormy':
        anim = 'scared';
        warning = `CẢNH BÁO GIÔNG BÃO CỰC ĐOAN: Có nguy cơ dông lốc mạnh kèm sét đánh tại khu vực ${cityLabel}. Tuyệt đối không đứng dưới gốc cây to dạo mát!`;
        break;

      case 'cloudy':
        anim = 'idle';
        break;

      case 'snowy':
        anim = 'sad';
        break;

      case 'windy':
        anim = 'scared';
        break;

      default:
        anim = 'idle';
    }

    // Set bubble text to use the robust AI advice directly
    setBubbleText(weather.aiAdvice);
    setAnimationState(anim);
    setProactiveNotification(warning);

    // Flash bubble whenever weather context upgrades
    setShowBubble(true);
    const timer = setTimeout(() => {
      // Auto fade standard suggestion bubble after 9s, but persist emergency notifications
      if (!warning) {
        setShowBubble(false);
      }
    }, 11000);

    return () => clearTimeout(timer);
  }, [weather.city, weather.condition, weather.temp, weather.aiAdvice]);

  // Render SVG facial and accessory elements dynamically
  const renderPetSvg = () => {
    const isPastel = theme === 'pastel';
    
    // Cloud face color matching the dynamic theme modes
    const cloudColor = isPastel ? '#f1f5f9' : '#e2e8f0';
    const borderAccent = isPastel ? '#db2777' : '#FFFF00';

    return (
      <svg width="100" height="90" viewBox="0 0 100 85" className="overflow-visible drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]">
        {/* Animated Shadow */}
        <ellipse cx="50" cy="80" rx="30" ry="4" fill="rgba(0,0,0,0.15)" />

        {/* Cloud Body with jumping animation based on expression */}
        <motion.g
          animate={
            isHovered
              ? { y: [0, -12, -1, -8, 0], scale: 1.06 }
              : animationState === 'happy'
              ? { y: [0, -8, 0, -4, 0] }
              : animationState === 'sad'
              ? { y: [0, 2, 0, 2, 0], rotate: [-1, 1, -1] }
              : animationState === 'scared'
              ? { x: [-2, 2, -1, 1, -2, 2, 0], y: [-1, 1, -1, 1, 0] }
              : { y: [0, -3, 0] } // Normal floating
          }
          transition={{
            duration: isHovered ? 1.1 : animationState === 'happy' ? 1.5 : animationState === 'scared' ? 0.3 : 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Main Cloud outline */}
          <path
            d="M30,55 A15,15 0 0,1 45,40 A18,18 0 0,1 70,45 A14,14 0 0,1 82,56 A12,12 0 0,1 72,70 L28,70 A14,14 0 0,1 30,55 Z"
            fill={cloudColor}
            stroke={weather.condition === 'sunny' ? '#eab308' : '#cbd5e1'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Special Element: SUNGLASSES on Sunny */}
          {weather.condition === 'sunny' && (
            <g transform="translate(42, 48) scale(0.9)">
              {/* Cute heart-shaped or round sunglasses */}
              <circle cx="6" cy="6" r="6" fill="#1e293b" />
              <circle cx="18" cy="6" r="6" fill="#1e293b" />
              <line x1="12" y1="5" x2="14" y2="5" stroke="#1e293b" strokeWidth="2.5" />
              {/* Reflection shines */}
              <path d="M4,4 L6,6" stroke="#ffffff" strokeWidth="1" />
              <path d="M16,4 L18,6" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}

          {/* Face: Eyes & Cheeks */}
          {weather.condition !== 'sunny' && (
            <g>
              {/* Eyes */}
              {isHovered ? (
                // Overjoyed wink/squint eyes on hover
                <g stroke="#db2777" strokeWidth="2.5" fill="none" strokeLinecap="round">
                  <path d="M42,53 Q47,48 52,53" strokeWidth="3" />
                  <path d="M58,53 Q63,48 68,53" strokeWidth="3" />
                </g>
              ) : animationState === 'happy' ? (
                // Overjoyed curve eyes
                <g stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round">
                  <path d="M43,53 Q47,49 51,53" />
                  <path d="M59,53 Q63,49 67,53" />
                </g>
              ) : animationState === 'sad' ? (
                // Watery sad blinking eyes
                <g fill="#334155">
                  <circle cx="47" cy="54" r="2.5" />
                  <circle cx="61" cy="54" r="2.5" />
                  {/* Tears */}
                  <motion.circle
                    cx="47"
                    cy="58"
                    r="1.5"
                    fill="#38bdf8"
                    animate={{ y: [0, 8], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                </g>
              ) : animationState === 'scared' ? (
                // Wide wide panic eyes
                <g fill="#1e293b">
                  <ellipse cx="46" cy="54" rx="3.5" ry="5" />
                  <ellipse cx="62" cy="54" rx="3.5" ry="5" />
                  {/* Tiny white shock pupils */}
                  <circle cx="46" cy="54" r="1" fill="#fff" />
                  <circle cx="62" cy="54" r="1" fill="#fff" />
                </g>
              ) : (
                // Standard cute blinking eyes
                <g fill="#334155">
                  <motion.ellipse
                    cx="47"
                    cy="54"
                    rx="3"
                    ry="3"
                    animate={{ ry: [3, 3, 0.2, 3, 3] }}
                    transition={{ repeat: Infinity, duration: 3.5, repeatDelay: 1 }}
                  />
                  <motion.ellipse
                    cx="61"
                    cy="54"
                    rx="3"
                    ry="3"
                    animate={{ ry: [3, 3, 0.2, 3, 3] }}
                    transition={{ repeat: Infinity, duration: 3.5, repeatDelay: 1 }}
                  />
                </g>
              )}

              {/* Blushing cheek indicators (enlarged & brightened on hover) */}
              <circle
                cx="41"
                cy="58"
                r={isHovered ? "5.5" : "4"}
                fill={isHovered ? "rgba(244,63,94,0.7)" : "rgba(244,63,94,0.35)"}
                className="transition-all duration-300"
              />
              <circle
                cx="67"
                cy="58"
                r={isHovered ? "5.5" : "4"}
                fill={isHovered ? "rgba(244,63,94,0.7)" : "rgba(244,63,94,0.35)"}
                className="transition-all duration-300"
              />
            </g>
          )}

          {/* Mouth expressions */}
          {isHovered ? (
            <path d="M51,59 q2.5,4 5,0" fill="none" stroke="#db2777" strokeWidth="3" strokeLinecap="round" />
          ) : animationState === 'happy' ? (
            <path d="M51,60 q3,4 6,0" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
          ) : animationState === 'sad' ? (
            <path d="M52,62 q2,-3 4,0" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
          ) : animationState === 'scared' ? (
            <ellipse cx="54" cy="62" rx="3.5" ry="2.5" fill="#1e293b" />
          ) : (
            // Cozy smiling
            <path d="M52,60 q2.5,3 5,0" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Winter hat or accessories on cold / snowy environments */}
          {weather.condition === 'snowy' && (
            <g transform="translate(37, 24) scale(0.8)">
              {/* Cute Red Cozy Beanie */}
              <path d="M10,25 Q25,10 40,25" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
              <rect x="5" y="22" width="40" height="5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="25" cy="11" r="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            </g>
          )}

          {/* Glowing halo sparkles on sunny */}
          {weather.condition === 'sunny' && (
            <g>
              <circle cx="40" cy="56" r="3" fill="rgba(234,179,8,0.4)" />
              <circle cx="68" cy="56" r="3" fill="rgba(234,179,8,0.4)" />
              <path d="M52,61 q2.5,3 5,0" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
        </motion.g>
      </svg>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      
      {/* Dynamic Proactive Warning Alert Overlay when storm/extreme weather is detected */}
      <AnimatePresence>
        {proactiveNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-3 max-w-xs p-3.5 bg-rose-950/95 border border-rose-500/40 rounded-2xl shadow-2xl flex gap-2.5 items-start pointer-events-auto backdrop-blur-xl shrink-0"
          >
            <div className="p-1 px-1.5 rounded-lg bg-rose-500/20 text-rose-300 animate-bounce mt-0.5">
              <AlertTriangle size={15} />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-rose-300 tracking-wider uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                  Báo động khẩn
                </span>
                <button
                  onClick={() => setProactiveNotification(null)}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-[10px] text-white font-medium mt-1 leading-relaxed">
                {proactiveNotification}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main speech bubble next to Pet cloud */}
      <AnimatePresence>
        {showBubble && !isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`mb-2 mr-3 max-w-[260px] p-4.5 rounded-3xl shadow-xl border relative pointer-events-auto select-none backdrop-blur-xl ${
              theme === 'deep'
                ? 'bg-[#0b132b]/95 border-emerald-500/20 text-slate-100'
                : 'bg-white/95 border-pink-200 text-slate-800'
            }`}
          >
            {/* Speech bubble tail pointer */}
            <div className={`absolute bottom-[-6px] right-9 w-3.5 h-3.5 transform rotate-45 border-b border-r ${
              theme === 'deep' ? 'bg-[#0b132b] border-emerald-500/20' : 'bg-white border-pink-200'
            }`}></div>

            <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-11.5 mb-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#FFFF00] flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-emerald-400"></span>
                Bé Mây Aero khuyên
              </span>
              <button
                onClick={() => setShowBubble(false)}
                className="text-white/30 hover:text-white/70 hover:bg-white/5 transition-all text-[9.5px]"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] leading-relaxed font-normal">
              {bubbleText.split('**').map((tok, i) => 
                i % 2 === 1 ? <strong key={i} className="text-[#FFFF00]">{tok}</strong> : tok
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flashing visual call to actions if the app has warning or important highlights */}
      <div className="flex items-center gap-2">
        {/* Animated Avatar - Now acting as the single elegant smart toggle */}
        <div
          onClick={() => {
            onOpenChat();
            if (!isChatOpen) {
              setShowBubble(false);
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="pointer-events-auto cursor-pointer flex justify-center items-center hover:scale-[1.08] active:scale-[0.94] transition-all relative"
          title={isChatOpen ? "Thu nhỏ Bé Mây" : "Trò chuyện với Bé Mây Aero"}
        >
          {renderPetSvg()}
          
          {/* Subtle notification heartbeat indicator on the cloud itself when chat is minimized */}
          {!isChatOpen && (
            <span className="absolute top-1.5 right-1 box-content block w-2.5 h-2.5 bg-[#FFFF00] rounded-full ring-2 ring-slate-900 animate-pulse pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
