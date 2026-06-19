import { TeacherWorkflowRepository } from '../repositories/teacherWorkflow.repository.js';
import {
  AgentWorkflowResponseDto,
  TeacherContextInput,
  TopicStatus,
} from '../interfaces/teacherWorkflow.interface.js';

const AGENT_URL = process.env.INTELLIGENCE_AGENT_URL ?? 'http://localhost:8000';

function generateMockAgentPlan(input: TeacherContextInput) {
  return {
    planResumen: `Plan de trabajo para ${input.asignatura} (${input.curso}) alineado con los objetivos indicados por ${input.profesor}.`,
    planDuracionSemanas: 4,
    planEtapas: [
      'Diagnóstico de nivel del curso',
      'Introducción de contenido nuevo',
      'Práctica guiada y retroalimentación',
      'Evaluación de cierre',
    ],
    topics: [
      {
        titulo: `Fundamentos de ${input.asignatura}`,
        descripcion: 'Repaso de conceptos base necesarios antes de introducir contenido nuevo.',
        dificultad: 'BASICO',
      },
      {
        titulo: `Aplicaciones prácticas de ${input.asignatura}`,
        descripcion: 'Casos de uso reales que conectan la teoría con problemas del curso.',
        dificultad: 'INTERMEDIO',
      },
      {
        titulo: `Retos avanzados de ${input.asignatura}`,
        descripcion: 'Ejercicios de mayor complejidad orientados a estudiantes con buen desempeño.',
        dificultad: 'AVANZADO',
      },
      {
        titulo: `Evaluación formativa de ${input.asignatura}`,
        descripcion: 'Actividades cortas para medir comprensión antes de avanzar de etapa.',
        dificultad: 'INTERMEDIO',
      },
    ],
  };
}

function toDto(workflow: any): AgentWorkflowResponseDto {
  return {
    id: workflow.id,
    contexto: {
      profesor: workflow.profesor,
      asignatura: workflow.asignatura,
      curso: workflow.curso,
      contexto: workflow.contexto,
      objetivos: workflow.objetivos,
    },
    planDeTrabajo: {
      resumen: workflow.planResumen,
      duracionEstimadaSemanas: workflow.planDuracionSemanas,
      etapas: workflow.planEtapas,
    },
    abanicoDeTemas: workflow.abanicoDeTemas.map((t: any) => ({
      id: t.id,
      titulo: t.titulo,
      descripcion: t.descripcion,
      dificultad: t.dificultad,
      estado: t.estado,
    })),
    generadoEn: workflow.createdAt.toISOString(),
  };
}

export class TeacherWorkflowService {
  static async submitContext(teacherId: string, input: TeacherContextInput): Promise<AgentWorkflowResponseDto> {
    let plan;
    try {
      const response = await fetch(`${AGENT_URL}/generate-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agent API returned error ${response.status}: ${errorText}`);
      }

      plan = await response.json() as any;
    } catch (error) {
      console.error('[TeacherWorkflowService] Error calling agent, falling back to mock plan:', error);
      throw error;
    }

    const workflow = await TeacherWorkflowRepository.create({
      teacherId,
      profesor: input.profesor,
      asignatura: input.asignatura,
      curso: input.curso,
      contexto: input.contexto,
      objetivos: input.objetivos,
      planResumen: plan.planResumen,
      planDuracionSemanas: plan.planDuracionSemanas,
      planEtapas: plan.planEtapas,
      topics: plan.topics,
    });

    return toDto(workflow);
  }

  static async getCurrentWorkflow(teacherId: string): Promise<AgentWorkflowResponseDto | null> {
    const workflow = await TeacherWorkflowRepository.findLatestByTeacher(teacherId);
    return workflow ? toDto(workflow) : null;
  }

  static async updateTopicStatus(topicId: string, estado: TopicStatus): Promise<AgentWorkflowResponseDto> {
    const updatedTopic = await TeacherWorkflowRepository.updateTopicStatus(topicId, estado);
    return toDto(updatedTopic.workflow);
  }
}
