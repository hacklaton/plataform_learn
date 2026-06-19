import { useTeacherWorkflow } from '../../hooks/useTeacherWorkflow';
import ContextForm from '../../components/teacher/ContextForm';
import TopicFanOut from '../../components/teacher/TopicFanOut';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Teacher() {
  const {
    workflow,
    isLoadingWorkflow,
    submitContext,
    selectTopic,
    discardTopic,
    isUpdatingTopic,
    status,
  } = useTeacherWorkflow();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0">
          Módulo de Profesores Inteligente
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Entregue contexto al agente y reciba un plan de trabajo con un abanico de temas sugeridos.
        </p>
      </div>

      <ContextForm onSubmit={submitContext} isSubmitting={status === 'SUBMITTING'} />

      {isLoadingWorkflow ? (
        <LoadingSpinner />
      ) : workflow ? (
        <TopicFanOut
          workflow={workflow}
          onSelectTopic={selectTopic}
          onDiscardTopic={discardTopic}
          isUpdating={isUpdatingTopic}
        />
      ) : null}
    </div>
  );
}
