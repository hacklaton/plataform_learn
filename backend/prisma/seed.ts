import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed started...');

  // Clean old records in correct order of dependency
  await prisma.courseEnrollment.deleteMany({});
  await prisma.teacherTopicSelection.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.planWeek.deleteMany({});
  await prisma.coursePlan.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.teacherWorkflowTopic.deleteMany({});
  await prisma.teacherWorkflow.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Cleaned old user and course records.');

  const hashedPassword = await bcrypt.hash('Test1234!', 12);

  // 1. Create ADMIN
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hacklaton.dev',
      password: hashedPassword,
      role: Role.ADMIN,
      adminProfile: {
        create: {
          firstName: 'Admin',
          lastName: 'Sistemas',
        },
      },
    },
  });
  console.log('Created Admin user:', admin.email);

  // 2. Create TEACHER
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@hacklaton.dev',
      password: hashedPassword,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          firstName: 'Juan',
          lastName: 'Pérez',
          department: 'Mathematics',
        },
      },
    },
  });
  console.log('Created Teacher user:', teacher.email);

  // 3. Create STUDENT
  const student = await prisma.user.create({
    data: {
      email: 'student@hacklaton.dev',
      password: hashedPassword,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          firstName: 'Sofía',
          lastName: 'Gómez',
          enrollmentCode: 'STU-001',
          grade: '10A',
        },
      },
    },
  });
  console.log('Created Student user:', student.email);

  // 4. Create GUARDIAN
  const guardian = await prisma.user.create({
    data: {
      email: 'guardian@hacklaton.dev',
      password: hashedPassword,
      role: Role.GUARDIAN,
      guardianProfile: {
        create: {
          firstName: 'Carlos',
          lastName: 'Gómez',
          phone: '+573123456789',
        },
      },
    },
  });
  console.log('Created Guardian user:', guardian.email);

  console.log('Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
