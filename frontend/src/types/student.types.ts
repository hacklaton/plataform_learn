export type RiskLevel = 'LOW' | 'MODERATE' | 'CRITICAL';

export interface Student {
  id: string;
  name: string;
  email: string;
  code: string;
  grade: string;
  attendanceRate: number;
  riskStatus: RiskLevel;
  profileImage?: string;
  lastActive?: string;
}

export interface StudentStats {
  totalStudents: number;
  averageAttendance: number;
  criticalRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
}
