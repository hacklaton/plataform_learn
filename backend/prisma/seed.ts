import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed started...');

  // Clean old records (orden por dependencias)
  await prisma.grade.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Cleaned old records.');

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

  // 2. Create TEACHER (+ perfil)
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
    include: { teacherProfile: true },
  });
  console.log('Created Teacher user:', teacher.email);

  // 3. Create STUDENT (+ perfil)
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
    include: { studentProfile: true },
  });
  console.log('Created Student user:', student.email);

  // 3b. Alumnos adicionales para poblar los salones
  const extraStudentsData = [
    { email: 'mateo@hacklaton.dev', firstName: 'Mateo', lastName: 'Vásquez', enrollmentCode: 'STU-002', grade: '10A' },
    { email: 'valeria@hacklaton.dev', firstName: 'Valeria', lastName: 'Gómez', enrollmentCode: 'STU-003', grade: '10A' },
    { email: 'camila@hacklaton.dev', firstName: 'Camila', lastName: 'Torres', enrollmentCode: 'STU-004', grade: '11B' },
  ];

  const extraStudents = [];
  for (const s of extraStudentsData) {
    const u = await prisma.user.create({
      data: {
        email: s.email,
        password: hashedPassword,
        role: Role.STUDENT,
        studentProfile: {
          create: {
            firstName: s.firstName,
            lastName: s.lastName,
            enrollmentCode: s.enrollmentCode,
            grade: s.grade,
          },
        },
      },
      include: { studentProfile: true },
    });
    extraStudents.push(u);
  }
  console.log(`Created ${extraStudents.length} extra students.`);

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

  // 5. Salones (Course) asignados al profesor
  const teacherId = teacher.teacherProfile!.id;
  const calculo = await prisma.course.create({
    data: {
      title: 'Salón 10-A · Cálculo',
      subject: 'Matemáticas',
      durationMonths: 10,
      targetLevel: 'INTERMEDIATE',
      description: 'Cálculo diferencial e integral para grado 10A.',
      teacherId,
    },
  });
  const fisica = await prisma.course.create({
    data: {
      title: 'Salón 11-B · Física',
      subject: 'Física',
      durationMonths: 10,
      targetLevel: 'ADVANCED',
      description: 'Física ondulatoria y mecánica para grado 11B.',
      teacherId,
    },
  });
  console.log('Created 2 courses (salones).');

  // 6. Matrículas
  const allStudents = [student, ...extraStudents];
  const calculoStudents = allStudents.filter((u) => u.studentProfile!.grade === '10A');
  const fisicaStudents = allStudents.filter((u) => u.studentProfile!.grade === '11B');

  for (const u of calculoStudents) {
    await prisma.courseEnrollment.create({
      data: { courseId: calculo.id, studentId: u.studentProfile!.id },
    });
  }
  for (const u of fisicaStudents) {
    await prisma.courseEnrollment.create({
      data: { courseId: fisica.id, studentId: u.studentProfile!.id },
    });
  }
  console.log('Created enrollments.');

  // 7. Notas demo
  await prisma.grade.create({
    data: {
      studentId: student.studentProfile!.id,
      courseId: calculo.id,
      teacherId,
      assessmentName: 'Parcial 1',
      value: 4.6,
      weight: 30,
      feedback: 'Excelente dominio de derivadas.',
    },
  });
  const mateo = extraStudents.find((u) => u.email === 'mateo@hacklaton.dev')!;
  await prisma.grade.create({
    data: {
      studentId: mateo.studentProfile!.id,
      courseId: calculo.id,
      teacherId,
      assessmentName: 'Parcial 1',
      value: 2.1,
      weight: 30,
      feedback: 'Debe reforzar límites y continuidad.',
    },
  });
  console.log('Created demo grades.');

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
