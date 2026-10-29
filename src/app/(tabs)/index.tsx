/**
 * Pantalla de inicio (Home)
 * Muestra un mensaje de bienvenida al usuario
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
          <Text style={styles.welcomeSubtitle}>
            {user?.email || 'Usuario'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          
          <View style={styles.actionCard}>
            <Text style={styles.actionIcon}>📝</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver estudiantes</Text>
              <Text style={styles.actionDescription}>
                Administra la lista de estudiantes
              </Text>
            </View>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionIcon}>➕</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Agregar estudiante</Text>
              <Text style={styles.actionDescription}>
                Registra un nuevo estudiante
              </Text>
            </View>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionIcon}>👤</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mi perfil</Text>
              <Text style={styles.actionDescription}>
                Ver y editar tu información
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});
