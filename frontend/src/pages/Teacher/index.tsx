import { useState, useEffect } from 'react';
import { useTeacherWorkflow } from '../../hooks/useTeacherWorkflow';
import ContextForm from '../../components/teacher/ContextForm';
import TopicFanOut from '../../components/teacher/TopicFanOut';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function AgentProgressLoader() {
  const steps = [
    { title: 'Conectando con el Agente', desc: 'Iniciando sesión segura con "The Intelligence"...' },
    { title: 'Analizando Contexto', desc: 'Procesando asignatura, curso y objetivos de aprendizaje...' },
    { title: 'Generando Plan de Clases', desc: 'El LLM está diseñando las etapas y estructura del plan...' },
    { title: 'Creando Temario Enriquecido', desc: 'Buscando recursos gratuitos y estructurando abanico de temas...' },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8 bg-slate-900/30 border border-slate-800/50 rounded-2xl glass-panel flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto my-6 animate-pulse">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-indigo-400 font-bold text-xs tracking-wider">AI</span>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold text-white font-display tracking-tight">
          {steps[currentStep].title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed px-4">
          {steps[currentStep].desc}
        </p>
      </div>

      <div className="flex gap-2 justify-center w-full max-w-[200px]">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              idx <= currentStep ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Teacher() {
  const {
    workflow,
    isLoadingWorkflow,
    submitContext,
    selectTopic,
    discardTopic,
    resetTopic,
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

      {status === 'SUBMITTING' ? (
        <AgentProgressLoader />
      ) : isLoadingWorkflow ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : workflow ? (
        <TopicFanOut
          workflow={workflow}
          onSelectTopic={selectTopic}
          onDiscardTopic={discardTopic}
          onResetTopic={resetTopic}
          isUpdating={isUpdatingTopic}
        />
      ) : null}
    </div>
  );
}
