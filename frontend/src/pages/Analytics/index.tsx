import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  TrendingUp,
  AlertTriangle,
  BrainCircuit,
  HelpCircle,
  Network
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

export default function Analytics() {
  const { data: scatterData, isLoading: loadingScatter } = useQuery({
    queryKey: ['analytics-scatter'],
    queryFn: () => analyticsApi.getCorrelationData(),
  });

  const { data: clusters, isLoading: loadingClusters } = useQuery({
    queryKey: ['analytics-clusters'],
    queryFn: () => analyticsApi.getClusters(),
  });

  const { data: greyZone, isLoading: loadingGrey } = useQuery({
    queryKey: ['analytics-grey-zone'],
    queryFn: () => analyticsApi.getGreyZoneStudents(),
  });

  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => analyticsApi.getHistoricalTrends(),
  });

  if (loadingScatter || loadingClusters || loadingGrey || loadingTrends) {
    return <LoadingSpinner />;
  }

  // Helper colors for risk
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return '#10b981'; // emerald
      case 'MODERATE':
        return '#f59e0b'; // amber
      case 'CRITICAL':
        return '#f43f5e'; // rose
      default:
        return '#6366f1'; // indigo
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0 flex items-center gap-2">
            Análisis Predictivo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detección de patrones de abandono y deserción escolar mediante el agente predictivo de Machine Learning.
          </p>
        </div>
      </div>

      {/* Analytics charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter correlation plot */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              Correlación Asistencia vs Rendimiento (GPA)
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">
              Modelo: clustering k-means
            </span>
          </div>

          <div className="h-64 w-full text-slate-400 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" />
                <XAxis
                  type="number"
                  dataKey="attendance"
                  name="Asistencia"
                  unit="%"
                  stroke="#64748b"
                  domain={[30, 100]}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="gpa"
                  name="Ponderado (GPA)"
                  stroke="#64748b"
                  domain={[0.0, 5.0]}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                  }}
                  formatter={(value: any, name?: any) => [value, name]}
                />
                <Scatter name="Estudiantes" data={scatterData}>
                  {scatterData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center gap-6 text-[10px] font-semibold text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Riesgo Bajo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Riesgo Moderado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Riesgo Crítico
            </span>
          </div>
        </Card>

        {/* Historical trends chart */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Tasa Histórica y Proyección de Deserción
            </h3>
            <Badge variant="info">Predicción AI activa</Badge>
          </div>

          <div className="h-64 w-full text-slate-400 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" />
                <XAxis dataKey="year" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" domain={[0, 15]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="desertionRate"
                  name="Deserción (%)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="retentionRate"
                  name="Retención (%)"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Clusters and Grey Zone lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk clusters overview */}
        <Card className="space-y-4 lg:col-span-1">
          <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            Grupos de Clustering
          </h3>
          <p className="text-xs text-slate-500">
            Clusters formados automáticamente basados en indicadores de comportamiento.
          </p>

          <div className="space-y-3 pt-2">
            {clusters?.map((cluster, i) => (
              <div
                key={i}
                className="p-3.5 bg-slate-900/30 border border-slate-800/40 rounded-xl space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200 font-display">{cluster.name}</span>
                  <span className="font-bold text-slate-400 font-mono">{cluster.size} alumnos</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                  <div>
                    Asistencia Prom: <strong className="text-slate-350">{cluster.avgAttendance}%</strong>
                  </div>
                  <div>
                    Nota Promedio: <strong className="text-slate-350">{cluster.avgGpa}/5.0</strong>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-850 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(cluster.size / 71) * 100}%`,
                      backgroundColor: cluster.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Grey zone table checklist */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas de Zona Gris (Casos Anómalos)
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">
              Requieren atención docente
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Estudiantes cuyos patrones de asistencia y rendimiento no se correlacionan linealmente. Indican problemas latentes no obvios.
          </p>

          <div className="space-y-3 pt-2">
            {greyZone?.map((anomaly, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-start gap-4 text-xs"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-200">{anomaly.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Asistencia: {anomaly.attendanceRate}% | Promedio: {anomaly.gpa}
                    </span>
                  </div>
                  <p className="text-slate-450 leading-relaxed">{anomaly.anomalyReason}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
