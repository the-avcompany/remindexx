
import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

export const LogoRemindex: React.FC<LogoProps> = ({ variant = 'full', className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon Mark - Only show if explicitly asking for icon only */}
      {variant === 'icon' && (
        <div className="w-8 h-8 rounded-lg bg-current opacity-20 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-current"></div>
        </div>
      )}
      
      {/* Wordmark - Render for 'full' or 'text' */}
      {(variant === 'full' || variant === 'text') && (
        <span className="font-bold text-2xl tracking-tight leading-none">
          Remindex
        </span>
      )}
    </div>
  );
};
