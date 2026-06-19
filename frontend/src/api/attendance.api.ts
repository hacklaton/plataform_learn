import { apiClient } from './api.client';
import {
  AttendanceRecord,
  BiometricLog,
  BiometricScanResult,
  MonthlyAttendanceDay,
  MonthlySummary,
  UserMonthlySummary,
  RegisterFaceResult,
} from '../types/attendance.types';

export const attendanceApi = {
  // ── Existing endpoints ─────────────────────────────────────
  getAttendanceRecords: async (): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get('/attendance/records');
    return response.data.data;
  },

  getLiveLogs: async (): Promise<BiometricLog[]> => {
    const response = await apiClient.get('/attendance/logs');
    return response.data.data;
  },

  scanFace: async (imageBase64: string): Promise<BiometricScanResult> => {
    const response = await apiClient.post('/attendance/scan-face', { imageBase64 });
    return response.data.data;
  },

  manuallyMarkAttendance: async (
    studentId: string,
    status: 'PRESENT' | 'ABSENT' | 'TARDY',
  ): Promise<AttendanceRecord> => {
    const response = await apiClient.post('/attendance/manual', { studentId, status });
    return response.data.data;
  },

  // ── Face Registration ──────────────────────────────────────
  /** Register the calling user's own face (uses JWT identity) */
  registerMyFace: async (imageBase64: string): Promise<RegisterFaceResult> => {
    const response = await apiClient.post('/attendance/register-face', { imageBase64 });
    return response.data.data;
  },

  /** Register face for a specific user (admin only) */
  registerFaceForUser: async (userId: string, imageBase64: string): Promise<RegisterFaceResult> => {
    const response = await apiClient.post(`/attendance/register-face/${userId}`, { imageBase64 });
    return response.data.data;
  },

  // ── Monthly endpoints ──────────────────────────────────────
  getMonthlyAttendance: async (
    year: number,
    month: number,
    role?: string,
    userId?: string,
  ): Promise<MonthlyAttendanceDay[]> => {
    const params: Record<string, string> = { year: String(year), month: String(month) };
    if (role) params.role = role;
    if (userId) params.userId = userId;
    const response = await apiClient.get('/attendance/monthly', { params });
    return response.data.data;
  },

  getMonthlySummary: async (year: number, month: number): Promise<MonthlySummary> => {
    const response = await apiClient.get('/attendance/monthly/summary', {
      params: { year, month },
    });
    return response.data.data;
  },

  getUserAttendanceSummary: async (
    userId: string,
    year: number,
    month: number,
  ): Promise<UserMonthlySummary> => {
    const response = await apiClient.get(`/attendance/user/${userId}/summary`, {
      params: { year, month },
    });
    return response.data.data;
  },

  // ── CRUD on individual records ─────────────────────────────
  updateAttendanceRecord: async (
    id: string,
    status: 'PRESENT' | 'ABSENT' | 'TARDY',
  ): Promise<AttendanceRecord> => {
    const response = await apiClient.put(`/attendance/${id}`, { status });
    return response.data.data;
  },

  deleteAttendanceRecord: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data.data;
  },
};
