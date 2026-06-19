import { useQuery } from '@tanstack/react-query';
import { gradesApi } from '../../../api/grades.api';
import { attendanceApi } from '../../../api/attendance.api';
import StatCard from '../../../components/ui/StatCard';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Award, CalendarCheck, Clock, BookOpen, GraduationCap } from 'lucide-react';

// Historial de asistencia biométrica: aún simulado (no hay modelo real todavía).
const DEMO_ATTENDANCE_STUDENT_ID = 'std-4';

export default function StudentAcademic() {
  // Notas REALES: el backend filtra automáticamente a las del alumno autenticado.
  const { data: grades, isLoading: loadingGrades } = useQuery({
    queryKey: ['my-grades'],
    queryFn: () => gradesApi.list(),
  });

  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['student-attendance', DEMO_ATTENDANCE_STUDENT_ID],
    queryFn: () => attendanceApi.getAttendanceRecords(),
  });

  if (loadingGrades || loadingRecords) {
    return <LoadingSpinner />;
  }

  const myRecords = (records || []).filter((r) => r.studentId === DEMO_ATTENDANCE_STUDENT_ID);
  const tardyCount = myRecords.filter((r) => r.status === 'TARDY').length;
  const presentCount = myRecords.filter((r) => r.status === 'PRESENT').length;
  const totalRecords = myRecords.length || 1;
  const attendancePct = Math.round((presentCount / totalRecords) * 100);

  const avgGrade =
    grades && grades.length > 0
      ? (grades.reduce((acc, g) => acc + g.value, 0) / grades.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            Mi Académico e Historial
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Notas actuales (en tiempo real) e historial de asistencia del sistema biométrico.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Promedio Actual"
          value={avgGrade}
          icon={Award}
          description="Sobre tus evaluaciones registradas"
          glow={Number(avgGrade) < 3.0 ? 'rose' : Number(avgGrade) > 4.0 ? 'emerald' : 'none'}
        />
        <StatCard
          title="Asistencia"
          value={`${attendancePct}%`}
          icon={CalendarCheck}
          description="Registrada por cámara biométrica"
          glow={attendancePct < 70 ? 'rose' : 'none'}
        />
        <StatCard
          title="Llegadas Tarde"
          value={tardyCount}
          icon={Clock}
          description="Tardanzas detectadas este periodo"
          trend={{ value: tardyCount > 0 ? 'Revisar' : 'Ok', type: tardyCount > 0 ? 'down' : 'neutral' }}
          glow={tardyCount > 2 ? 'rose' : 'none'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notas actuales (reales) */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Notas Actuales
          </h3>

          <div className="space-y-3">
            {grades && grades.length > 0 ? (
              grades.map((grd) => (
                <div
                  key={grd.id}
                  className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl flex justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-200">{grd.course.title}</p>
                    <span className="text-[10px] text-slate-500">
                      {grd.assessmentName} ({grd.weight}%)
                    </span>
                    {grd.feedback ? (
                      <p className="text-[11px] text-slate-500 leading-relaxed">{grd.feedback}</p>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-bold font-mono text-sm ${
                        grd.value < 3.0 ? 'text-rose-450' : 'text-indigo-400'
                      }`}
                    >
                      {grd.value.toFixed(1)}
                    </span>
                    <p className="text-[9px] text-slate-500">
                      {new Date(grd.createdAt).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Aún no tienes notas registradas.</p>
            )}
          </div>
        </Card>

        {/* Historial de asistencia / tardanzas */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-400" />
            Historial de Asistencia
          </h3>
          <p className="text-xs text-slate-500">
            Registros automáticos capturados por las cámaras del sistema biométrico.
          </p>

          <div className="space-y-3">
            {myRecords.length > 0 ? (
              myRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-500'
                          : rec.status === 'TARDY'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    ></div>
                    <div>
                      <p className="font-semibold text-slate-200">
                        {new Date(rec.timestamp).toLocaleDateString('es-CO', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {rec.method === 'BIOMETRIC' ? 'Cámara biométrica' : 'Registro manual'}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      rec.status === 'PRESENT' ? 'success' : rec.status === 'TARDY' ? 'warning' : 'error'
                    }
                  >
                    {rec.status === 'PRESENT' ? 'Presente' : rec.status === 'TARDY' ? 'Tarde' : 'Ausente'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No hay registros de asistencia todavía.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
