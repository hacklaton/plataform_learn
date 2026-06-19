import { CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import { TopicCandidate } from '../../types/teacherWorkflow.types';

interface TopicCardProps {
  topic: TopicCandidate;
  onSelect: (topicId: string) => void;
  onDiscard: (topicId: string) => void;
  onReset: (topicId: string) => void;
  disabled?: boolean;
}

const difficultyVariant = {
  BASICO: 'success',
  INTERMEDIO: 'warning',
  AVANZADO: 'error',
} as const;

export default function TopicCard({ topic, onSelect, onDiscard, onReset, disabled }: TopicCardProps) {
  const isSelected = topic.estado === 'SELECCIONADO';
  const isDiscarded = topic.estado === 'DESCARTADO';

  return (
    <div
      className={`p-4 bg-slate-900/30 border rounded-xl space-y-3 text-xs transition-all duration-300 hover:translate-y-[-2px] hover:bg-slate-900/40 ${
        isSelected
          ? 'border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.08)] bg-emerald-950/5'
          : isDiscarded
          ? 'border-rose-500/30 opacity-50 bg-rose-950/5'
          : 'border-slate-800/40 hover:border-slate-700/60'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className={`font-semibold text-slate-200 transition-colors duration-205 ${isSelected ? 'text-emerald-300' : ''}`}>
          {topic.titulo}
        </h4>
        <Badge variant={difficultyVariant[topic.dificultad]}>{topic.dificultad}</Badge>
      </div>

      <p className="text-slate-500 text-[11px] leading-relaxed transition-colors duration-205">
        {topic.descripcion}
      </p>

      <div className="flex justify-between items-center pt-1">
        <span className={`text-[10px] uppercase font-bold tracking-wider ${
          isSelected ? 'text-emerald-400' : isDiscarded ? 'text-rose-400' : 'text-slate-500'
        }`}>
          {topic.estado}
        </span>

        <div className="flex items-center gap-2">
          {/* Discard Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => isDiscarded ? onReset(topic.id) : onDiscard(topic.id)}
            className={`p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer ${
              isDiscarded
                ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30'
                : 'text-slate-500 hover:bg-rose-500/10 hover:text-rose-400'
            }`}
            title={isDiscarded ? "Revertir descarte" : "Descartar tema"}
          >
            <XCircle className="w-4.5 h-4.5" />
          </button>

          {/* Select Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => isSelected ? onReset(topic.id) : onSelect(topic.id)}
            className={`p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer ${
              isSelected
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400'
            }`}
            title={isSelected ? "Revertir selección" : "Seleccionar tema"}
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
