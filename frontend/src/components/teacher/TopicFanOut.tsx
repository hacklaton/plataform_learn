import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import TopicCard from './TopicCard';
import { AgentWorkflowResponse } from '../../types/teacherWorkflow.types';
import { ListTree, ClipboardList } from 'lucide-react';

interface TopicFanOutProps {
  workflow: AgentWorkflowResponse;
  onSelectTopic: (topicId: string) => void;
  onDiscardTopic: (topicId: string) => void;
  isUpdating: boolean;
}

export default function TopicFanOut({ workflow, onSelectTopic, onDiscardTopic, isUpdating }: TopicFanOutProps) {
  return (
    <div className="space-y-6">
      {/* Plan de Trabajo */}
      <Card className="space-y-3">
        <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          Plan de Trabajo Generado
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">{workflow.planDeTrabajo.resumen}</p>
        <p className="text-[11px] text-slate-500">
          Duración estimada: {workflow.planDeTrabajo.duracionEstimadaSemanas} semanas
        </p>
        <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1">
          {workflow.planDeTrabajo.etapas.map((etapa, idx) => (
            <li key={idx}>{etapa}</li>
          ))}
        </ol>
      </Card>

      {/* Abanico de Temas */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
          <ListTree className="w-5 h-5 text-indigo-400" />
          Abanico de Temas
        </h3>
        <p className="text-xs text-slate-500">
          Seleccione o descarte los temas propuestos por el agente para el curso.
        </p>

        {isUpdating ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workflow.abanicoDeTemas.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onSelect={onSelectTopic}
                onDiscard={onDiscardTopic}
                disabled={isUpdating}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
