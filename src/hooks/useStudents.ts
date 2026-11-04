/**
 * Hook personalizado para manejar la lista de estudiantes
 */

import { useState, useEffect, useCallback } from 'react';
import { studentService } from '../services/studentService';
import { Student } from '../types/student';

interface UseStudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
}

interface UseStudentsReturn extends UseStudentsState {
  refresh: () => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
}

export function useStudents(): UseStudentsReturn {
  const [state, setState] = useState<UseStudentsState>({
    students: [],
    loading: false,
    error: null,
  });

  const fetchStudents = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const students = await studentService.getAll();
      setState({ students, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar estudiantes',
      }));
    }
  }, []);

  const deleteStudent = useCallback(async (id: number) => {
    let deletedStudent: Student | undefined;
    
    setState(prev => {
      deletedStudent = prev.students.find(s => s.id === id);
      return {
        ...prev,
        students: prev.students.filter(s => s.id !== id),
      };
    });

    try {
      await studentService.delete(id);
    } catch (error) {
      setState(prev => ({
        ...prev,
        students: deletedStudent ? [...prev.students, deletedStudent] : prev.students,
        error: 'Error al eliminar estudiante',
      }));
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    ...state,
    refresh: fetchStudents,
    deleteStudent,
  };
}
