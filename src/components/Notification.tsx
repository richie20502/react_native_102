/**
 * Componente de notificacion toast
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNotification } from '../context/NotificationContext';

interface NotificationProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  };
  onDismiss: (id: string) => void;
}

const typeColors = {
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export default function Notification({ notification, onDismiss }: NotificationProps) {
  const backgroundColor = typeColors[notification.type];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        {notification.message && (
          <Text style={styles.message}>{notification.message}</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => onDismiss(notification.id)}>
        <Text style={styles.dismiss}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },
  dismiss: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
