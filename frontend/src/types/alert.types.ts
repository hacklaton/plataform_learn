export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertType = 'ATTENDANCE' | 'ACADEMIC' | 'BEHAVIORAL' | 'SYSTEM';

export interface Alert {
  id: string;
  title: string;
  description: string;
  level: AlertLevel;
  type: AlertType;
  studentId?: string;
  studentName?: string;
  timestamp: string;
  isRead: boolean;
  channels: {
    email: 'SENT' | 'PENDING' | 'FAILED';
    push: 'SENT' | 'PENDING' | 'FAILED';
    sms?: 'SENT' | 'PENDING' | 'FAILED';
  };
}
