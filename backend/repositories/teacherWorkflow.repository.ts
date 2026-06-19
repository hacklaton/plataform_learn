import { prisma } from '../libs/prisma.js';
import { TopicStatus } from '../interfaces/teacherWorkflow.interface.js';

export class TeacherWorkflowRepository {
  static async create(data: {
    teacherId: string;
    profesor: string;
    asignatura: string;
    curso: string;
    contexto: string;
    objetivos: string[];
    planResumen: string;
    planDuracionSemanas: number;
    planEtapas: string[];
    topics: { titulo: string; descripcion: string; dificultad: string }[];
  }) {
    return prisma.teacherWorkflow.create({
      data: {
        teacherId: data.teacherId,
        profesor: data.profesor,
        asignatura: data.asignatura,
        curso: data.curso,
        contexto: data.contexto,
        objetivos: data.objetivos,
        planResumen: data.planResumen,
        planDuracionSemanas: data.planDuracionSemanas,
        planEtapas: data.planEtapas,
        abanicoDeTemas: {
          create: data.topics.map((t) => ({
            titulo: t.titulo,
            descripcion: t.descripcion,
            dificultad: t.dificultad as any,
          })),
        },
      },
      include: { abanicoDeTemas: true },
    });
  }

  static async findLatestByTeacher(teacherId: string) {
    return prisma.teacherWorkflow.findFirst({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: { abanicoDeTemas: true },
    });
  }

  static async findById(id: string) {
    return prisma.teacherWorkflow.findUnique({
      where: { id },
      include: { abanicoDeTemas: true },
    });
  }

  static async updateTopicStatus(topicId: string, estado: TopicStatus) {
    return prisma.teacherWorkflowTopic.update({
      where: { id: topicId },
      data: { estado },
      include: { workflow: { include: { abanicoDeTemas: true } } },
    });
  }
}
