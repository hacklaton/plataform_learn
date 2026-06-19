import { Alert } from '../types/alert.types';

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    title: 'Inasistencia Crítica Detectada',
    description: 'Mateo Vasquez ha acumulado 4 inasistencias consecutivas en Estructuras de Datos Avanzadas.',
    level: 'CRITICAL',
    type: 'ATTENDANCE',
    studentId: 'std-4',
    studentName: 'Mateo Vasquez',
    timestamp: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    isRead: false,
    channels: { email: 'SENT', push: 'SENT', sms: 'SENT' }
  },
  {
    id: 'alt-2',
    title: 'Alerta de Rendimiento Académico',
    description: 'El promedio ponderado de Lucía Pineda ha descendido a 2.1 tras la última entrega del Proyecto Regresión.',
    level: 'WARNING',
    type: 'ACADEMIC',
    studentId: 'std-7',
    studentName: 'Lucía Pineda',
    timestamp: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
    isRead: false,
    channels: { email: 'SENT', push: 'SENT', sms: 'PENDING' }
  },
  {
    id: 'alt-3',
    title: 'Anomalía Detectada en Zona Gris',
    description: 'Valeria Gómez mantiene 91.2% de asistencia pero promedio reprobatorio en Cálculo Multivariable.',
    level: 'WARNING',
    type: 'BEHAVIORAL',
    studentId: 'std-5',
    studentName: 'Valeria Gómez',
    timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
    isRead: true,
    channels: { email: 'SENT', push: 'SENT' }
  },
  {
    id: 'alt-4',
    title: 'Inicio Exitoso de Respaldos',
    description: 'El agente de base de datos completó la replicación incremental a Redis y Postgres sin incidencias.',
    level: 'INFO',
    type: 'SYSTEM',
    timestamp: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
    isRead: true,
    channels: { email: 'PENDING', push: 'SENT' }
  }
];

const getStoredData = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

const setStoredData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const notificationsApi = {
  getAlerts: async (): Promise<Alert[]> => {
    return getStoredData('alerts_list', INITIAL_ALERTS);
  },

  markAsRead: async (id: string): Promise<Alert> => {
    const list = getStoredData('alerts_list', INITIAL_ALERTS);
    let updatedAlert!: Alert;
    const updated = list.map(a => {
      if (a.id === id) {
        updatedAlert = { ...a, isRead: true };
        return updatedAlert;
      }
      return a;
    });
    setStoredData('alerts_list', updated);
    return updatedAlert;
  },

  markAllAsRead: async (): Promise<void> => {
    const list = getStoredData('alerts_list', INITIAL_ALERTS);
    const updated = list.map(a => ({ ...a, isRead: true }));
    setStoredData('alerts_list', updated);
  },

  triggerAlert: async (alertData: Omit<Alert, 'id' | 'timestamp' | 'isRead' | 'channels'>): Promise<Alert> => {
    const list = getStoredData('alerts_list', INITIAL_ALERTS);
    const newAlert: Alert = {
      ...alertData,
      id: 'alt-' + Date.now(),
      timestamp: new Date().toISOString(),
      isRead: false,
      channels: {
        email: 'SENT',
        push: 'SENT',
        sms: alertData.level === 'CRITICAL' ? 'SENT' : 'PENDING'
      }
    };
    setStoredData('alerts_list', [newAlert, ...list]);
    return newAlert;
  }
};
