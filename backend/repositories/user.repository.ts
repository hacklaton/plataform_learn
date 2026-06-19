import { prisma } from '../libs/prisma.js';
import { Role } from '../constants/roles.js';

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
        guardianProfile: true,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
        guardianProfile: true,
      },
    });
  }

  static async create(data: {
    email: string;
    passwordHash: string;
    role: Role;
    firstName: string;
    lastName: string;
    department?: string;
    enrollmentCode?: string;
    grade?: string;
    phone?: string;
  }) {
    const { email, passwordHash, role, firstName, lastName, department, enrollmentCode, grade, phone } = data;

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: passwordHash,
          role,
        },
      });

      if (role === Role.ADMIN) {
        await tx.adminProfile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
          },
        });
      } else if (role === Role.TEACHER) {
        await tx.teacherProfile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            department,
          },
        });
      } else if (role === Role.STUDENT) {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            enrollmentCode: enrollmentCode!,
            grade,
          },
        });
      } else if (role === Role.GUARDIAN) {
        await tx.guardianProfile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            phone,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          adminProfile: true,
          teacherProfile: true,
          studentProfile: true,
          guardianProfile: true,
        },
      });
    });
  }

  static async update(
    id: string,
    role: Role,
    data: {
      firstName?: string;
      lastName?: string;
      department?: string;
      grade?: string;
      phone?: string;
      isActive?: boolean;
    }
  ) {
    const { firstName, lastName, department, grade, phone, isActive } = data;

    return prisma.$transaction(async (tx) => {
      if (isActive !== undefined) {
        await tx.user.update({
          where: { id },
          data: { isActive },
        });
      }

      const profileData: any = {};
      if (firstName !== undefined) profileData.firstName = firstName;
      if (lastName !== undefined) profileData.lastName = lastName;

      if (role === Role.ADMIN) {
        if (Object.keys(profileData).length > 0) {
          await tx.adminProfile.update({
            where: { userId: id },
            data: profileData,
          });
        }
      } else if (role === Role.TEACHER) {
        if (department !== undefined) profileData.department = department;
        if (Object.keys(profileData).length > 0) {
          await tx.teacherProfile.update({
            where: { userId: id },
            data: profileData,
          });
        }
      } else if (role === Role.STUDENT) {
        if (grade !== undefined) profileData.grade = grade;
        if (Object.keys(profileData).length > 0) {
          await tx.studentProfile.update({
            where: { userId: id },
            data: profileData,
          });
        }
      } else if (role === Role.GUARDIAN) {
        if (phone !== undefined) profileData.phone = phone;
        if (Object.keys(profileData).length > 0) {
          await tx.guardianProfile.update({
            where: { userId: id },
            data: profileData,
          });
        }
      }

      return tx.user.findUnique({
        where: { id },
        include: {
          adminProfile: true,
          teacherProfile: true,
          studentProfile: true,
          guardianProfile: true,
        },
      });
    });
  }

  static async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { password: passwordHash },
    });
  }

  static async findAll(filters: { role?: Role; isActive?: boolean }) {
    return prisma.user.findMany({
      where: filters,
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
        guardianProfile: true,
      },
    });
  }
}
