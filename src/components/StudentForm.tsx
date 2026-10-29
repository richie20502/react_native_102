/**
 * Formulario para crear/editar estudiantes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Keyboard } from 'react-native';
import { Student } from '../types/student';

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export default function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  const [nombre, setNombre] = useState(student?.nombre || '');
  const [apellido, setApellido] = useState(student?.apellido || '');
  const [matricula, setMatricula] = useState(student?.matricula || '');
  const [email, setEmail] = useState(student?.email || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nombre.trim() || !apellido.trim() || !matricula.trim() || !email.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        matricula: matricula.trim(),
        email: email.trim(),
      });
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el estudiante');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setNombre('');
    setApellido('');
    setMatricula('');
    setEmail('');
  }, []);

  useEffect(() => {
    if (!student) {
      resetForm();
    }
  }, [student, resetForm]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
      />
      <TextInput
        style={styles.input}
        placeholder="Matrícula"
        value={matricula}
        onChangeText={setMatricula}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {student ? 'Actualizar' : 'Crear'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
