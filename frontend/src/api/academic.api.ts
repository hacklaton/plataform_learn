import { Course, Grade, CurriculumMilestone } from '../types/academic.types';
import { Student } from '../types/student.types';

const INITIAL_COURSES: Course[] = [
  { id: 'crs-1', name: 'Cálculo Multivariable', code: 'MAT-201', teacherName: 'Prof. Carlos Ortega', studentCount: 28, progress: 68 },
  { id: 'crs-2', name: 'Introducción a la Inteligencia Artificial', code: 'INF-305', teacherName: 'Prof. Elena Rostova', studentCount: 32, progress: 54 },
  { id: 'crs-3', name: 'Física Ondulatoria', code: 'FIS-102', teacherName: 'Prof. Roberto Baggio', studentCount: 25, progress: 80 },
  { id: 'crs-4', name: 'Estructuras de Datos Avanzadas', code: 'INF-202', teacherName: 'Prof. Elena Rostova', studentCount: 30, progress: 42 },
];

const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', name: 'Sofía Rodríguez', email: 'sofia.rodriguez@university.edu', code: '20230045', grade: 'Cálculo Multivariable', attendanceRate: 98.4, riskStatus: 'LOW', lastActive: new Date().toISOString() },
  { id: 'std-2', name: 'Alejandro Muñoz', email: 'alejandro.munoz@university.edu', code: '20230112', grade: 'Introducción a la IA', attendanceRate: 96.1, riskStatus: 'LOW', lastActive: new Date().toISOString() },
  { id: 'std-3', name: 'Camila Torres', email: 'camila.torres@university.edu', code: '20230089', grade: 'Física Ondulatoria', attendanceRate: 74.2, riskStatus: 'MODERATE', lastActive: new Date(Date.now() - 1000 * 3600 * 24).toISOString() },
  { id: 'std-4', name: 'Mateo Vasquez', email: 'mateo.vasquez@university.edu', code: '20230234', grade: 'Estructuras de Datos', attendanceRate: 48.9, riskStatus: 'CRITICAL', lastActive: new Date(Date.now() - 1000 * 3600 * 48).toISOString() },
  { id: 'std-5', name: 'Valeria Gómez', email: 'valeria.gomez@university.edu', code: '20230154', grade: 'Cálculo Multivariable', attendanceRate: 91.2, riskStatus: 'LOW', lastActive: new Date().toISOString() },
  { id: 'std-6', name: 'Diego Alvarez', email: 'diego.alvarez@university.edu', code: '20230190', grade: 'Física Ondulatoria', attendanceRate: 67.5, riskStatus: 'MODERATE', lastActive: new Date(Date.now() - 1000 * 3600 * 12).toISOString() },
  { id: 'std-7', name: 'Lucía Pineda', email: 'lucia.pineda@university.edu', code: '20230211', grade: 'Introducción a la IA', attendanceRate: 35.6, riskStatus: 'CRITICAL', lastActive: new Date(Date.now() - 1000 * 3600 * 72).toISOString() },
];

const INITIAL_GRADES: Grade[] = [
  { id: 'grd-1', studentId: 'std-1', studentName: 'Sofía Rodríguez', courseId: 'crs-1', courseName: 'Cálculo Multivariable', value: 4.8, weight: 20, assessmentName: 'Parcial 1', date: '2026-05-10', feedback: 'Excelente dominio de las derivadas parciales.' },
  { id: 'grd-2', studentId: 'std-3', studentName: 'Camila Torres', courseId: 'crs-3', courseName: 'Física Ondulatoria', value: 3.2, weight: 25, assessmentName: 'Taller Ondas', date: '2026-05-15', feedback: 'Mejorar el desarrollo de las ecuaciones armónicas.' },
  { id: 'grd-3', studentId: 'std-4', studentName: 'Mateo Vasquez', courseId: 'crs-4', courseName: 'Estructuras de Datos Avanzadas', value: 1.8, weight: 30, assessmentName: 'Examen Árboles B', date: '2026-05-20', feedback: 'No completó los casos de rebalanceo.' },
  { id: 'grd-4', studentId: 'std-7', studentName: 'Lucía Pineda', courseId: 'crs-2', courseName: 'Introducción a la Inteligencia Artificial', value: 2.1, weight: 25, assessmentName: 'Proyecto Regresión', date: '2026-05-22', feedback: 'El modelo presenta sobreajuste severo y los datos no fueron preprocesados.' },
];

const INITIAL_MILESTONES: CurriculumMilestone[] = [
  { id: 'mst-1', courseId: 'crs-1', title: 'Límites y Continuidad en R^n', description: 'Definición de límites multivariados y teorema del sándwich.', isCompleted: true },
  { id: 'mst-2', courseId: 'crs-1', title: 'Derivadas Parciales y Gradiente', description: 'Cálculo de gradiente, plano tangente e integrales iteradas.', isCompleted: true },
  { id: 'mst-3', courseId: 'crs-1', title: 'Integrales Múltiples', description: 'Integrales dobles y triples en coordenadas polares y cilíndricas.', isCompleted: false, dueDate: '2026-06-25' },
  { id: 'mst-4', courseId: 'crs-2', title: 'Búsqueda no informada e informada', description: 'Algoritmos DFS, BFS, A* y heurísticas.', isCompleted: true },
  { id: 'mst-5', courseId: 'crs-2', title: 'Modelos Lineales de Machine Learning', description: 'Regresión lineal y logística con regularización.', isCompleted: false, dueDate: '2026-06-30' },
];

const getStoredData = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

const setStoredData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const academicApi = {
  getCourses: async (): Promise<Course[]> => {
    return getStoredData('academic_courses', INITIAL_COURSES);
  },

  getStudents: async (filters?: { courseId?: string; risk?: string }): Promise<Student[]> => {
    let list = getStoredData('academic_students', INITIAL_STUDENTS);
    if (filters?.risk) {
      list = list.filter(s => s.riskStatus === filters.risk);
    }
    // We map generic courses names just as tags in this mock
    return list;
  },

  getGrades: async (studentId?: string): Promise<Grade[]> => {
    const list = getStoredData('academic_grades', INITIAL_GRADES);
    if (studentId) {
      return list.filter(g => g.studentId === studentId);
    }
    return list;
  },

  getMilestones: async (courseId?: string): Promise<CurriculumMilestone[]> => {
    const list = getStoredData('academic_milestones', INITIAL_MILESTONES);
    if (courseId) {
      return list.filter(m => m.courseId === courseId);
    }
    return list;
  },

  addGrade: async (gradeData: Omit<Grade, 'id' | 'date'>): Promise<Grade> => {
    const list = getStoredData('academic_grades', INITIAL_GRADES);
    const newGrade: Grade = {
      ...gradeData,
      id: 'grd-' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setStoredData('academic_grades', [...list, newGrade]);

    // Side effect: Recalculate student risk depending on average grade and attendance
    const students = getStoredData('academic_students', INITIAL_STUDENTS);
    const updatedStudents = students.map(s => {
      if (s.id === gradeData.studentId) {
        // Simple heuristic: if grade is very low, raise risk level
        let riskStatus = s.riskStatus;
        if (newGrade.value < 3.0) {
          riskStatus = s.attendanceRate < 70 ? 'CRITICAL' : 'MODERATE';
        }
        return { ...s, riskStatus };
      }
      return s;
    });
    setStoredData('academic_students', updatedStudents);

    return newGrade;
  },

  toggleMilestone: async (id: string): Promise<CurriculumMilestone> => {
    const list = getStoredData('academic_milestones', INITIAL_MILESTONES);
    let updatedMilestone!: CurriculumMilestone;
    const updated = list.map(m => {
      if (m.id === id) {
        updatedMilestone = { ...m, isCompleted: !m.isCompleted };
        return updatedMilestone;
      }
      return m;
    });
    setStoredData('academic_milestones', updated);

    // Update course progress
    if (updatedMilestone) {
      const courses = getStoredData('academic_courses', INITIAL_COURSES);
      const courseMilestones = updated.filter(m => m.courseId === updatedMilestone.courseId);
      const completedCount = courseMilestones.filter(m => m.isCompleted).length;
      const progress = Math.round((completedCount / courseMilestones.length) * 100) || 0;

      const updatedCourses = courses.map(c => {
        if (c.id === updatedMilestone.courseId) {
          return { ...c, progress };
        }
        return c;
      });
      setStoredData('academic_courses', updatedCourses);
    }

    return updatedMilestone;
  }
};
