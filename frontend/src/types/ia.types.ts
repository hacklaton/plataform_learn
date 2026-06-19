import { RiskLevel } from './student.types';

// ============================================
// Tipos de datos generados por el Agente de IA
// (complementan analytics.types.ts; NO lo reemplazan)
// ============================================

// --- PROFESOR: proyección de deserción por salón ---
export interface DropoutProjection {
  id: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  currentRisk: RiskLevel;
  dropoutProbability: number; // 0 - 100 (%)
  projectedTrend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  primaryFactor: string;
  recommendation: string;
}

// Agrupación de salones del docente para el dropdown del sidebar / dashboard
export interface Classroom {
  id: string;
  name: string;
  courseCode: string;
  studentCount: number;
  avgAttendance: number;
  avgGpa: number;
}

// --- ESTUDIANTE: premonición / proyección de rutina de fin de año ---
export interface RoutineProjectionPoint {
  month: string;
  projectedGpa: number;      // proyección del promedio (0.0 - 5.0)
  projectedAttendance: number; // proyección de asistencia (%)
  isProjection?: boolean;    // true = punto futuro estimado por IA
}

export interface RoutineProjection {
  studentId: string;
  studentName: string;
  outlook: 'POSITIVE' | 'NEUTRAL' | 'AT_RISK';
  headline: string;
  summary: string;
  confidence: number; // 0 - 100 (%)
  timeline: RoutineProjectionPoint[];
  habits: { label: string; impact: 'POSITIVE' | 'NEGATIVE'; detail: string }[];
}

// --- ESTUDIANTE: plan de refuerzo inteligente por tema débil ---
export interface ReinforcementActivity {
  id: string;
  type: 'VIDEO' | 'READING' | 'QUIZ' | 'EXERCISE';
  title: string;
  durationMin: number;
  url?: string;
  completed: boolean;
}

export interface ReinforcementPlan {
  id: string;
  studentId: string;
  subject: string;       // ej: 'Ciencias'
  topic: string;         // ej: 'Tabla Periódica'
  currentScore: number;  // 0.0 - 5.0
  targetScore: number;   // 0.0 - 5.0
  priority: RiskLevel;
  generatedAt: string;
  aiSummary: string;
  activities: ReinforcementActivity[];
}
