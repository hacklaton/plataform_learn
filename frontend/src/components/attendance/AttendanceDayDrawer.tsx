import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance.api';
import { MonthlyAttendanceDay, AttendanceRecord } from '../../types/attendance.types';
import Badge from '../ui/Badge';
import EditAttendanceModal from './EditAttendanceModal';
import { X, Edit3, Trash2, Calendar, Users } from 'lucide-react';

interface Props {
  day: MonthlyAttendanceDay | null;
  onClose: () => void;
}

export default function AttendanceDayDrawer({ day, onClose }: Props) {
  const queryClient = useQueryClient();
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => attendanceApi.deleteAttendanceRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      setConfirmDelete(null);
    },
  });

  if (!day) return null;

  const statusBadge = (status: string) => {
    if (status === 'PRESENT') return <Badge variant="success">Presente</Badge>;
    if (status === 'ABSENT')  return <Badge variant="error">Ausente</Badge>;
    return <Badge variant="warning">Tarde</Badge>;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#0a0f1e] border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {new Date(day.date + 'T12:00:00').toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {day.records.length} registros · 
                <span className="text-emerald-400">{day.presentCount}P</span> ·
                <span className="text-rose-400">{day.absentCount}A</span> ·
                <span className="text-amber-400">{day.tardyCount}T</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Records list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {day.records.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">No hay registros en este día.</p>
          ) : (
            day.records.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl"
              >
                {/* Delete confirm overlay */}
                {confirmDelete === rec.id ? (
                  <div className="space-y-3">
                    <p className="text-xs text-rose-300 font-medium">
                      ¿Eliminar el registro de <strong>{rec.studentName}</strong>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(rec.id)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600 transition-colors"
                      >
                        {deleteMutation.isPending ? 'Eliminando…' : 'Sí, eliminar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{rec.studentName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{rec.studentCode}</span>
                        <span className="text-slate-700">·</span>
                        <span className="text-xs text-slate-500">
                          {new Date(rec.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-slate-700">·</span>
                        <span className="text-[10px] text-slate-600 uppercase">{rec.method}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {statusBadge(rec.status)}
                      <button
                        onClick={() => setEditRecord(rec)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(rec.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit modal stacked above drawer */}
      {editRecord && (
        <EditAttendanceModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
        />
      )}
    </>
  );
}
