// Domain types for the "Módulo de Profesores Inteligente".
// These types are the contract between UI and data layer (mock today, real agent API later).
// Nothing here should import from /api or /components — keep this layer dependency-free.

export type TopicDifficulty = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';

export type TopicStatus = 'SUGERIDO' | 'SELECCIONADO' | 'DESCARTADO';

export type WorkflowStatus = 'IDLE' | 'SUBMITTING' | 'READY' | 'ERROR';

/**
 * Captured from the teacher right after they submit feedback/context.
 * This is the only payload the agent (real or mocked) needs to start working.
 */
export interface TeacherContextInput {
  profesor: string;
  asignatura: string;
  curso: string;
  contexto: string;
  objetivos: string[];
}

/** A single candidate topic inside the "Abanico de Temas". */
export interface TopicCandidate {
  id: string;
  titulo: string;
  descripcion: string;
  dificultad: TopicDifficulty;
  estado: TopicStatus;
}

/** High-level plan the agent drafts before expanding it into topic candidates. */
export interface WorkPlan {
  resumen: string;
  duracionEstimadaSemanas: number;
  etapas: string[];
}

/** Full mocked/real response coming back from the agent for a given context input. */
export interface AgentWorkflowResponse {
  id: string;
  contexto: TeacherContextInput;
  planDeTrabajo: WorkPlan;
  abanicoDeTemas: TopicCandidate[];
  generadoEn: string;
}
