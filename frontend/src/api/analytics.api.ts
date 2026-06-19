import { apiClient } from './api.client';

export interface ScatterDataPoint {
  id: string;
  name: string;
  attendance: number; // percentage
  gpa: number;        // scale 0.0 - 5.0
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
  desertionRate: number; // percentage
  retentionRate: number; // percentage
  prediction?: boolean;  // is this an AI projection
}

export const analyticsApi = {
  getCorrelationData: async (): Promise<ScatterDataPoint[]> => {
    const { data } = await apiClient.get('/analytics/correlation');
    return data.data;
  },

  getClusters: async (): Promise<ClusterSummary[]> => {
    const { data } = await apiClient.get('/analytics/clusters');
    return data.data;
  },

  getGreyZoneStudents: async (): Promise<{ studentId: string; name: string; attendanceRate: number; gpa: number; anomalyReason: string }[]> => {
    const { data } = await apiClient.get('/analytics/grey-zone');
    return data.data;
  },

  getHistoricalTrends: async (): Promise<HistoricalTrend[]> => {
    const { data } = await apiClient.get('/analytics/trends');
    return data.data;
  }
};
