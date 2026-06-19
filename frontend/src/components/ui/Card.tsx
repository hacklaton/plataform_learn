import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'glass' | 'flat';
  glow?: 'primary' | 'emerald' | 'rose' | 'none';
}

export default function Card({
  children,
  variant = 'glass',
  glow = 'none',
  className = '',
  ...props
}: CardProps) {
  const glowClasses = {
    primary: 'glow-primary',
    emerald: 'glow-emerald',
    rose: 'glow-rose',
    none: '',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${
        variant === 'glass' ? 'glass-card' : 'bg-slate-900/40 border border-slate-800/60'
      } ${glowClasses[glow]} p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
