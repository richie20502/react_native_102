/**
 * Lista de notificaciones
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNotification } from '../context/NotificationContext';
import Notification from './Notification';

export default function NotificationList() {
  const { notifications, dismiss } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <SafeAreaView style={styles.container}>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={dismiss}
        />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
