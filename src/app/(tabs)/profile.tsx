/**
 * Pantalla de perfil del usuario
 * Muestra información del usuario y botón de logout
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components';

export default function ProfileScreen() {
  const { user, loading, logout, isAuthenticated } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <Loading message="Cargando perfil..." />;
  }

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No hay sesión activa</Text>
      </View>
    );
  }

  // Confirmar logout
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {user.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de cuenta</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>ID de usuario:</Text>
          <Text style={styles.value}>{user.id}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.value, styles.activeStatus]}>Activo</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Configuración</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notificaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>Ayuda</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  profileCard: {
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
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  activeStatus: {
    color: '#10B981',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});
