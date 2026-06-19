export interface Course {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  studentCount: number;
  progress: number; // percentage of curriculum completed
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  value: number; // e.g. 0 to 100 or 0 to 5
  weight: number; // percentage of final grade
  assessmentName: string; // e.g. "Examen Parcial 1", "Proyecto Final"
  feedback?: string;
  date: string;
}

export interface CurriculumMilestone {
  id: string;
  courseId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: string;
}
