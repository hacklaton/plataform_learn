export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDY';
export type AttendanceMethod = 'BIOMETRIC' | 'MANUAL';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  timestamp: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  confidence?: number; // confidence percentage for face recognition
}

export interface BiometricLog {
  id: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  timestamp: string;
  confidence?: number;
  status: 'SUCCESS' | 'UNKNOWN' | 'FAILED';
  capturedImage?: string;
}
