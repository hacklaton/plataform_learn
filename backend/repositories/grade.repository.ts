import { prisma } from '../libs/prisma.js';

export interface GradeFilters {
  studentId?: string;
  courseId?: string;
  teacherId?: string;
}

export interface CreateGradeData {
  studentId: string;
  courseId: string;
  teacherId: string;
  assessmentName: string;
  value: number;
  weight?: number;
  feedback?: string;
}

export interface UpdateGradeData {
  assessmentName?: string;
  value?: number;
  weight?: number;
  feedback?: string;
}

const gradeInclude = {
  student: { select: { id: true, firstName: true, lastName: true, enrollmentCode: true } },
  course: { select: { id: true, title: true, subject: true, teacherId: true } },
  teacher: { select: { id: true, firstName: true, lastName: true } },
};

export class GradeRepository {
  static async findAll(filters: GradeFilters) {
    return prisma.grade.findMany({
      where: filters,
      include: gradeInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id: string) {
    return prisma.grade.findUnique({
      where: { id },
      include: gradeInclude,
    });
  }

  static async create(data: CreateGradeData) {
    return prisma.grade.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        teacherId: data.teacherId,
        assessmentName: data.assessmentName,
        value: data.value,
        weight: data.weight ?? 100,
        feedback: data.feedback ?? null,
      },
      include: gradeInclude,
    });
  }

  static async update(id: string, data: UpdateGradeData) {
    return prisma.grade.update({
      where: { id },
      data,
      include: gradeInclude,
    });
  }

  static async delete(id: string) {
    return prisma.grade.delete({ where: { id } });
  }
}
