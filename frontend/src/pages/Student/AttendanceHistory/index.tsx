import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth.store';
import { attendanceApi } from '../../../api/attendance.api';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import BiometricEnrollModal from '../../../components/attendance/BiometricEnrollModal';
import {
  ChevronLeft,
  ChevronRight,
  ScanFace,
  TrendingUp,
  CalendarCheck,
  CalendarX,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

export default function StudentAttendanceHistory() {
  const user = useAuthStore((s: any) => s.user);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showEnroll, setShowEnroll] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['user-attendance-summary', user?.id, year, month],
    queryFn: () => attendanceApi.getUserAttendanceSummary(user!.id, year, month),
    enabled: !!user?.id,
  });

  const goBack = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const goForward = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const statusIcon = (status: string) => {
    if (status === 'PRESENT') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === 'ABSENT')  return <XCircle className="w-4 h-4 text-rose-400" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

  const statusBadge = (status: string) => {
    if (status === 'PRESENT') return <Badge variant="success">Presente</Badge>;
    if (status === 'ABSENT')  return <Badge variant="error">Ausente</Badge>;
    return <Badge variant="warning">Tarde</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0">
            Mi Asistencia
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Consulta tu historial mensual de asistencia y gestiona tu dato biométrico.
          </p>
        </div>
        <button
          onClick={() => setShowEnroll(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-sm font-medium hover:bg-indigo-600/30 transition-all shrink-0"
        >
          <ScanFace className="w-4 h-4" />
          Registrar / Actualizar mi Rostro
        </button>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goBack}
          className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-lg font-bold text-white min-w-[180px] text-center font-display">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          onClick={goForward}
          className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : summary ? (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                icon: <TrendingUp className="w-5 h-5 text-indigo-400" />,
                label: '% Asistencia',
                value: `${summary.attendanceRate}%`,
                color: 'bg-indigo-500/10',
                textColor:
                  summary.attendanceRate >= 80
                    ? 'text-emerald-400'
                    : summary.attendanceRate >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400',
              },
              {
                icon: <CalendarCheck className="w-5 h-5 text-emerald-400" />,
                label: 'Días Presente',
                value: summary.daysPresent,
                color: 'bg-emerald-500/10',
                textColor: 'text-white',
              },
              {
                icon: <CalendarX className="w-5 h-5 text-rose-400" />,
                label: 'Días Ausente',
                value: summary.daysAbsent,
                color: 'bg-rose-500/10',
                textColor: 'text-white',
              },
              {
                icon: <Clock className="w-5 h-5 text-amber-400" />,
                label: 'Tardanzas',
                value: summary.daysTardy,
                color: 'bg-amber-500/10',
                textColor: 'text-white',
              },
            ].map((kpi, i) => (
              <Card key={i} className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${kpi.color}`}>{kpi.icon}</div>
                <div>
                  <p className="text-xs text-slate-400">{kpi.label}</p>
                  <p className={`text-xl font-bold font-display ${kpi.textColor}`}>{kpi.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Attendance Rate Bar */}
          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-white">Porcentaje del mes</span>
              <span className="text-sm font-bold text-indigo-400">{summary.attendanceRate}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  summary.attendanceRate >= 80
                    ? 'bg-emerald-500'
                    : summary.attendanceRate >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${summary.attendanceRate}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {summary.attendanceRate >= 80
                ? '✅ Excelente asistencia. ¡Sigue así!'
                : summary.attendanceRate >= 60
                ? '⚠️ Asistencia en riesgo. Trata de mejorar.'
                : '🚨 Asistencia crítica. Habla con tu tutor.'}
            </p>
          </Card>

          {/* Records list */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-400" />
              Registros del mes ({summary.records.length})
            </h3>

            {summary.records.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">
                No tienes registros de asistencia en este mes.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {summary.records.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(rec.status)}
                      <div>
                        <p className="text-xs font-medium text-slate-200">
                          {new Date(rec.timestamp).toLocaleDateString('es-CO', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(rec.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          <span className="uppercase">{rec.method}</span>
                        </p>
                      </div>
                    </div>
                    {statusBadge(rec.status)}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card className="text-center py-12">
          <CalendarX className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No se encontraron datos para este mes.</p>
        </Card>
      )}

      {/* Biometric enroll modal */}
      {showEnroll && <BiometricEnrollModal onClose={() => setShowEnroll(false)} />}
    </div>
  );
}
