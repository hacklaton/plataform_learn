import { z } from 'zod';

export const createGradeSchema = z.object({
  studentId: z.string().uuid('studentId must be a valid UUID'),
  courseId: z.string().uuid('courseId must be a valid UUID'),
  assessmentName: z.string().min(1, 'Assessment name is required'),
  value: z.number().min(0, 'Value must be >= 0').max(5, 'Value must be <= 5'),
  weight: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
});

export const updateGradeSchema = z.object({
  assessmentName: z.string().min(1).optional(),
  value: z.number().min(0).max(5).optional(),
  weight: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
});
