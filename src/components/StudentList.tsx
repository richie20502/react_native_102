/**
 * Componente de lista de estudiantes
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, TextInput, StyleSheet, Text } from 'react-native';
import StudentCard from './StudentCard';
import { Student } from '../types/student';

interface StudentListProps {
  students: Student[];
  onStudentPress: (student: Student) => void;
}

export default function StudentList({ students, onStudentPress }: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    
    const query = searchQuery.toLowerCase();
    return students.filter(student =>
      student.nombre.toLowerCase().includes(query) ||
      student.apellido.toLowerCase().includes(query) ||
      student.matricula.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const renderStudent = ({ item, index }: { item: Student; index: number }) => (
    <StudentCard student={item} onPress={() => onStudentPress(item)} />
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre, apellido o matrícula..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron estudiantes</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 40,
  },
});
