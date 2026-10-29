/**
 * Pantalla de detalle de estudiante
 * Muestra información completa de un estudiante específico
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useApi } from '../../hooks/useApi';
import { getStudentById, deleteStudent } from '../../api/students.api';
import { Loading, ErrorMessage } from '../../components';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: student, loading, error, execute: loadStudent } = useApi(() =>
    getStudentById(Number(id))
  );

  const { execute: executeDelete, loading: deleting } = useApi(() =>
    deleteStudent(Number(id))
  );

  // Cargar datos del estudiante
  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  // Confirmar eliminación
  const handleDelete = () => {
    Alert.alert(
      'Eliminar estudiante',
      '¿Estás seguro que deseas eliminar este estudiante?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await executeDelete();
            router.back();
          },
        },
      ]
    );
  };

  // Estado de carga
  if (loading) {
    return <Loading message="Cargando estudiante..." />;
  }

  // Estado de error
  if (error || !student) {
    return (
      <ErrorMessage
        error={error || 'Estudiante no encontrado'}
        onRetry={loadStudent}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: `${student.nombre} ${student.apellido}`,
        }}
      />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student.nombre.charAt(0)}{student.apellido.charAt(0)}
          </Text>
        </View>
        <Text style={styles.name}>
          {student.nombre} {student.apellido}
        </Text>
        <Text style={styles.matricula}>Matrícula: {student.matricula}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de contacto</Text>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>📧</Text>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{student.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>🆔</Text>
          <View style={styles.infoContent}>
            <Text style={styles.label}>ID</Text>
            <Text style={styles.value}>{student.id}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fechas</Text>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>📅</Text>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Creado</Text>
            <Text style={styles.value}>
              {new Date(student.created_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>🔄</Text>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Actualizado</Text>
            <Text style={styles.value}>
              {new Date(student.updated_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Text style={styles.deleteButton} onPress={handleDelete}>
          🗑️ Eliminar estudiante
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  matricula: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  actions: {
    padding: 20,
    alignItems: 'center',
  },
  deleteButton: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
