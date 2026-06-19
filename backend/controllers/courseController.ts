/**
 * controllers/courseController.ts
 *
 * Handlers REST para la gestión de cursos y planes educativos.
 */
import type { Request, Response, NextFunction } from 'express';
import {
  createCourseWithPlan,
  getCourseWithPlan,
  getTeacherCourses,
  toggleTopicSelection,
  finalizeCourseplan,
  suggestTopicsForWeek,
  createCourseSimple,
  getAllCourses,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
} from '../services/courseService.js';
import { prisma } from '../libs/prisma.js';
import { Role } from '../constants/roles.js';

/**
 * Resuelve el teacherId (TeacherProfile.id) a usar:
 * - ADMIN: puede indicar teacherId en el body; si no, error.
 * - TEACHER: siempre su propio perfil.
 */
async function resolveTeacherId(req: Request): Promise<string> {
  if (req.user!.role === Role.ADMIN) {
    const teacherId = req.body.teacherId as string | undefined;
    if (!teacherId) {
      throw Object.assign(new Error('teacherId is required when creating as ADMIN'), { statusCode: 400 });
    }
    return teacherId;
  }
  const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: req.user!.id } });
  if (!teacherProfile) {
    throw Object.assign(new Error('Teacher profile not found'), { statusCode: 403 });
  }
  return teacherProfile.id;
}

// ── POST /courses ────────────────────────────────────────────────────────────

export async function createCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, subject, durationMonths, targetLevel, description } = req.body;

    // Obtener el TeacherProfile del usuario autenticado
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!teacherProfile) {
      res.status(403).json({
        success: false,
        message: 'Solo los profesores pueden crear cursos',
      });
      return;
    }

    // Validación básica
    if (!title || !subject || !durationMonths || !targetLevel) {
      res.status(400).json({
        success: false,
        message: 'Campos requeridos: title, subject, durationMonths, targetLevel',
      });
      return;
    }

    if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(targetLevel)) {
      res.status(400).json({
        success: false,
        message: 'targetLevel debe ser: BEGINNER | INTERMEDIATE | ADVANCED',
      });
      return;
    }

    if (durationMonths < 1 || durationMonths > 24) {
      res.status(400).json({
        success: false,
        message: 'durationMonths debe estar entre 1 y 24',
      });
      return;
    }

    const result = await createCourseWithPlan({
      title,
      subject,
      durationMonths: Number(durationMonths),
      targetLevel,
      description,
      teacherId: teacherProfile.id,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        course: result.course,
        agentPlan: result.agentResult,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /courses ─────────────────────────────────────────────────────────────

export async function getTeacherCourseList(req: Request, res: Response, next: NextFunction) {
  try {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!teacherProfile) {
      res.status(403).json({ success: false, message: 'Perfil de profesor no encontrado' });
      return;
    }

    const courses = await getTeacherCourses(teacherProfile.id);

    res.json({
      success: true,
      data: courses,
      total: courses.length,
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /courses/:id ──────────────────────────────────────────────────────────

export async function getCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const course = await getCourseWithPlan(id as string);

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /courses/:id/topics ───────────────────────────────────────────────────

export async function getCourseTopics(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params['id'] as string;

    const plan = await prisma.coursePlan.findUnique({
      where: { courseId: id },
      include: {
        weeks: {
          orderBy: { weekNumber: 'asc' },
          include: {
            topics: {
              orderBy: { createdAt: 'asc' },
              include: {
                selections: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Plan no encontrado para este curso. ¿Se generó ya?',
      });
      return;
    }

    // Estadísticas rápidas
    const totalTopics = plan.weeks.reduce((sum: number, w: typeof plan.weeks[number]) => sum + w.topics.length, 0);
    const selectedTopics = plan.weeks.reduce(
      (sum: number, w: typeof plan.weeks[number]) => sum + w.topics.filter((t: typeof w.topics[number]) => t.isSelected).length,
      0,
    );

    res.json({
      success: true,
      data: {
        plan_id: plan.id,
        course_id: id,
        status: plan.status,
        weeks: plan.weeks,
        stats: {
          total_weeks: plan.weeks.length,
          total_topics: totalTopics,
          selected_topics: selectedTopics,
          selection_rate: totalTopics > 0 ? Math.round((selectedTopics / totalTopics) * 100) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}


// ── PATCH /courses/:id/topics/:topicId/select ─────────────────────────────────

export async function selectTopic(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: courseId, topicId } = req.params;
    const { selected, notes } = req.body;

    if (typeof selected !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'El campo "selected" debe ser boolean',
      });
      return;
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!teacherProfile) {
      res.status(403).json({ success: false, message: 'Perfil de profesor no encontrado' });
      return;
    }

    const result = await toggleTopicSelection(topicId as string, teacherProfile.id, selected, notes);

    res.json({
      success: true,
      message: selected ? `Tópico "${result.topic}" seleccionado` : `Tópico "${result.topic}" deseleccionado`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// ── POST /courses/:id/finalize ────────────────────────────────────────────────

export async function finalizePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: courseId } = req.params;

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!teacherProfile) {
      res.status(403).json({ success: false, message: 'Perfil de profesor no encontrado' });
      return;
    }

    const result = await finalizeCourseplan(courseId as string, teacherProfile.id);

    res.json({
      success: true,
      message: `Plan finalizado con ${result.selectedTopicsCount} tópicos seleccionados`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// ── POST /courses/:id/weeks/:weekNumber/suggest ────────────────────────────────

export async function suggestTopics(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: courseId, weekNumber } = req.params;

    const result = await suggestTopicsForWeek(courseId as string, Number(weekNumber));

    res.json({
      success: true,
      message: `Sugerencias generadas para la semana ${weekNumber}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// ── CRUD administrativo de Salones (Course) ───────────────────────────────────

// GET /courses/all — lista todos los salones (ADMIN)
export async function listAllCourses(_req: Request, res: Response, next: NextFunction) {
  try {
    const courses = await getAllCourses();
    res.json({ success: true, data: courses, total: courses.length });
  } catch (error) {
    next(error);
  }
}

// POST /courses/simple — crea un salón sin invocar al agente IA
export async function createSimpleCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, subject, durationMonths, targetLevel, description } = req.body;

    if (!title || !subject || !durationMonths || !targetLevel) {
      res.status(400).json({
        success: false,
        message: 'Campos requeridos: title, subject, durationMonths, targetLevel',
      });
      return;
    }

    const teacherId = await resolveTeacherId(req);
    const course = await createCourseSimple({
      title,
      subject,
      durationMonths: Number(durationMonths),
      targetLevel,
      description,
      teacherId,
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
}

// PATCH /courses/:id
export async function editCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, subject, description, durationMonths, targetLevel } = req.body;
    const course = await updateCourse(id as string, {
      title,
      subject,
      description,
      durationMonths: durationMonths !== undefined ? Number(durationMonths) : undefined,
      targetLevel,
    });
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
}

// DELETE /courses/:id
export async function removeCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await deleteCourse(id as string);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// POST /courses/:id/enroll  { studentId }
export async function enrollStudentInCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: courseId } = req.params;
    const { studentId } = req.body;
    if (!studentId) {
      res.status(400).json({ success: false, message: 'studentId is required' });
      return;
    }
    const enrollment = await enrollStudent(courseId as string, studentId);
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
}

// DELETE /courses/:id/enroll/:studentId
export async function unenrollStudentFromCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: courseId, studentId } = req.params;
    const result = await unenrollStudent(courseId as string, studentId as string);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
