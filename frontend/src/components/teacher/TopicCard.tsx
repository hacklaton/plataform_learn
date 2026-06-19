import { CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import { TopicCandidate } from '../../types/teacherWorkflow.types';

interface TopicCardProps {
  topic: TopicCandidate;
  onSelect: (topicId: string) => void;
  onDiscard: (topicId: string) => void;
  disabled?: boolean;
}

const difficultyVariant = {
  BASICO: 'success',
  INTERMEDIO: 'warning',
  AVANZADO: 'error',
} as const;

const statusVariant = {
  SUGERIDO: 'info',
  SELECCIONADO: 'success',
  DESCARTADO: 'critical',
} as const;

export default function TopicCard({ topic, onSelect, onDiscard, disabled }: TopicCardProps) {
  const isDecided = topic.estado !== 'SUGERIDO';

  return (
    <div
      className={`p-4 bg-slate-900/30 border rounded-xl space-y-3 text-xs transition-colors ${
        topic.estado === 'SELECCIONADO'
          ? 'border-emerald-500/40'
          : topic.estado === 'DESCARTADO'
          ? 'border-rose-500/30 opacity-60'
          : 'border-slate-800/40'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-slate-200">{topic.titulo}</h4>
        <Badge variant={difficultyVariant[topic.dificultad]}>{topic.dificultad}</Badge>
      </div>

      <p className="text-slate-500 text-[11px] leading-relaxed">{topic.descripcion}</p>

      <div className="flex justify-between items-center pt-1">
        <Badge variant={statusVariant[topic.estado]}>{topic.estado}</Badge>

        {!isDecided && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onDiscard(topic.id)}
              className="text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50"
              title="Descartar tema"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(topic.id)}
              className="text-slate-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
              title="Seleccionar tema"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
