/**
 * Pantalla de estudiantes
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useStudents } from '../../hooks/useStudents';
import StudentList from '../../components/StudentList';
import { useTheme } from '../../context/ThemeContext';
import { ErrorMessage, Loading } from '../../components';

export default function StudentsScreen() {
  const router = useRouter();
  const { students, loading, error, refresh } = useStudents();
  const { colors } = useTheme();

  const handleStudentPress = (student: any) => {
    router.push(`/students/${student.id}`);
  };

  if (loading) {
    return <Loading message="Cargando estudiantes..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refresh} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
  },
});
