import { GradeRepository, GradeFilters, UpdateGradeData } from '../repositories/grade.repository.js';
import { prisma } from '../libs/prisma.js';
import { publishEvent, DOMAIN_EVENTS } from '../libs/events.js';
import { Role } from '../constants/roles.js';

interface RequestActor {
  id: string; // User.id
  role: Role;
}

interface CreateGradeInput {
  studentId: string;
  courseId: string;
  assessmentName: string;
  value: number;
  weight?: number;
  feedback?: string;
}

function httpError(message: string, statusCode: number) {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export class GradeService {
  /**
   * Resuelve el TeacherProfile del usuario autenticado (si lo tiene).
   */
  private static async getTeacherProfile(userId: string) {
    return prisma.teacherProfile.findUnique({ where: { userId } });
  }

  private static async getStudentProfile(userId: string) {
    return prisma.studentProfile.findUnique({ where: { userId } });
  }

  /**
   * Verifica que el curso pertenezca al profesor (salvo ADMIN).
   */
  private static async assertCourseOwnership(courseId: string, actor: RequestActor): Promise<string> {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw httpError('Course not found', 404);

    if (actor.role === Role.ADMIN) {
      return course.teacherId;
    }

    const teacherProfile = await this.getTeacherProfile(actor.id);
    if (!teacherProfile) throw httpError('Teacher profile not found', 403);
    if (course.teacherId !== teacherProfile.id) {
      throw httpError('You can only manage grades for your own courses', 403);
    }
    return teacherProfile.id;
  }

  static async list(actor: RequestActor, query: GradeFilters) {
    const filters: GradeFilters = { ...query };

    // STUDENT: solo sus propias notas
    if (actor.role === Role.STUDENT) {
      const studentProfile = await this.getStudentProfile(actor.id);
      if (!studentProfile) throw httpError('Student profile not found', 403);
      filters.studentId = studentProfile.id;
    }

    // TEACHER: solo notas de sus cursos
    if (actor.role === Role.TEACHER) {
      const teacherProfile = await this.getTeacherProfile(actor.id);
      if (!teacherProfile) throw httpError('Teacher profile not found', 403);
      filters.teacherId = teacherProfile.id;
    }

    return GradeRepository.findAll(filters);
  }

  static async create(actor: RequestActor, input: CreateGradeInput) {
    if (actor.role === Role.STUDENT || actor.role === Role.GUARDIAN) {
      throw httpError('You are not allowed to register grades', 403);
    }

    // Valida propiedad del curso y obtiene el teacherId que firma la nota
    const teacherId = await this.assertCourseOwnership(input.courseId, actor);

    // Verifica que el alumno exista y esté matriculado en el curso
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { courseId_studentId: { courseId: input.courseId, studentId: input.studentId } },
    });
    if (!enrollment) {
      throw httpError('Student is not enrolled in this course', 400);
    }

    const grade = await GradeRepository.create({
      studentId: input.studentId,
      courseId: input.courseId,
      teacherId,
      assessmentName: input.assessmentName,
      value: input.value,
      weight: input.weight,
      feedback: input.feedback,
    });

    // Event-driven: notifica al ecosistema de agentes
    await publishEvent(DOMAIN_EVENTS.GRADE_REGISTERED, {
      gradeId: grade.id,
      studentId: grade.studentId,
      courseId: grade.courseId,
      teacherId: grade.teacherId,
      value: grade.value,
      assessmentName: grade.assessmentName,
    });

    return grade;
  }

  static async update(actor: RequestActor, id: string, data: UpdateGradeData) {
    const existing = await GradeRepository.findById(id);
    if (!existing) throw httpError('Grade not found', 404);

    await this.assertCourseOwnership(existing.courseId, actor);

    const grade = await GradeRepository.update(id, data);

    await publishEvent(DOMAIN_EVENTS.GRADE_UPDATED, {
      gradeId: grade.id,
      studentId: grade.studentId,
      courseId: grade.courseId,
      value: grade.value,
    });

    return grade;
  }

  static async remove(actor: RequestActor, id: string) {
    const existing = await GradeRepository.findById(id);
    if (!existing) throw httpError('Grade not found', 404);

    await this.assertCourseOwnership(existing.courseId, actor);

    await GradeRepository.delete(id);

    await publishEvent(DOMAIN_EVENTS.GRADE_DELETED, {
      gradeId: id,
      studentId: existing.studentId,
      courseId: existing.courseId,
    });
  }
}
