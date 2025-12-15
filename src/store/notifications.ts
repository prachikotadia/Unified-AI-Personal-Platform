import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'social' | 'finance' | 'fitness' | 'travel';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          read: false,
        };
        
        set((state) => {
          const updated = [newNotification, ...state.notifications].slice(0, 100);
          return {
            notifications: updated,
            unreadCount: updated.filter(n => !n.read).length,
          };
        });
      },

      markAsRead: (id: string) => {
        set((state) => {
          const updated = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter(n => !n.read).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id: string) => {
        set((state) => {
          const updated = state.notifications.filter(n => n.id !== id);
          return {
            notifications: updated,
            unreadCount: updated.filter(n => !n.read).length,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
      },
    }),
    {
      name: 'notifications-storage',
    }
  )
);

