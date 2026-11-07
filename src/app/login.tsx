/**
 * Pantalla de login simple
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('ana@test.com');
  const [password, setPassword] = useState('secret123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      console.log('Enviando login a http://localhost:3000/api/auth/login');
      
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: email,
        password: password
      });
      
      console.log('Login exitoso:', response.data);
      
      // Guardar tokens (por ahora en variables simples)
      const { accessToken, refreshToken, user } = response.data;
      
      console.log('Access Token:', accessToken);
      console.log('User:', user);
      
      Alert.alert('Éxito', `Bienvenido ${user.email}`);
      
      // Navegar a tabs
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Error en login:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Credenciales incorrectas');
      } else if (error.response?.status === 404) {
        Alert.alert('Error', 'Usuario no encontrado');
      } else {
        Alert.alert('Error', 'No se pudo conectar al servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verificando...' : 'ENTRAR'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
