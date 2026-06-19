import { useQuery } from '@tanstack/react-query';
import { iaApi } from '../../../api/ia.api';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Estudiante demo: Mateo Vásquez (perfil en riesgo, ideal para la demo)
const DEMO_STUDENT_ID = 'std-4';

const OUTLOOK_CONFIG = {
  POSITIVE: { label: 'Proyección Positiva', badge: 'success' as const, glow: 'emerald' as const, stroke: '#10b981' },
  NEUTRAL: { label: 'Proyección Estable', badge: 'info' as const, glow: 'primary' as const, stroke: '#6366f1' },
  AT_RISK: { label: 'Proyección en Riesgo', badge: 'critical' as const, glow: 'rose' as const, stroke: '#f43f5e' },
};

export default function RoutinePrediction() {
  const { data: projection, isLoading } = useQuery({
    queryKey: ['routine-projection', DEMO_STUDENT_ID],
    queryFn: () => iaApi.getRoutineProjection(DEMO_STUDENT_ID),
  });

  if (isLoading || !projection) {
    return <LoadingSpinner />;
  }

  const cfg = OUTLOOK_CONFIG[projection.outlook];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Predicción de Rutina
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Proyección de fin de año generada por el agente de IA a partir de tus notas y tu rutina diaria.
          </p>
        </div>
        <Badge variant={cfg.badge}>{cfg.label}</Badge>
      </div>

      {/* Resumen del agente */}
      <Card glow={cfg.glow} className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-bold text-white font-display">{projection.headline}</h3>
          <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
            Confianza del modelo: {projection.confidence}%
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{projection.summary}</p>
      </Card>

      {/* Gráfico de proyección */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-display">
          Trayectoria Proyectada (Promedio)
        </h3>
        <div className="h-64 w-full text-slate-400 text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projection.timeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="routineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cfg.stroke} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={cfg.stroke} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" domain={[0, 5]} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
              <Area
                type="monotone"
                dataKey="projectedGpa"
                name="Promedio proyectado"
                stroke={cfg.stroke}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#routineGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Hábitos detectados */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-display">
          Hábitos Detectados por el Agente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projection.habits.map((habit, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-start gap-3 text-xs"
            >
              <div
                className={`mt-0.5 shrink-0 ${
                  habit.impact === 'POSITIVE' ? 'text-emerald-400' : 'text-rose-450'
                }`}
              >
                {habit.impact === 'POSITIVE' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-200">{habit.label}</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">{habit.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
