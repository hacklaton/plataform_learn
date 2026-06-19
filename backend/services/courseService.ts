/**
 * services/courseService.ts
 *
 * Lógica de negocio para gestión de cursos y planes educativos.
 * Se conecta al Agente Python "The Intelligence" vía HTTP.
 */
import { prisma } from '../libs/prisma.js';
import type { Level, PlanStatus } from '@prisma/client';

const AGENT_URL = process.env.INTELLIGENCE_AGENT_URL ?? 'http://localhost:8000';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CreateCourseInput {
  title: string;
  subject: string;
  durationMonths: number;
  targetLevel: Level;
  description?: string;
  teacherId: string;
}

export interface AgentPlanResult {
  success: boolean;
  course_id: string;
  plan_id?: string;
  weeks_generated?: number;
  topics_generated?: number;
  weeks_enriched?: number;
  plan_status?: string;
  validation_warnings?: string[];
  next_step?: string;
  error?: string;
}

// ── Service Functions ──────────────────────────────────────────────────────

/**
 * Crea un curso y dispara la generación del plan educativo en el Agente Python.
 */
export async function createCourseWithPlan(input: CreateCourseInput) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: input.teacherId },
  });

  if (!teacherProfile) {
    throw new Error(`TeacherProfile no encontrado: ${input.teacherId}`);
  }

  const course = await prisma.course.create({
    data: {
      title: input.title,
      subject: input.subject,
      durationMonths: input.durationMonths,
      targetLevel: input.targetLevel,
      description: input.description ?? '',
      teacherId: input.teacherId,
    },
    include: { teacher: true },
  });

  let agentResult: AgentPlanResult | null = null;

  try {
    agentResult = await callAgentGeneratePlan({
      course_id: course.id,
      title: course.title,
      subject: course.subject,
      duration_months: course.durationMonths,
      level: course.targetLevel,
      description: course.description ?? '',
    });
  } catch (agentError) {
    console.error('[CourseService] Agente no disponible:', agentError);
  }

  return {
    course,
    agentResult,
    message: agentResult?.success
      ? `Plan generado: ${agentResult.weeks_generated} semanas, ${agentResult.topics_generated} tópicos`
      : 'Curso creado. La generación del plan está pendiente.',
  };
}

export async function getCourseWithPlan(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: true,
      plan: {
        include: {
          weeks: {
            orderBy: { weekNumber: 'asc' },
            include: { topics: { orderBy: { createdAt: 'asc' } } },
          },
        },
      },
      enrollments: { include: { student: true } },
    },
  });

  if (!course) throw new Error(`Curso no encontrado: ${courseId}`);
  return course;
}

export async function getTeacherCourses(teacherId: string) {
  return prisma.course.findMany({
    where: { teacherId },
    include: {
      plan: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { weeks: true } },
        },
      },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleTopicSelection(
  topicId: string,
  teacherId: string,
  selected: boolean,
  notes?: string,
) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { week: { include: { plan: { include: { course: true } } } } },
  });

  if (!topic) throw new Error(`Tópico no encontrado: ${topicId}`);

  const courseTeacherId = topic.week.plan.course.teacherId;
  if (courseTeacherId !== teacherId) {
    throw new Error('No tienes permisos para modificar este tópico');
  }

  if (selected) {
    await prisma.teacherTopicSelection.upsert({
      where: { topicId_teacherId: { topicId, teacherId } },
      update: { notes: notes ?? null },
      create: { topicId, teacherId, notes: notes ?? null },
    });
  } else {
    await prisma.teacherTopicSelection.delete({
      where: { topicId_teacherId: { topicId, teacherId } },
    }).catch(() => null);
  }

  await prisma.topic.update({
    where: { id: topicId },
    data: { isSelected: selected },
  });

  return { topicId, teacherId, selected, notes: notes ?? null, topic: topic.title };
}

export async function finalizeCourseplan(courseId: string, teacherId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { plan: true },
  });

  if (!course) throw new Error(`Curso no encontrado: ${courseId}`);
  if (course.teacherId !== teacherId) throw new Error('Sin permisos para finalizar este plan');
  if (!course.plan) throw new Error('El curso no tiene un plan generado aún');

  const updatedPlan = await prisma.coursePlan.update({
    where: { courseId },
    data: { status: 'FINALIZED' as PlanStatus },
  });

  const selectedCount = await prisma.topic.count({
    where: { week: { planId: updatedPlan.id }, isSelected: true },
  });

  return {
    planId: updatedPlan.id,
    courseId,
    status: 'FINALIZED',
    selectedTopicsCount: selectedCount,
    finalizedAt: new Date().toISOString(),
  };
}

export async function suggestTopicsForWeek(courseId: string, weekNumber: number) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      plan: {
        include: {
          weeks: {
            where: { weekNumber },
            include: { topics: true },
          },
        },
      },
    },
  });

  if (!course) throw new Error(`Curso no encontrado: ${courseId}`);
  const week = course.plan?.weeks[0];
  if (!week) throw new Error(`Semana ${weekNumber} no encontrada`);

  const response = await fetch(`${AGENT_URL}/suggest-topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      course_id: courseId,
      week_number: weekNumber,
      week_title: week.title,
      objectives: week.objectives,
      subject: course.subject,
      level: course.targetLevel,
    }),
  });

  if (!response.ok) throw new Error(`Error del agente: ${response.statusText}`);
  return response.json();
}

async function callAgentGeneratePlan(payload: {
  course_id: string;
  title: string;
  subject: string;
  duration_months: number;
  level: Level;
  description: string;
}): Promise<AgentPlanResult> {
  const response = await fetch(`${AGENT_URL}/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Agente respondió ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<AgentPlanResult>;
}
