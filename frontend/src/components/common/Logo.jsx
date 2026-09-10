import React from 'react';
import logoImg from '../../assets/logo.png';

/**
 * Reusable EkJagah Brand Logo Component
 * Incorporates the official neon indigo/violet Hindi "ए" + "J" emblem.
 */
export const Logo = ({ 
  size = 'md', 
  showText = true, 
  textSub = true, 
  variant = 'light', // 'light' (default on light backgrounds) or 'dark' (on dark backgrounds)
  className = '' 
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', img: 'w-6 h-6', text: 'text-sm', sub: 'text-[8px]' },
    sm: { box: 'w-8 h-8', img: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10', img: 'w-10 h-10', text: 'text-xl', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', img: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', img: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm' },
  };

  const current = sizeMap[size] || sizeMap.md;
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className={`${current.box} rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-slate-800/60 flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
      >
        <img 
          src={logoImg} 
          alt="EkJagah Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${current.text} font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} leading-none`}>
            Ek<span className="text-brand-600">Jagah</span>
          </span>
          {textSub && (
            <span className={`${current.sub} font-semibold ${isDark ? 'text-slate-400' : 'text-slate-400'} tracking-wider mt-0.5`}>
              Your Career, All in One Place
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
