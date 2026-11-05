/**
 * Pantalla de login
 */

import React, { useState } from 'react';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import LoginForm from '../components/LoginForm';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const { showError } = useNotification();
  const { colors } = useTheme();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      showError('Error', 'No se pudo iniciar sesion');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoginForm
          onLogin={handleLogin}
          loading={loading}
          error={error?.message || ''}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
