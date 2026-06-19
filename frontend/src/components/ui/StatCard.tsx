import { LucideIcon } from 'lucide-react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'neutral';
  };
  glow?: 'primary' | 'emerald' | 'rose' | 'none';
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  glow = 'none'
}: StatCardProps) {
  return (
    <Card glow={glow} className="relative overflow-hidden group hover:scale-[1.01] transition-transform duration-200">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-bold text-white mt-2 font-display tracking-tight">{value}</h3>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-750/30 text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {trend || description ? (
        <div className="mt-4 flex items-center gap-2">
          {trend ? (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              trend.type === 'up' 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : trend.type === 'down' 
                ? 'bg-rose-500/10 text-rose-450' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              {trend.value}
            </span>
          ) : null}
          {description ? (
            <span className="text-xs text-slate-500 truncate">{description}</span>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
