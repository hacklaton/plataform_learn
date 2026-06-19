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

interface CreateTeacherInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
}

interface UpdateTeacherInput {
  firstName?: string;
  lastName?: string;
  department?: string;
  isActive?: boolean;
}

const teacherInclude = {
  user: { select: { id: true, email: true, isActive: true, createdAt: true } },
  courses: { select: { id: true, title: true, subject: true } },
};

export class TeacherService {
  static async list() {
    return prisma.teacherProfile.findMany({
      include: teacherInclude,
      orderBy: { firstName: 'asc' },
    });
  }

  static async getById(id: string) {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: teacherInclude,
    });
    if (!teacher) throw httpError('Teacher not found', 404);
    return teacher;
  }

  static async create(input: CreateTeacherInput) {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) throw httpError('A user with this email already exists', 409);

    const passwordHash = await HashUtil.hashPassword(input.password);
    const user = await UserRepository.create({
      email: input.email,
      passwordHash,
      role: Role.TEACHER,
      firstName: input.firstName,
      lastName: input.lastName,
      department: input.department,
    });

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user!.id },
      include: teacherInclude,
    });

    await publishEvent(DOMAIN_EVENTS.TEACHER_CREATED, {
      teacherId: profile!.id,
      userId: user!.id,
    });

    return profile;
  }

  static async update(id: string, data: UpdateTeacherInput) {
    const teacher = await prisma.teacherProfile.findUnique({ where: { id } });
    if (!teacher) throw httpError('Teacher not found', 404);

    await UserRepository.update(teacher.userId, Role.TEACHER, {
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      isActive: data.isActive,
    });

    await redis.del(CacheKeys.user(teacher.userId));

    return prisma.teacherProfile.findUnique({ where: { id }, include: teacherInclude });
  }

  static async remove(id: string) {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: { courses: true },
    });
    if (!teacher) throw httpError('Teacher not found', 404);

    if (teacher.courses.length > 0) {
      throw httpError('Cannot deactivate a teacher with assigned courses. Reassign them first.', 409);
    }

    await UserRepository.update(teacher.userId, Role.TEACHER, { isActive: false });
    await redis.del(CacheKeys.user(teacher.userId));
    await redis.del(CacheKeys.refreshToken(teacher.userId));

    return { id, deactivated: true };
  }
}
