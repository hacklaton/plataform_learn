import { useQuery } from '@tanstack/react-query';
import { academicApi } from '../../api/academic.api';
import { notificationsApi } from '../../api/notifications.api';
import { attendanceApi } from '../../api/attendance.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CHART_DATA = [
  { name: 'Lun', asistencia: 92.4 },
  { name: 'Mar', asistencia: 94.1 },
  { name: 'Mie', asistencia: 89.8 },
  { name: 'Jue', asistencia: 95.3 },
  { name: 'Vie', asistencia: 91.2 },
];

export default function Dashboard() {
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => academicApi.getStudents(),
    refetchInterval: 30000, // Revalidate every 30s as specified
  });

  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => notificationsApi.getAlerts(),
    refetchInterval: 30000,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => academicApi.getCourses(),
  });

  const { data: biometricLogs } = useQuery({
    queryKey: ['biometric-logs'],
    queryFn: () => attendanceApi.getLiveLogs(),
    refetchInterval: 10000, // Refresh biometric logs more often (10s)
  });

  if (loadingStudents || loadingAlerts || loadingCourses) {
    return <LoadingSpinner />;
  }

  // Calculate statistics
  const totalStudents = students?.length || 0;
  const avgAttendance = students
    ? Math.round(students.reduce((acc, curr) => acc + curr.attendanceRate, 0) / totalStudents)
    : 0;
  const criticalRiskCount = students?.filter((s) => s.riskStatus === 'CRITICAL').length || 0;
  const coursesCount = courses?.length || 0;

  const recentAlerts = alerts?.slice(0, 3) || [];
  const recentBioLogs = biometricLogs?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0">
            Panel General
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisión automatizada de inasistencias y riesgos mediante agentes inteligentes.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-450 bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          Actualizado: Hace unos instantes
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Alumnos"
          value={totalStudents}
          icon={Users}
          description="Matriculados en periodo activo"
          trend={{ value: "+2.1%", type: "up" }}
        />
        <StatCard
          title="Asistencia Promedio"
          value={`${avgAttendance}%`}
          icon={CalendarCheck}
          description="Porcentaje semanal global"
          trend={{ value: "-0.5%", type: "down" }}
          glow={avgAttendance < 80 ? "rose" : avgAttendance > 90 ? "emerald" : "none"}
        />
        <StatCard
          title="Casos Críticos"
          value={criticalRiskCount}
          icon={AlertTriangle}
          description="Alumnos con riesgo crítico"
          trend={{ value: criticalRiskCount > 0 ? "Atención" : "Limpio", type: criticalRiskCount > 0 ? "down" : "neutral" }}
          glow={criticalRiskCount > 0 ? "rose" : "none"}
        />
        <StatCard
          title="Materias Activas"
          value={coursesCount}
          icon={BookOpen}
          description="Cursos asignados al docente"
          trend={{ value: "Ok", type: "neutral" }}
        />
      </div>

      {/* Main visual sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100 font-display">
              Tendencia de Asistencia Semanal
            </h3>
            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Filtro: General
            </span>
          </div>

          <div className="h-64 w-full text-slate-400 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" domain={[80, 100]} fontSize={11} tickLine={false} />
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
                  dataKey="asistencia"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#attendanceGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live biometric logs */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100 font-display">
              Monitoreo Facial En Vivo
            </h3>
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              En Vivo
            </span>
          </div>

          <div className="space-y-3">
            {recentBioLogs.length > 0 ? (
              recentBioLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500'
                          : log.status === 'UNKNOWN'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    ></div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-200 truncate">
                        {log.studentName || 'Rostro No Reconocido'}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {log.studentCode ? `Código: ${log.studentCode}` : 'Identidad Anónima'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-slate-300">
                      {log.confidence ? `${log.confidence}%` : 'N/A'}
                    </span>
                    <p className="text-[9px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No hay logs de escaneo facial hoy.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Alerts and Academics lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Active Alerts */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100 font-display">
              Últimas Alertas Emitidas
            </h3>
            <Badge variant="critical">{recentAlerts.filter((a) => !a.isRead).length} Nuevas</Badge>
          </div>

          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.level.toLowerCase() as any}>{alert.level}</Badge>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      {alert.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{alert.title}</h4>
                  <p className="text-xs text-slate-400">{alert.description}</p>
                </div>
                <div className="text-right text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Course Milestones list */}
        <Card className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100 font-display">
              Progreso Curricular de Materias
            </h3>
            <span className="text-xs text-slate-450 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sincronizado
            </span>
          </div>

          <div className="space-y-4">
            {courses?.slice(0, 3).map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{course.name}</span>
                    <span className="text-slate-500 text-[10px] ml-2">({course.code})</span>
                  </div>
                  <span className="font-bold text-indigo-400">{course.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
