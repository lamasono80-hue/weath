import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DailyForecast, ThemeMode } from '../types';
import { Sparkles, Calendar, Loader2, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';

interface AiForecastSummaryProps {
  dailyData: DailyForecast;
  city: string;
  theme: ThemeMode;
}

export default function AiForecastSummary({ dailyData, city, theme }: AiForecastSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      setSummary(null);
      
      try {
        const response = await fetch('/api/gemini/forecast-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dailyData,
            city,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Lỗi khi tải dự báo tóm tắt');
        }

        if (isMounted) {
          setSummary(data.summary);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(err);
          // Fallback to static text if AI fails
          setError(err.message || 'Lỗi kết nối AI');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();
    
    return () => {
      isMounted = false;
    };
  }, [dailyData, city]);

  const fallbackText = `Ngày mai ${dailyData.day}, thời tiết dự kiến sẽ ${dailyData.condition === 'rainy' ? 'có mưa' : dailyData.condition === 'sunny' ? 'có nắng' : dailyData.condition === 'cloudy' ? 'nhiều mây' : 'có biến động'}. Nhiệt độ dao động từ ${dailyData.tempMin}° đến ${dailyData.tempMax}°. Khả năng mưa là ${dailyData.rainProb}%. ${dailyData.rainProb > 50 ? ' Hãy nhớ mang theo ô (dù) nhé!' : dailyData.uvIndex && dailyData.uvIndex > 7 ? ' Đừng quên kem chống nắng!' : ' Thời tiết khá thuận lợi cho các hoạt động ngoài trời.'}`;

  return (
    <GlassCard theme={theme} className="p-4 border-l-4 border-l-emerald-500 relative overflow-hidden">
      {/* Decorative inner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex-shrink-0 relative">
          <Calendar size={18} />
          <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold uppercase tracking-wide opacity-90 text-emerald-400">
              Dự báo tóm tắt ngày mai
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 uppercase tracking-wider shadow-sm">
              AI Powered
            </span>
          </div>
          
          <div className="mt-2 text-[13px] leading-relaxed opacity-85 min-h-[40px]">
            {loading ? (
              <div className="flex items-center gap-2 text-emerald-400/70">
                <Loader2 size={14} className="animate-spin" />
                <span className="italic">AI đang phân tích dữ liệu...</span>
              </div>
            ) : error || !summary ? (
              <p>
                <strong>{fallbackText}</strong>
              </p>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p>
                  <strong className={theme === 'deep' ? 'text-white' : 'text-slate-900'}>{summary}</strong>
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
