import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'low' | 'moderate' | 'critical' | 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export default function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const styles = {
    low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    moderate: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    critical: 'bg-rose-500/10 text-rose-450 border border-rose-500/20',
    error: 'bg-rose-500/10 text-rose-450 border border-rose-500/20',
    info: 'bg-indigo-500/10 text-indigo-450 border border-indigo-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
