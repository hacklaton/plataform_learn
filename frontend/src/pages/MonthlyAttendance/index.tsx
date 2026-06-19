import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance.api';
import { MonthlyAttendanceDay } from '../../types/attendance.types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AttendanceDayDrawer from '../../components/attendance/AttendanceDayDrawer';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  CalendarCheck,
  CalendarX,
  Clock,
  Filter,
} from 'lucide-react';

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const WEEKDAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function buildCalendarGrid(year: number, month: number, data: MonthlyAttendanceDay[]) {
  const byDate: Record<string, MonthlyAttendanceDay> = {};
  data.forEach((d) => { byDate[d.date] = d; });

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (MonthlyAttendanceDay | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null); // blank padding
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push(byDate[key] ?? {
      date: key, records: [],
      presentCount: 0, absentCount: 0, tardyCount: 0,
    });
  }
  return cells;
}

export default function MonthlyAttendance() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<MonthlyAttendanceDay | null>(null);

  const { data: monthData = [], isLoading } = useQuery({
    queryKey: ['monthly-attendance', year, month, roleFilter],
    queryFn: () => attendanceApi.getMonthlyAttendance(year, month, roleFilter || undefined),
  });

  const { data: summary } = useQuery({
    queryKey: ['monthly-summary', year, month],
    queryFn: () => attendanceApi.getMonthlySummary(year, month),
  });

  const goBack = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const goForward = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const calendarCells = buildCalendarGrid(year, month, monthData);

  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0">
            Asistencia Mensual
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control de asistencia con vista de calendario. Haz clic en un día para ver y editar los registros.
          </p>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-2">
          <button
            onClick={goBack}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white min-w-[140px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={goForward}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <TrendingUp className="w-5 h-5 text-indigo-400" />,
            label: 'Tasa de Asistencia',
            value: summary ? `${summary.attendanceRate}%` : '—',
            color: 'bg-indigo-500/10',
          },
          {
            icon: <CalendarCheck className="w-5 h-5 text-emerald-400" />,
            label: 'Presentes',
            value: summary?.presentCount ?? '—',
            color: 'bg-emerald-500/10',
          },
          {
            icon: <CalendarX className="w-5 h-5 text-rose-400" />,
            label: 'Ausentes',
            value: summary?.absentCount ?? '—',
            color: 'bg-rose-500/10',
          },
          {
            icon: <Clock className="w-5 h-5 text-amber-400" />,
            label: 'Tardanzas',
            value: summary?.tardyCount ?? '—',
            color: 'bg-amber-500/10',
          },
        ].map((kpi, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shrink-0 ${kpi.color}`}>{kpi.icon}</div>
            <div>
              <p className="text-xs text-slate-400">{kpi.label}</p>
              <p className="text-xl font-bold text-white font-display">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="text-xs text-slate-400 shrink-0">Filtrar por:</span>
        {['', 'STUDENT', 'TEACHER'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              roleFilter === r
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/60'
            }`}
          >
            {r === '' ? 'Todos' : r === 'STUDENT' ? 'Estudiantes' : 'Profesores'}
          </button>
        ))}
        <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-500">
          <Users className="w-3.5 h-3.5" />
          {summary?.totalRecords ?? 0} registros en el mes
        </div>
      </div>

      {/* Calendar grid */}
      <Card className="p-0 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-800">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {wd}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={`blank-${idx}`}
                    className="aspect-square border-r border-b border-slate-800/50 last:border-r-0 bg-slate-950/30"
                  />
                );
              }

              const isToday = cell.date === today;
              const hasRecords = cell.records.length > 0;
              const dayNum = parseInt(cell.date.slice(8));

              return (
                <button
                  key={cell.date}
                  onClick={() => hasRecords && setSelectedDay(cell)}
                  className={`aspect-square border-r border-b border-slate-800/50 last:border-r-0 p-1.5 flex flex-col items-start transition-all
                    ${hasRecords ? 'hover:bg-slate-800/40 cursor-pointer' : 'cursor-default'}
                    ${isToday ? 'bg-indigo-950/30' : ''}
                  `}
                >
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1
                      ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    {dayNum}
                  </span>
                  {hasRecords && (
                    <div className="w-full space-y-0.5">
                      {cell.presentCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-[10px] text-emerald-400 leading-none">{cell.presentCount}</span>
                        </div>
                      )}
                      {cell.absentCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span className="text-[10px] text-rose-400 leading-none">{cell.absentCount}</span>
                        </div>
                      )}
                      {cell.tardyCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-[10px] text-amber-400 leading-none">{cell.tardyCount}</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>Leyenda:</span>
        {[
          { color: 'bg-emerald-500', label: 'Presente' },
          { color: 'bg-rose-500', label: 'Ausente' },
          { color: 'bg-amber-500', label: 'Tarde' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
        <span className="ml-2 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] text-white font-bold">H</span>
          Hoy
        </span>
      </div>

      {/* Day Drawer */}
      <AttendanceDayDrawer
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
