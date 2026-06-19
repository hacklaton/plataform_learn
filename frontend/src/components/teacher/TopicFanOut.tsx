import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import TopicCard from './TopicCard';
import { AgentWorkflowResponse } from '../../types/teacherWorkflow.types';
import { ListTree, ClipboardList, BarChart2 } from 'lucide-react';

interface TopicFanOutProps {
  workflow: AgentWorkflowResponse;
  onSelectTopic: (topicId: string) => void;
  onDiscardTopic: (topicId: string) => void;
  onResetTopic: (topicId: string) => void;
  isUpdating: boolean;
}

export default function TopicFanOut({
  workflow,
  onSelectTopic,
  onDiscardTopic,
  onResetTopic,
  isUpdating,
}: TopicFanOutProps) {
  const totalTopics = workflow.abanicoDeTemas.length;
  const selectedTopics = workflow.abanicoDeTemas.filter((t) => t.estado === 'SELECCIONADO').length;
  const discardedTopics = workflow.abanicoDeTemas.filter((t) => t.estado === 'DESCARTADO').length;
  const pendingTopics = workflow.abanicoDeTemas.filter((t) => t.estado === 'SUGERIDO').length;
  const selectionRate = totalTopics > 0 ? Math.round((selectedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Grid Layout: Plan summary + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan de Trabajo */}
        <Card className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            Plan de Trabajo Generado
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">{workflow.planDeTrabajo.resumen}</p>
          <p className="text-[11px] text-slate-500 font-semibold">
            Duración estimada del curso: {workflow.planDeTrabajo.duracionEstimadaSemanas} semanas
          </p>
          
          <div className="relative pl-5 border-l border-indigo-500/20 space-y-4 my-3">
            {workflow.planDeTrabajo.etapas.map((etapa, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[24.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-950" />
                <p className="text-xs text-slate-350">{etapa}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Estadísticas de Planificación */}
        <Card className="space-y-4" glow="primary">
          <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            Temas Seleccionados
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Porcentaje de Selección</span>
                <span className="font-mono text-indigo-400">{selectionRate}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  style={{ width: `${selectionRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
              <div className="p-2 bg-emerald-950/20 border border-emerald-500/10 rounded-xl">
                <span className="block font-bold text-emerald-400 font-mono text-sm">{selectedTopics}</span>
                <span className="text-slate-500 text-[10px]">Seleccionados</span>
              </div>
              <div className="p-2 bg-rose-950/20 border border-rose-500/10 rounded-xl">
                <span className="block font-bold text-rose-400 font-mono text-sm">{discardedTopics}</span>
                <span className="text-slate-500 text-[10px]">Descartados</span>
              </div>
              <div className="p-2 bg-slate-800/30 border border-slate-700/20 rounded-xl">
                <span className="block font-bold text-slate-300 font-mono text-sm">{pendingTopics}</span>
                <span className="text-slate-500 text-[10px]">Pendientes</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-450 leading-relaxed text-center italic pt-1">
              {pendingTopics > 0
                ? `Quedan ${pendingTopics} temas sugeridos por evaluar.`
                : '¡Has revisado y decidido sobre todos los temas sugeridos!'}
            </p>
          </div>
        </Card>
      </div>

      {/* Abanico de Temas */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
          <ListTree className="w-5 h-5 text-indigo-400" />
          Abanico de Temas Sugeridos
        </h3>
        <p className="text-xs text-slate-500">
          Decida sobre los temas propuestos por el agente para agregarlos o descartarlos en el plan definitivo.
        </p>

        {isUpdating ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workflow.abanicoDeTemas.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onSelect={onSelectTopic}
                onDiscard={onDiscardTopic}
                onReset={onResetTopic}
                disabled={isUpdating}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
