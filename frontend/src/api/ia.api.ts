import {
  Classroom,
  DropoutProjection,
  ReinforcementPlan,
  RoutineProjection,
} from '../types/ia.types';
import {
  MOCK_CLASSROOMS,
  MOCK_DROPOUT_PROJECTIONS,
  MOCK_ROUTINE_PROJECTIONS,
  DEFAULT_ROUTINE_PROJECTION,
  MOCK_REINFORCEMENT_PLANS,
} from '../utils/mockDataIA';

const getStoredData = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

const setStoredData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const iaApi = {
  // --- PROFESOR ---
  getClassrooms: async (): Promise<Classroom[]> => {
    return getStoredData('ia_classrooms', MOCK_CLASSROOMS);
  },

  getDropoutProjections: async (classroomId?: string): Promise<DropoutProjection[]> => {
    const list = getStoredData('ia_dropout_projections', MOCK_DROPOUT_PROJECTIONS);
    if (classroomId && classroomId !== 'all') {
      return list.filter((p) => p.classroomId === classroomId);
    }
    return list;
  },

  // --- ESTUDIANTE ---
  getRoutineProjection: async (studentId: string): Promise<RoutineProjection> => {
    const map = MOCK_ROUTINE_PROJECTIONS;
    return map[studentId] ?? DEFAULT_ROUTINE_PROJECTION;
  },

  getReinforcementPlans: async (studentId: string): Promise<ReinforcementPlan[]> => {
    const stored = getStoredData<Record<string, ReinforcementPlan[]>>(
      'ia_reinforcement_plans',
      MOCK_REINFORCEMENT_PLANS
    );
    return stored[studentId] ?? [];
  },

  toggleReinforcementActivity: async (
    studentId: string,
    planId: string,
    activityId: string
  ): Promise<ReinforcementPlan[]> => {
    const stored = getStoredData<Record<string, ReinforcementPlan[]>>(
      'ia_reinforcement_plans',
      MOCK_REINFORCEMENT_PLANS
    );
    const plans = stored[studentId] ?? [];
    const updated = plans.map((plan) => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        activities: plan.activities.map((act) =>
          act.id === activityId ? { ...act, completed: !act.completed } : act
        ),
      };
    });
    setStoredData('ia_reinforcement_plans', { ...stored, [studentId]: updated });
    return updated;
  },
};
