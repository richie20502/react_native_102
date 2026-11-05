/**
 * Pantalla de ajustes
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Apariencia
          </Text>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Modo oscuro
            </Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notificaciones
          </Text>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => showSuccess('Exito', 'Operacion completada correctamente')}
          >
            <Text style={[styles.notificationButtonText, { color: '#10B981' }]}>
              Mostrar Exito
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => showError('Error', 'Algo salio mal')}
          >
            <Text style={[styles.notificationButtonText, { color: '#EF4444' }]}>
              Mostrar Error
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => showWarning('Advertencia', 'Accion requerida')}
          >
            <Text style={[styles.notificationButtonText, { color: '#F59E0B' }]}>
              Mostrar Advertencia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => showInfo('Informacion', 'Datos actualizados')}
          >
            <Text style={[styles.notificationButtonText, { color: '#3B82F6' }]}>
              Mostrar Informacion
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acerca de
          </Text>

          <View style={styles.aboutItem}>
            <Text style={[styles.aboutLabel, { color: colors.secondary }]}>
              Version
            </Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>
              1.0.0
            </Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={[styles.aboutLabel, { color: colors.secondary }]}>
              Build
            </Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>
              2026.10.14
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  notificationButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  notificationButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 16,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});
