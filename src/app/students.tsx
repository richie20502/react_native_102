/**
 * Pantalla de lista de estudiantes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useStudents } from '../hooks/useStudents';
import StudentList from '../components/StudentList';
import { ErrorMessage, Loading } from '../components';
import { studentService } from '../services/studentService';

export default function StudentsScreen() {
  const router = useRouter();
  const { students, loading, error, refresh } = useStudents();
  const [refreshing, setRefreshing] = useState(false);

  const handleStudentPress = (student: any) => {
    router.push(`/student/${student.id}`);
  };

  const handleDeleteStudent = async (id: number) => {
    Alert.alert(
      'Eliminar estudiante',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentService.delete(id);
              refresh();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el estudiante');
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (loading && !refreshing) {
    return <Loading message="Cargando estudiantes..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refresh} />;
  }

  return (
    <View style={styles.container}>
      <StudentList 
        students={students} 
        onStudentPress={handleStudentPress} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
});
