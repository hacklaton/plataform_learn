export type TopicDifficulty = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';
export type TopicStatus = 'SUGERIDO' | 'SELECCIONADO' | 'DESCARTADO';

export interface TeacherContextInput {
  profesor: string;
  asignatura: string;
  curso: string;
  contexto: string;
  objetivos: string[];
}

export interface TopicCandidateDto {
  id: string;
  titulo: string;
  descripcion: string;
  dificultad: TopicDifficulty;
  estado: TopicStatus;
}

export interface WorkPlanDto {
  resumen: string;
  duracionEstimadaSemanas: number;
  etapas: string[];
}

export interface AgentWorkflowResponseDto {
  id: string;
  contexto: TeacherContextInput;
  planDeTrabajo: WorkPlanDto;
  abanicoDeTemas: TopicCandidateDto[];
  generadoEn: string;
}
