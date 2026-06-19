export interface ScatterDataPoint {
  id: string;
  name: string;
  attendance: number;
  gpa: number;
  risk: 'LOW' | 'MODERATE' | 'CRITICAL';
}

export interface ClusterSummary {
  name: string;
  size: number;
  avgAttendance: number;
  avgGpa: number;
  color: string;
}

export interface HistoricalTrend {
  year: string;
  desertionRate: number;
  retentionRate: number;
  prediction?: boolean;
}
