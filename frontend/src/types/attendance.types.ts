export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDY';
export type AttendanceMethod = 'BIOMETRIC' | 'MANUAL';
export type BiometricScanStatus = 'SUCCESS' | 'UNKNOWN' | 'MISMATCH' | 'ERROR' | 'NO_FACE_REGISTERED';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  role?: string;
  timestamp: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  confidence?: number;
}

export interface BiometricLog {
  id: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  timestamp: string;
  confidence?: number;
  status: BiometricScanStatus;
  capturedImage?: string;
}

export interface BiometricScanResult {
  id?: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  timestamp: string;
  confidence?: number;
  status: BiometricScanStatus;
  message?: string;
}

export interface RegisterFaceResult {
  success: boolean;
  message: string;
}

// ── Monthly types ────────────────────────────────────────────
export interface MonthlyAttendanceDay {
  date: string; // "YYYY-MM-DD"
  records: AttendanceRecord[];
  presentCount: number;
  absentCount: number;
  tardyCount: number;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  tardyCount: number;
  attendanceRate: number;
}

export interface UserMonthlySummary {
  userId: string;
  userName: string;
  role: string;
  daysPresent: number;
  daysAbsent: number;
  daysTardy: number;
  attendanceRate: number;
  records: { id: string; timestamp: string; status: AttendanceStatus; method: AttendanceMethod }[];
}
