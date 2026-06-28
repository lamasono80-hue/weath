import React from 'react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';
import { Sparkles, CheckCircle, Info } from 'lucide-react';
import GlassCard from './GlassCard';

interface AiAdvisorProps {
  advice: string;
  cityName: string;
  theme: ThemeMode;
  temp: number;
}

export default function AiAdvisor({ advice, cityName, theme, temp }: AiAdvisorProps) {
  // Select some quick checkboxes depending on the temperature
  const getQuickCautions = (t: number) => {
    if (t <= 15) {
      return [
        'Mặc áo giữ nhiệt bọc lót bên trong.',
        'Đeo khăn len và tất giữ ấm cổ bàn chân.',
        'Sử dụng nước ấm khi di chuyển ngoài trời.',
      ];
    }
    if (t >= 32) {
      return [
        'Thoa lại tinh chất kem chống nắng sau 2 giờ.',
        'Mang chai nước lọc bên người tránh mất nước.',
        'Tránh hoạt động quá mạnh dưới ánh mặt trời trực tiếp.',
      ];
    }
    return [
      'Lựa chọn trang phục thoải mái dạo phố.',
      'Dự phòng ô che nắng mưa gián đoạn vãng lai.',
      'Thích hợp tối đa các hoạt động thể chất dã ngoại.',
    ];
  };

  const checkpList = getQuickCautions(temp);

  return (
    <GlassCard theme={theme} className="w-full relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-[#FFFF00]/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-emerald-400 animate-bounce" />
        <h4 className={`font-bold text-sm tracking-wide uppercase ${theme === 'deep' ? 'text-white' : 'text-slate-800'}`}>
          Lời khuyên trang phục & Sức khoẻ từ AI
        </h4>
      </div>

      <div className={`text-sm leading-relaxed mb-4 ${theme === 'deep' ? 'text-slate-300' : 'text-slate-600'}`}>
        <p className="font-medium inline text-emerald-400">Gợi ý riêng cho {cityName}: </p>
        <span>{advice}</span>
      </div>

      <div className="border-t border-white/5 pt-3">
        <span className="text-[10px] block opacity-50 uppercase tracking-widest mb-2 font-semibold">
          Chuẩn bị nhanh trước khi ra đường
        </span>
        <ul className="space-y-1.5 text-xs font-medium">
          {checkpList.map((item, idx) => (
            <motion.li
              key={idx}
              className="flex items-start gap-2 opacity-85 hover:opacity-100 transition-opacity"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <CheckCircle size={13} className="text-[#4ade80] mt-0.5 flex-shrink-0" />
              <span className={theme === 'deep' ? 'text-slate-200' : 'text-slate-700'}>{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center gap-1 opacity-50 text-[10px]">
        <Info size={11} />
        <span>Dữ liệu đề xuất tổng hợp từ xu hướng khí hậu địa phương thực tế.</span>
      </div>
    </GlassCard>
  );
}
