import { z } from 'zod';
import { Role } from '../constants/roles.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.nativeEnum(Role),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  department: z.string().optional(),
  enrollmentCode: z.string().optional(),
  grade: z.string().optional(),
  phone: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === Role.STUDENT && !data.enrollmentCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['enrollmentCode'],
      message: 'Enrollment code is required for students',
    });
  }
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
