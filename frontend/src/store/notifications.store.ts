import { create } from 'zustand';
import { Alert } from '../types/alert.types';
import { notificationsApi } from '../api/notifications.api';

interface NotificationsState {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  fetchAlerts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNewAlert: (alertData: Omit<Alert, 'id' | 'timestamp' | 'isRead' | 'channels'>) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,

  fetchAlerts: async () => {
    set({ isLoading: true });
    try {
      const alerts = await notificationsApi.getAlerts();
      const unreadCount = alerts.filter((a) => !a.isRead).length;
      set({ alerts, unreadCount, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const updated = await notificationsApi.markAsRead(id);
      const updatedAlerts = get().alerts.map((a) => (a.id === id ? updated : a));
      const unreadCount = updatedAlerts.filter((a) => !a.isRead).length;
      set({ alerts: updatedAlerts, unreadCount });
    } catch (e) {
      console.error(e);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      const updatedAlerts = get().alerts.map((a) => ({ ...a, isRead: true }));
      set({ alerts: updatedAlerts, unreadCount: 0 });
    } catch (e) {
      console.error(e);
    }
  },

  addNewAlert: async (alertData) => {
    try {
      const newAlert = await notificationsApi.triggerAlert(alertData);
      const alerts = [newAlert, ...get().alerts];
      set({ alerts, unreadCount: alerts.filter((a) => !a.isRead).length });
    } catch (e) {
      console.error(e);
    }
  }
}));
