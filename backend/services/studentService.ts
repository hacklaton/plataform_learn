import { UserRepository } from '../repositories/user.repository.js';
import { HashUtil } from '../utils/hash.util.js';
import { prisma } from '../libs/prisma.js';
import { redis } from '../libs/redis.js';
import { CacheKeys } from '../constants/cacheKeys.js';
import { publishEvent, DOMAIN_EVENTS } from '../libs/events.js';
import { Role } from '../constants/roles.js';

function httpError(message: string, statusCode: number) {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
}

interface CreateStudentInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  enrollmentCode: string;
  grade?: string;
}

interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  grade?: string;
  isActive?: boolean;
}

const studentInclude = {
  user: { select: { id: true, email: true, isActive: true, createdAt: true } },
  enrollments: { include: { course: { select: { id: true, title: true, subject: true } } } },
};

export class StudentService {
  static async list() {
    return prisma.studentProfile.findMany({
      include: studentInclude,
      orderBy: { firstName: 'asc' },
    });
  }

  static async getById(id: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        ...studentInclude,
        grades: {
          include: { course: { select: { id: true, title: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!student) throw httpError('Student not found', 404);
    return student;
  }

  static async create(input: CreateStudentInput) {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) throw httpError('A user with this email already exists', 409);

    const enrollmentTaken = await prisma.studentProfile.findUnique({
      where: { enrollmentCode: input.enrollmentCode },
    });
    if (enrollmentTaken) throw httpError('Enrollment code already in use', 409);

    const passwordHash = await HashUtil.hashPassword(input.password);
    const user = await UserRepository.create({
      email: input.email,
      passwordHash,
      role: Role.STUDENT,
      firstName: input.firstName,
      lastName: input.lastName,
      enrollmentCode: input.enrollmentCode,
      grade: input.grade,
    });

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user!.id },
      include: studentInclude,
    });

    await publishEvent(DOMAIN_EVENTS.STUDENT_CREATED, {
      studentId: profile!.id,
      userId: user!.id,
      enrollmentCode: input.enrollmentCode,
    });

    return profile;
  }

  static async update(id: string, data: UpdateStudentInput) {
    const student = await prisma.studentProfile.findUnique({ where: { id } });
    if (!student) throw httpError('Student not found', 404);

    await UserRepository.update(student.userId, Role.STUDENT, {
      firstName: data.firstName,
      lastName: data.lastName,
      grade: data.grade,
      isActive: data.isActive,
    });

    await redis.del(CacheKeys.user(student.userId));

    return prisma.studentProfile.findUnique({ where: { id }, include: studentInclude });
  }

  static async remove(id: string) {
    const student = await prisma.studentProfile.findUnique({ where: { id } });
    if (!student) throw httpError('Student not found', 404);

    // Baja lógica: desactiva el usuario (preserva histórico de notas)
    await UserRepository.update(student.userId, Role.STUDENT, { isActive: false });
    await redis.del(CacheKeys.user(student.userId));
    await redis.del(CacheKeys.refreshToken(student.userId));

    return { id, deactivated: true };
  }
}
