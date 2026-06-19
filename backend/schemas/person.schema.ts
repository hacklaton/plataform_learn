import { z } from 'zod';

// ── Alumnos ──────────────────────────────────────────────────────────────────
export const createStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  enrollmentCode: z.string().min(1, 'Enrollment code is required'),
  grade: z.string().optional(),
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  grade: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ── Profesores ───────────────────────────────────────────────────────────────
export const createTeacherSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  department: z.string().optional(),
});

export const updateTeacherSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});
