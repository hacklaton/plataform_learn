import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { iaApi } from '../../../api/ia.api';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { ReinforcementActivity } from '../../../types/ia.types';
import {
  Lightbulb,
  PlayCircle,
  BookText,
  PencilRuler,
  HelpCircle,
  CheckCircle2,
  Circle,
  Bot,
} from 'lucide-react';

// Estudiante demo: Mateo Vásquez (perfil en riesgo, ideal para la demo)
const DEMO_STUDENT_ID = 'std-4';

const ACTIVITY_ICON = {
  VIDEO: PlayCircle,
  READING: BookText,
  EXERCISE: PencilRuler,
  QUIZ: HelpCircle,
};

const ACTIVITY_LABEL = {
  VIDEO: 'Video',
  READING: 'Lectura',
  EXERCISE: 'Ejercicio',
  QUIZ: 'Quiz',
};

export default function Reinforcement() {
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['reinforcement-plans', DEMO_STUDENT_ID],
    queryFn: () => iaApi.getReinforcementPlans(DEMO_STUDENT_ID),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ planId, activityId }: { planId: string; activityId: string }) =>
      iaApi.toggleReinforcementActivity(DEMO_STUDENT_ID, planId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reinforcement-plans', DEMO_STUDENT_ID] });
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-indigo-400" />
            Refuerzo Inteligente
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Planes de acción generados automáticamente por el agente de IA para reforzar tus temas débiles.
          </p>
        </div>
        <span className="flex items-center gap-2 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full">
          <Bot className="w-3.5 h-3.5" />
          Generado por Agente IA
        </span>
      </div>

      {plans && plans.length > 0 ? (
        <div className="space-y-6">
          {plans.map((plan) => {
            const completed = plan.activities.filter((a) => a.completed).length;
            const total = plan.activities.length || 1;
            const progress = Math.round((completed / total) * 100);

            return (
              <Card
                key={plan.id}
                glow={plan.priority === 'CRITICAL' ? 'rose' : 'none'}
                className="space-y-4"
              >
                {/* Plan header */}
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={plan.priority.toLowerCase() as 'low' | 'moderate' | 'critical'}>
                        {plan.priority}
                      </Badge>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        {plan.subject}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 font-display">{plan.topic}</h3>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-slate-500">
                      Nota actual{' '}
                      <span className="font-bold font-mono text-rose-450">{plan.currentScore}</span>
                      {' → '}
                      Meta{' '}
                      <span className="font-bold font-mono text-emerald-400">{plan.targetScore}</span>
                    </p>
                  </div>
                </div>

                {/* AI summary */}
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex items-start gap-3">
                  <Bot className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">{plan.aiSummary}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Progreso del plan</span>
                    <span className="font-bold text-indigo-400">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Activities */}
                <div className="space-y-2.5">
                  {plan.activities.map((act: ReinforcementActivity) => {
                    const Icon = ACTIVITY_ICON[act.type];
                    return (
                      <div
                        key={act.id}
                        onClick={() => toggleMutation.mutate({ planId: plan.id, activityId: act.id })}
                        className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition-colors text-xs ${
                          act.completed
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-slate-900/30 border-slate-800/40 hover:bg-slate-800/20'
                        }`}
                      >
                        <div className={`shrink-0 ${act.completed ? 'text-emerald-400' : 'text-indigo-400'}`}>
                          {act.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </div>
                        <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              act.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                            }`}
                          >
                            {act.title}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            {ACTIVITY_LABEL[act.type]} · {act.durationMin} min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 font-display">¡Vas al día!</h3>
          <p className="text-xs text-slate-500 mt-1">
            El agente no detectó temas débiles que requieran refuerzo en este momento.
          </p>
        </Card>
      )}
    </div>
  );
}
