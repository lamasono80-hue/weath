import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, MessageSquare, Trash2, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { ThemeMode, WeatherData } from '../types';
import GlassCard from './GlassCard';

interface AiChatbotProps {
  weatherContext: WeatherData;
  theme: ThemeMode;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AiChatbot({ weatherContext, theme }: AiChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-generate helper message when weatherContext changes
  useEffect(() => {
    const welcomeMsg = `Dạ Bé Mây Aero xin kính chào Chủ nhân ạ! ☁️🥰 

Bé Mây đang đồng hành túc trực theo dõi sát thời tiết tại **${weatherContext.city}** (${weatherContext.temp}°C, ${weatherContext.description || 'có mây nhẹ'}). 

Hôm nay Chủ nhân đi đâu dạo phố, có công việc quan trọng hay lịch trình di chuyển nào cần Bé Mây đo lường sức khỏe, khuyên bảo trang phục hay che mưa che nắng không dợ? Chủ nhân nhắn cho Mây bít nha! Mây sẵn sàng phục vụ liền đây! 💖✨`;
    
    setMessages([
      {
        role: 'model',
        content: welcomeMsg,
      }
    ]);
    setErrorMsg(null);
  }, [weatherContext.city, weatherContext.temp, weatherContext.condition]);

  // Keep chat scrolled to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText.trim();
    if (!textToSend || loading) return;

    // Add user message locally
    const newUserMsg: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    if (!customText) setInputText('');
    setLoading(true);
    setErrorMsg(null);

    try {
      // Send chat history and current weather context to the backend
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages, // Send history logs for continuity
          weatherContext: weatherContext, // Live context synchronization
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Trục trặc đường truyền dữ liệu chatbot.');
      }

      setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi kết nối với máy chủ AI.');
      setMessages((prev) => [
        ...prev,
        { 
          role: 'model', 
          content: '⚠️ **Hệ thống AI tạm thời gián đoạn**: Vui lòng đảm bảo rằng bạn đã kết cấu đúng `GEMINI_API_KEY` trong biểu mẫu Secrets và khởi động lại Server.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const defaultWelcome = `Đã làm mới cuộc hội thoại! Hiện tại tôi đang xem thời tiết khu vực **${weatherContext.city}** (${weatherContext.temp}°C). Bạn muốn nhận đề xuất thời tiết chi tiết nào?`;
    setMessages([{ role: 'model', content: defaultWelcome }]);
    setErrorMsg(null);
  };

  const quickPrompts = [
    'Hôm nay thế nào?',
    'Phối đồ dạo phố hôm nay?',
    'Tự động Sao lưu',
    'Lịch sử Ghi chép',
    'Tôi sắp chạy xe đi xa ngoài đường, cần lưu ý gì?',
    'Khuyên bảo vệ sức khỏe lúc này?'
  ];

  return (
    <GlassCard theme={theme} className="flex flex-col h-[520px] relative overflow-hidden transition-all duration-300">
      {/* Glow background decoration */}
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header section with status */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-[#FFFF00] rounded-lg animate-pulse">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className={`font-bold text-sm leading-tight ${theme === 'deep' ? 'text-white' : 'text-slate-800'}`}>
              Linh Thú Trợ Lý "Bé Mây Aero"
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFFF00] animate-ping"></span>
              <span className="text-[9px] opacity-70 uppercase font-bold tracking-widest text-[#FFFF00]">
                Live: {weatherContext.city} • Thân thiện
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="Xóa lịch sử chat"
          className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Messages layout */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, index) => {
          const isModel = msg.role === 'model';
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2.5 ${isModel ? 'justify-start' : 'justify-end'}`}
            >
              {isModel && (
                <div className="p-1 bg-emerald-500/15 text-emerald-400 rounded-lg mt-0.5 flex-shrink-0">
                  <Bot size={14} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-normal leading-relaxed shadow-lg ${
                  isModel
                    ? theme === 'deep'
                      ? 'bg-slate-900/65 border border-white/5 text-slate-100 rounded-tl-none'
                      : 'bg-white/95 border border-purple-100/50 text-slate-800 rounded-tl-none'
                    : 'bg-emerald-600 text-white rounded-tr-none'
                }`}
              >
                {/* Parse basic markdown like bold dynamically for Vietnamese names or states */}
                <p className="whitespace-pre-line">
                  {msg.content.split('**').map((chunk, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-emerald-400 font-semibold">{chunk}</strong> : chunk
                  )}
                </p>
              </div>
              {!isModel && (
                <div className="p-1 bg-emerald-600/25 text-emerald-300 rounded-lg mt-0.5 flex-shrink-0">
                  <User size={14} />
                </div>
              )}
            </motion.div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="p-1 bg-emerald-500/15 text-emerald-400 rounded-lg flex-shrink-0">
              <Bot size={14} />
            </div>
            <div className={`rounded-2xl px-4 py-3 text-xs flex items-center gap-1.5 ${
              theme === 'deep' ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span className="ml-1 tracking-wide font-medium">AeroGlass AI đang suy nghĩ...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts area */}
      <div className="py-2.5 border-t border-white/5 z-10">
        <span className="text-[10px] block opacity-50 font-bold uppercase tracking-wider mb-2">
          Gợi ý nhanh cho bạn
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(undefined, prompt)}
              className={`text-[10px] px-2.5 py-1.5 rounded-xl border font-medium transition-all text-left cursor-pointer duration-300 hover:scale-[1.02] ${
                theme === 'deep'
                  ? 'bg-white/5 border-white/10 hover:border-emerald-400/45 text-slate-300 hover:bg-emerald-500/5'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-500/45 text-slate-600 hover:bg-emerald-50/50'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls form */}
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/10 pt-3 z-10">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Nhắn tin với Bé Mây Aero (Ví dụ: Đêm nay đi chơi mặc gì?)...`}
          className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${
            theme === 'deep'
              ? 'bg-slate-950/50 border border-white/10 text-white placeholder-slate-500'
              : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
          }`}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3.5 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </GlassCard>
  );
}
