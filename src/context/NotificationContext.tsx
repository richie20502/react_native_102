/**
 * Context para sistema de notificaciones toast
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

const DEFAULT_DURATION = 3000;
const MAX_NOTIFICATIONS = 5;

export function NotificationProvider({ 
  children, 
  maxNotifications = MAX_NOTIFICATIONS 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const show = useCallback((type: NotificationType, title: string, message?: string, duration?: number) => {
    const id = generateId();
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: duration || DEFAULT_DURATION,
    };

    setNotifications(prev => {
      const updated = [...prev, notification];
      return updated.slice(-maxNotifications);
    });

    if (duration !== 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration || DEFAULT_DURATION);
    }
  }, [maxNotifications]);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    show('success', title, message, duration);
  }, [show]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    show('error', title, message, duration);
  }, [show]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    show('warning', title, message, duration);
  }, [show]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    show('info', title, message, duration);
  }, [show]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo<NotificationContextType>(() => ({
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
    dismissAll,
  }), [notifications, showSuccess, showError, showWarning, showInfo, dismiss, dismissAll]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
