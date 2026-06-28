import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Lock, User, Github, Compass, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile, ThemeMode } from '../types';
import GlassCard from './GlassCard';

interface AuthModalProps {
  theme: ThemeMode;
  onLoginSuccess: (user: UserProfile) => void;
  onClose: () => void;
}

export default function AuthModal({ theme, onLoginSuccess, onClose }: AuthModalProps) {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isForgotPassword) {
      if (!validateEmail(formData.email)) {
        setError('Vui lòng nhập địa chỉ email hợp lệ.');
        return;
      }
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess('Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      }
      return;
    }

    if (isRegister) {
      if (!formData.name) {
        setError('Họ và tên không được để trống.');
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('Vui lòng nhập địa chỉ email hợp lệ.');
        return;
      }
      if (formData.phone && !/^\d{10,11}$/.test(formData.phone)) {
        setError('Số điện thoại phải từ 10 - 11 chữ số.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Xác nhận mật khẩu không trùng khớp.');
        return;
      }

      // Call Supabase SignUp Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
          }
        }
      });

      if (signUpError) {
        setError(`Lỗi đăng ký: ${signUpError.message}`);
        return;
      }

      // Push custom log to Supabase for admin notifications
      // Admin should create table "admin_auth_logs" with columns: id, action, email, name, created_at
      const { error: insertError1 } = await supabase.from('admin_auth_logs').insert([
        { action: 'register', email: formData.email, name: formData.name }
      ]);
      if (insertError1) console.warn("Log warning:", insertError1.message);

      const mockUser: UserProfile = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(formData.name)}`,
        isLoggedIn: true,
        provider: 'email',
      };
      
      setSuccess('Đăng ký tài khoản thành công! Đang đăng nhập...');
      setTimeout(() => {
        onLoginSuccess(mockUser);
        onClose();
      }, 1000);
    } else {
      // Login mode validation
      if (!validateEmail(formData.email)) {
        setError('Email tài khoản không hợp lệ.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Mật khẩu của bạn phải có ít nhất 6 chữ số.');
        return;
      }

      // Call Supabase SignIn Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(`Đăng nhập thất bại: ${signInError.message}`);
        return;
      }

      // Push custom log to Supabase for admin notifications
      const { error: insertError2 } = await supabase.from('admin_auth_logs').insert([
        { action: 'login', email: formData.email, name: data.user?.user_metadata?.full_name || 'User' }
      ]);
      if (insertError2) console.warn("Log warning:", insertError2.message);

      const userName = data.user?.user_metadata?.full_name || formData.email.split('@')[0].toUpperCase();
      const mockUser: UserProfile = {
        name: userName,
        email: formData.email,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(formData.email)}`,
        isLoggedIn: true,
        provider: 'email',
      };
      
      setSuccess('Đăng nhập thành công! Đang tải trải nghiệm...');
      setTimeout(() => {
        onLoginSuccess(mockUser);
        onClose();
      }, 1000);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setSuccess(`Đang kết nối tài khoản mã hoá qua ${provider === 'google' ? 'Google' : 'Facebook'}...`);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });
    
    if (error) {
      setError(`Lỗi xác thực OAuth: ${error.message}`);
      return;
    }
    
    // In OAuth, redirection usually happens before reaching this code because it navigates
    // However, if we were handling the session later, we would emit onLoginSuccess then.
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md relative"
      >
        <GlassCard theme={theme} className="border border-white/10 p-8 shadow-2xl relative">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 text-sm bg-white/5 rounded-full hover:bg-white/10"
          >
            Đóng ✕
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-lime-400/10 text-lime-400 flex items-center justify-center rounded-2xl border border-lime-400/20 mb-3">
              <Compass className="animate-spin text-[#FFFF00]" style={{ animationDuration: '10s' }} />
            </div>
            <h3 className={`text-xl font-bold ${theme === 'deep' ? 'text-white' : 'text-slate-900'}`}>
              {isForgotPassword 
                ? 'Khôi Phục Mật Khẩu' 
                : isRegister 
                ? 'Đăng Ký AeroGlass Account' 
                : 'Đăng Nhập AeroGlass Account'}
            </h3>
            <p className="text-xs opacity-60 mt-1">
              {isForgotPassword 
                ? 'Nhập email để nhận mã liên kết khôi phục' 
                : 'Đồng bộ hóa các thành phố yêu thích của bạn lên mây'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-100 border border-red-500/30 rounded-xl text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={14} />
              {success}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-medium">
            {isRegister && (
              <div>
                <label className="block mb-1 px-1 opacity-80">Họ và Tên</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 opacity-50"><User size={14} /></span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-slate-100 placeholder-slate-400 outline-none focus:border-[#FFFF00]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1 px-1 opacity-80">Địa Chỉ Email</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 opacity-50"><Mail size={14} /></span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-slate-100 placeholder-slate-400 outline-none focus:border-[#FFFF00]"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block mb-1 px-1 opacity-80">Số điện thoại (Tuỳ chọn)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 opacity-50"><Phone size={14} /></span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0912345678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-slate-100 placeholder-slate-400 outline-none focus:border-[#FFFF00]"
                  />
                </div>
              </div>
            )}

            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1 px-1">
                  <label className="opacity-80">Mật khẩu</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 opacity-50"><Lock size={14} /></span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="• • • • • • • •"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-slate-100 placeholder-slate-400 outline-none focus:border-[#FFFF00]"
                    required
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block mb-1 px-1 opacity-80">Xác Nhận Mật khẩu</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 opacity-50"><Lock size={14} /></span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="• • • • • • • •"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-slate-100 placeholder-slate-400 outline-none focus:border-[#FFFF00]"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#FFFF00] to-emerald-400 rounded-xl text-slate-900 font-bold hover:scale-102 transition-transform shadow-lg cursor-pointer"
            >
              {isForgotPassword 
                ? 'Gửi Yêu Cầu Khôi Phục' 
                : isRegister 
                ? 'Đăng Ký Tài Khoản' 
                : 'Đăng Nhập'}
            </button>
          </form>

          {/* Social login divider */}
          {!isForgotPassword && (
            <>
              <div className="relative my-6 text-center">
                <span className="absolute inset-x-0 top-1/2 border-b border-white/10 -z-10"></span>
                <span className={`px-2.5 text-[10px] uppercase tracking-wider opacity-50 ${theme === 'deep' ? 'bg-slate-900' : 'bg-[#fbf4fa]'}`}>
                  Hoặc đăng nhập bằng
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  className="flex items-center justify-center gap-2 py-2 px-3 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl transition-all font-semibold"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.41 0-6.173-2.763-6.173-6.173s2.763-6.173 6.173-6.173c1.554 0 2.972.58 4.07 1.543l3.076-3.075C19.167 2.19 15.932 1 12.24 1 6.046 1 1 6.046 1 12.24s5.046 11.24 11.24 11.24c5.8 0 10.74-4.22 10.74-11.24 0-.668-.06-1.31-.17-1.955H12.24z"/>
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleOAuthLogin('facebook')}
                  className="flex items-center justify-center gap-2 py-2 px-3 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl transition-all font-semibold"
                >
                  <svg className="w-4 h-4 fill-blue-500" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </>
          )}

          {/* Switch flow at bottom */}
          <div className="mt-6 text-center text-xs">
            {isForgotPassword ? (
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-emerald-400 hover:underline"
              >
                ← Quay lại đăng nhập
              </button>
            ) : isRegister ? (
              <p className="opacity-80">
                Đã có tài khoản?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Đăng nhập ngay
                </button>
              </p>
            ) : (
              <p className="opacity-80">
                Chưa có tài khoản?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Tạo tài khoản mới
                </button>
              </p>
            )}
          </div>

        </GlassCard>
      </motion.div>
    </div>
  );
}
