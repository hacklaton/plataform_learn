import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance.api';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance.types';
import Button from '../ui/Button';
import { Edit3, X } from 'lucide-react';

interface Props {
  record: AttendanceRecord;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'PRESENT', label: '✅ Presente', color: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' },
  { value: 'ABSENT',  label: '❌ Ausente',  color: 'bg-rose-500/10 border-rose-500/40 text-rose-400' },
  { value: 'TARDY',   label: '⚠️ Tarde',    color: 'bg-amber-500/10 border-amber-500/40 text-amber-400' },
];

export default function EditAttendanceModal({ record, onClose }: Props) {
  const [selected, setSelected] = useState<AttendanceStatus>(record.status);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => attendanceApi.updateAttendanceRecord(record.id, selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0d1424] border border-slate-700/60 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">Editar Registro</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Estudiante / Docente</p>
            <p className="text-sm font-semibold text-white">{record.studentName}</p>
            <p className="text-xs text-slate-500">{record.studentCode} · {new Date(record.timestamp).toLocaleString('es-CO')}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Cambiar estado a:</p>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  selected === opt.value
                    ? opt.color + ' ring-1 ring-current'
                    : 'border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={onClose} className="flex-1 text-xs">
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || selected === record.status}
              className="flex-1 text-xs"
            >
              {updateMutation.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>

          {updateMutation.isError && (
            <p className="text-xs text-rose-400 text-center">Error al actualizar. Intenta de nuevo.</p>
          )}
        </div>
      </div>
    </div>
  );
}
