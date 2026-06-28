import React from 'react';
import { motion } from 'motion/react';
import { ThemeMode } from '../types';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  theme?: ThemeMode;
  hoverEffect?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  id?: string;
}

export default function GlassCard({
  children,
  className = '',
  theme = 'deep',
  hoverEffect = false,
  onClick,
  onDoubleClick,
  id,
}: GlassCardProps) {
  // Styles based on theme: deep navy vs pastel
  const themeStyles =
    theme === 'deep'
      ? 'bg-[#1e293b]/30 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-950/40 text-slate-100'
      : 'bg-white/40 backdrop-blur-xl border border-pink-100/40 shadow-xl shadow-pink-100/20 text-slate-800';

  const motionProps = hoverEffect
    ? {
        whileHover: { y: -4, scale: 1.01, borderColor: theme === 'deep' ? 'rgba(255,255,255,0.2)' : 'rgba(236,72,153,0.3)' },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <motion.div
      id={id}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...motionProps}
      className={`glass-card rounded-3xl p-6 ${themeStyles} ${onClick || onDoubleClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
