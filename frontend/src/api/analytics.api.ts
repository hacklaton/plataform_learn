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
    // Return sample correlation coordinates
    return [
      { id: '1', name: 'Sofía Rodríguez', attendance: 98, gpa: 4.8, risk: 'LOW' },
      { id: '2', name: 'Alejandro Muñoz', attendance: 96, gpa: 4.5, risk: 'LOW' },
      { id: '3', name: 'Valeria Gómez', attendance: 91, gpa: 4.1, risk: 'LOW' },
      { id: '4', name: 'Camila Torres', attendance: 74, gpa: 3.2, risk: 'MODERATE' },
      { id: '5', name: 'Diego Alvarez', attendance: 67, gpa: 3.0, risk: 'MODERATE' },
      { id: '6', name: 'Mateo Vasquez', attendance: 48, gpa: 1.8, risk: 'CRITICAL' },
      { id: '7', name: 'Lucía Pineda', attendance: 35, gpa: 2.1, risk: 'CRITICAL' },
      // Other anonymous students to populate chart
      { id: 's8', name: 'Juan A.', attendance: 88, gpa: 3.8, risk: 'LOW' },
      { id: 's9', name: 'Diana K.', attendance: 92, gpa: 4.2, risk: 'LOW' },
      { id: 's10', name: 'Carlos P.', attendance: 60, gpa: 2.9, risk: 'MODERATE' },
      { id: 's11', name: 'Ana M.', attendance: 52, gpa: 2.4, risk: 'CRITICAL' },
      { id: 's12', name: 'Laura B.', attendance: 78, gpa: 3.5, risk: 'LOW' },
      { id: 's13', name: 'Ricardo G.', attendance: 41, gpa: 1.9, risk: 'CRITICAL' },
      { id: 's14', name: 'Gabriela S.', attendance: 85, gpa: 3.7, risk: 'LOW' },
      { id: 's15', name: 'Daniel R.', attendance: 70, gpa: 3.1, risk: 'MODERATE' },
    ];
  },

  getClusters: async (): Promise<ClusterSummary[]> => {
    return [
      { name: 'Grupo Excelencia (Bajo Riesgo)', size: 45, avgAttendance: 94.2, avgGpa: 4.4, color: '#10b981' },
      { name: 'Grupo Inestable (Moderado)', size: 18, avgAttendance: 72.5, avgGpa: 3.1, color: '#f59e0b' },
      { name: 'Grupo Deserción Crítica', size: 8, avgAttendance: 44.1, avgGpa: 2.0, color: '#f43f5e' },
    ];
  },

  getGreyZoneStudents: async (): Promise<{ studentId: string; name: string; attendanceRate: number; gpa: number; anomalyReason: string }[]> => {
    // Borderline/Grey zone anomalies detected by the AI model
    return [
      {
        studentId: 'std-3',
        name: 'Camila Torres',
        attendanceRate: 74.2,
        gpa: 3.2,
        anomalyReason: 'Rendimiento académico a la baja (-1.2 pts esta quincena) a pesar de mantener asistencia regular.'
      },
      {
        studentId: 'std-5',
        name: 'Valeria Gómez',
        attendanceRate: 91.2,
        gpa: 2.8,
        anomalyReason: 'Asistencia perfecta pero calificaciones reprobatorias continuas en Cálculo. Posible déficit de aprendizaje.'
      },
      {
        studentId: 's10',
        name: 'Carlos P.',
        attendanceRate: 60.1,
        gpa: 3.8,
        anomalyReason: 'Excelente rendimiento académico pero caída abrupta del 25% en la asistencia semanal. Riesgo de deserción por factores externos.'
      }
    ];
  },

  getHistoricalTrends: async (): Promise<HistoricalTrend[]> => {
    return [
      { year: '2022', desertionRate: 12.4, retentionRate: 87.6 },
      { year: '2023', desertionRate: 10.1, retentionRate: 89.9 },
      { year: '2024', desertionRate: 8.5, retentionRate: 91.5 },
      { year: '2025', desertionRate: 6.2, retentionRate: 93.8 },
      { year: '2026 (Predicción AI)', desertionRate: 3.9, retentionRate: 96.1, prediction: true },
    ];
  }
};
