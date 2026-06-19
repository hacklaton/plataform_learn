import { AttendanceRecord, BiometricLog } from '../types/attendance.types';

// In-memory/localStorage cache for testing interactivity
const INITIAL_RECORDS: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'std-1', studentName: 'Sofía Rodríguez', studentCode: '20230045', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), status: 'PRESENT', method: 'BIOMETRIC', confidence: 98.4 },
  { id: 'att-2', studentId: 'std-2', studentName: 'Alejandro Muñoz', studentCode: '20230112', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), status: 'PRESENT', method: 'BIOMETRIC', confidence: 96.1 },
  { id: 'att-3', studentId: 'std-3', studentName: 'Camila Torres', studentCode: '20230089', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'TARDY', method: 'MANUAL' },
  { id: 'att-4', studentId: 'std-4', studentName: 'Mateo Vasquez', studentCode: '20230234', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), status: 'PRESENT', method: 'BIOMETRIC', confidence: 92.8 },
];

const INITIAL_LOGS: BiometricLog[] = [
  { id: 'log-1', studentId: 'std-1', studentName: 'Sofía Rodríguez', studentCode: '20230045', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), confidence: 98.4, status: 'SUCCESS' },
  { id: 'log-2', studentId: 'std-2', studentName: 'Alejandro Muñoz', studentCode: '20230112', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), confidence: 96.1, status: 'SUCCESS' },
  { id: 'log-3', timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(), status: 'UNKNOWN' },
  { id: 'log-4', studentId: 'std-4', studentName: 'Mateo Vasquez', studentCode: '20230234', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), confidence: 92.8, status: 'SUCCESS' },
];

const getStoredData = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

const setStoredData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const attendanceApi = {
  getAttendanceRecords: async (): Promise<AttendanceRecord[]> => {
    return getStoredData('attendance_records', INITIAL_RECORDS);
  },

  getLiveLogs: async (): Promise<BiometricLog[]> => {
    return getStoredData('biometric_logs', INITIAL_LOGS);
  },

  scanFace: async (imageBase64: string): Promise<BiometricLog> => {
    // Artificial delay to simulate neural network processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate match or no-match randomly (85% match, 15% unknown)
    const isMatched = Math.random() > 0.15;
    const confidence = parseFloat((90 + Math.random() * 9.8).toFixed(1));

    const records = getStoredData('attendance_records', INITIAL_RECORDS);
    const logs = getStoredData('biometric_logs', INITIAL_LOGS);

    const students = [
      { id: 'std-5', name: 'Valeria Gómez', code: '20230154' },
      { id: 'std-6', name: 'Diego Alvarez', code: '20230190' },
      { id: 'std-7', name: 'Lucía Pineda', code: '20230211' }
    ];

    if (isMatched) {
      const selectedStudent = students[Math.floor(Math.random() * students.length)];
      
      const newLog: BiometricLog = {
        id: 'log-' + Date.now(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentCode: selectedStudent.code,
        timestamp: new Date().toISOString(),
        confidence,
        status: 'SUCCESS',
        capturedImage: imageBase64,
      };

      const newRecord: AttendanceRecord = {
        id: 'att-' + Date.now(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentCode: selectedStudent.code,
        timestamp: new Date().toISOString(),
        status: 'PRESENT',
        method: 'BIOMETRIC',
        confidence,
      };

      setStoredData('biometric_logs', [newLog, ...logs]);
      setStoredData('attendance_records', [newRecord, ...records]);

      return newLog;
    } else {
      const newLog: BiometricLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        status: 'UNKNOWN',
        capturedImage: imageBase64,
      };

      setStoredData('biometric_logs', [newLog, ...logs]);
      return newLog;
    }
  },

  registerBiometric: async (studentId: string, _imageBase64: string): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Registered biometric pattern for student ${studentId}`);
    return { success: true };
  },

  manuallyMarkAttendance: async (studentId: string, status: 'PRESENT' | 'ABSENT' | 'TARDY'): Promise<AttendanceRecord> => {
    const records = getStoredData('attendance_records', INITIAL_RECORDS);
    
    // Find student details
    const studentNames: Record<string, {name: string, code: string}> = {
      'std-1': { name: 'Sofía Rodríguez', code: '20230045' },
      'std-2': { name: 'Alejandro Muñoz', code: '20230112' },
      'std-3': { name: 'Camila Torres', code: '20230089' },
      'std-4': { name: 'Mateo Vasquez', code: '20230234' },
      'std-5': { name: 'Valeria Gómez', code: '20230154' },
      'std-6': { name: 'Diego Alvarez', code: '20230190' },
      'std-7': { name: 'Lucía Pineda', code: '20230211' }
    };

    const info = studentNames[studentId] || { name: 'Estudiante Extra', code: '20239999' };

    const newRecord: AttendanceRecord = {
      id: 'att-' + Date.now(),
      studentId,
      studentName: info.name,
      studentCode: info.code,
      timestamp: new Date().toISOString(),
      status,
      method: 'MANUAL',
    };

    setStoredData('attendance_records', [newRecord, ...records]);
    return newRecord;
  }
};
