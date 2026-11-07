/**
 * Cliente HTTP configurado con Axios
 * Incluye interceptores para manejo automático de tokens y errores
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, saveAccessToken, saveRefreshToken, clearTokens } from '../utils/storage';

// URL base del backend - cambiar según tu configuración
const API_BASE_URL = 'http://localhost:3000';

// Instancia de Axios configurada
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request: agrega el token de acceso automáticamente
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response: maneja errores 401 y renueva tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y no es un intento de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        const refreshToken = await getRefreshToken();
        
        if (!refreshToken) {
          // No hay refresh token, redirigir a login
          await clearTokens();
          return Promise.reject(error);
        }

        // Llamar al endpoint de refresh
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Guardar nuevos tokens
        await saveAccessToken(accessToken);
        await saveRefreshToken(newRefreshToken);

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Error al refrescar, limpiar tokens y rechazar
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
