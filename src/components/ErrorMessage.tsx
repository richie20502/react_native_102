/**
 * Componente de mensaje de error
 * Muestra errores de forma amigable al usuario con opción de reintentar
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ApiError } from '../utils/errorHandler';

interface ErrorMessageProps {
  error: ApiError | string;
  onRetry?: () => void;
}

export default function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  /**
   * ERROR #4: Validación Defensiva de Datos de Error
   * 
   * SITUACIÓN INICIAL:
   * - Se asume que error siempre es un objeto con propiedad message
   * - No se considera que error puede ser null, undefined o string
   * 
   * CÓDIGO PROBLEMÁTICO:
   * ```typescript
   * const message = typeof error === 'string' ? error : error.message;
   * ```
   * 
   * PROBLEMA IDENTIFICADO:
   * 1. TypeScript no detecta el error porque el tipo es union: ApiError | string
   * 2. Si error es null/undefined, error.message causa TypeError en runtime
   * 3. El backend puede enviar respuestas inesperadas:
   *    - Error de red: error puede ser null
   *    - Timeout: error puede ser undefined
   *    - Parsing error: error puede ser objeto vacío {}
   *    - Error de validación: error puede ser string directo
   * 
   * ESCENARIOS DE FALLO:
   * 
   * Escenario 1: Backend envía null
   * ```typescript
   * // API Response
   * { error: null }
   * 
   * // En el componente
   * typeof null === 'string' // false
   * null.message // CRASH: Cannot read property 'message' of null
   * ```
   * 
   * Escenario 2: Error de parsing JSON
   * ```typescript
   * // API devuelve HTML en lugar de JSON (ej: error 500 del servidor)
   * // Axios falla al parsear y error es un objeto AxiosError sin message
   * ```
   * 
   * Escenario 3: Error de red sin respuesta
   * ```typescript
   * // Sin conexión a internet
   * // error es undefined en algunos casos
   * ```
   * 
   * SOLUCIÓN IMPLEMENTADA:
   * 1. Usar optional chaining (?.) para acceder a message de forma segura
   * 2. Agregar fallback ('Error desconocido') para casos edge
   * 3. Validar en orden: string → objeto con message → fallback
   * 
   * CÓDIGO CORREGIDO:
   * ```typescript
   * const message = typeof error === 'string' 
   *   ? error 
   *   : error?.message || 'Error desconocido';
   * ```
   * 
   * RESULTADOS POR CASO:
   * - error = "Network Error" → "Network Error" (string directo)
   * - error = { message: "Not found" } → "Not found" (objeto con message)
   * - error = null → "Error desconocido" (fallback)
   * - error = undefined → "Error desconocido" (fallback)
   * - error = {} → "Error desconocido" (objeto vacío)
   * 
   * LECCIÓN APRENDIDA:
   * Siempre validar datos que vienen de fuentes externas (API, props, etc.)
   * TypeScript no puede protegernos de datos que no cumplen el tipo en runtime.
   */
  const message = typeof error === 'string' 
    ? error 
    : (error && error.message) ? error.message : 'Error desconocido';

  /**
   * ERROR #5: Stale Closure en Callbacks
   * 
   * SITUACIÓN INICIAL:
   * - useCallback sin dependencias captura valores del momento de creación
   * - Si onRetry cambia, el callback usa la versión antigua (stale)
   * 
   * CÓDIGO PROBLEMÁTICO:
   * ```typescript
   * const handleRetry = useCallback(() => {
   *   if (onRetry) {
   *     Alert.alert('Reintentar', '¿Seguro?', [
   *       { text: 'Sí', onPress: onRetry }  // ← onRetry capturado en closure
   *     ]);
   *   }
   * }, []);  // ← Array vacío: sin dependencias
   * ```
   * 
   * PROBLEMA IDENTIFICADO:
   * 1. Los closures capturan valores en el momento de creación del callback
   * 2. Si onRetry cambia, handleRetry todavía usa el valor antiguo
   * 3. Esto causa bugs sutiles y difíciles de debuggear
   * 
   * EJEMPLO CONCRETO:
   * 
   * Render 1:
   * ```typescript
   * onRetry = () => fetchData('/api/students')
   * handleRetry se crea y captura esta referencia
   * ```
   * 
   * Render 2 (después de algún cambio):
   * ```typescript
   * onRetry = () => fetchData('/api/students?page=2')
   * handleRetry NO se recrea (array de dependencias vacío)
   * ```
   * 
   * Usuario hace tap en "Reintentar":
   * ```typescript
   * handleRetry ejecuta la versión ANTIGUA: fetchData('/api/students')
   * En lugar de: fetchData('/api/students?page=2')
   * ```
   * 
   * SÍNTOMAS EN PRODUCCIÓN:
   * - Botón de retry usa datos antiguos
   * - Formularios submiten valores antiguos
   * - Paginación no funciona correctamente
   * - Filtros no se aplican después de cambios
   * 
   * SOLUCIÓN IMPLEMENTADA:
   * 1. Usar useRef para mantener referencia SIEMPRE actualizada
   * 2. Actualizar el ref en useEffect cada vez que onRetry cambie
   * 3. Usar ref.current en el callback para obtener valor actual
   * 
   * CÓDIGO CORREGIDO:
   * ```typescript
   * const onRetryRef = useRef(onRetry);
   * 
   * useEffect(() => {
   *   onRetryRef.current = onRetry;  // Mantener ref actualizada
   * }, [onRetry]);
   * 
   * const handleRetry = useCallback(() => {
   *   if (onRetryRef.current) {
   *     Alert.alert('Reintentar', '¿Seguro?', [
   *       { text: 'Sí', onPress: () => onRetryRef.current?.() }
   *     ]);
   *   }
   * }, []);  // Sin dependencias porque usamos ref
   * ```
   * 
   * ALTERNATIVA (más simple pero con advertencia):
   * ```typescript
   * const handleRetry = useCallback(() => {
   *   if (onRetry) {
   *     Alert.alert('Reintentar', '¿Seguro?', [
   *       { text: 'Sí', onPress: onRetry }
   *     ]);
   *   }
   * }, [onRetry]);  // onRetry como dependencia
   * ```
   * 
   * Nota: La alternativa con [onRetry] recrea el callback cada vez que onRetry
   * cambia, lo cual puede causar re-renders innecesarios si handleRetry se pasa
   * como prop a componentes hijos.
   * 
   * VERIFICACIÓN:
   * 1. Crear escenario donde onRetry cambie entre renders
   * 2. Verificar que handleRetry siempre usa la última versión
   * 3. Usar console.log para comparar valores capturados vs actuales
   */
  const onRetryRef = useRef(onRetry);
  
  useEffect(() => {
    // Mantener referencia actualizada cada vez que onRetry cambie
    onRetryRef.current = onRetry;
  }, [onRetry]);

  /**
   * ERROR #6: Dependencias Faltantes en Hooks de React
   * 
   * SITUACIÓN INICIAL:
   * - useCallback que usa una prop pero no la incluye en dependencias
   * - ESLint warning ignorado o desactivado
   * 
   * CÓDIGO PROBLEMÁTICO:
   * ```typescript
   * const handleRetry = useCallback(() => {
   *   if (onRetry) {
   *     Alert.alert(
   *       'Reintentar',
   *       '¿Seguro que deseas intentar de nuevo?',
   *       [
   *         { text: 'Cancelar', style: 'cancel' },
   *         { text: 'Sí', onPress: onRetry }  // ← Usa onRetry
   *       ]
   *     );
   *   }
   * }, []);  // ← NO incluye onRetry en dependencias
   * ```
   * 
   * PROBLEMA IDENTIFICADO:
   * 1. Viola las reglas de React Hooks (React Hook useCallback has missing dependency)
   * 2. ESLint warning: "React Hook useCallback has a missing dependency: 'onRetry'"
   * 3. Crea stale closure (ver ERROR #5)
   * 4. Puede causar bugs difíciles de reproducir
   * 
   * REGLA DE HOOKS:
   * "Todo lo que uses dentro de un hook debe estar en el array de dependencias"
   * 
   * POR QUÉ ES PELIGROSO IGNORAR ESTO:
   * - React optimiza basándose en dependencias
   * - Si falta una dependencia, React no sabe que debe recrear el callback
   * - El callback usa valores antiguos (stale)
   * - Bugs que solo aparecen en ciertos escenarios
   * 
   * SOLUCIÓN IMPLEMENTADA:
   * Combinación de useRef + useEffect para evitar la dependencia:
   * 
   * ```typescript
   * // 1. Crear ref para mantener referencia actualizada
   * const onRetryRef = useRef(onRetry);
   * 
   * // 2. Actualizar ref cuando onRetry cambie
   * useEffect(() => {
   *   onRetryRef.current = onRetry;
   * }, [onRetry]);
   * 
   * // 3. Usar ref.current en lugar de onRetry directo
   * const handleRetry = useCallback(() => {
   *   if (onRetryRef.current) {
   *     Alert.alert('Reintentar', '¿Seguro?', [
   *       { text: 'Sí', onPress: () => onRetryRef.current?.() }
   *     ]);
   *   }
   * }, []);  // Sin dependencias porque usamos ref
   * ```
   * 
   * OTRAS SOLUCIONES POSIBLES:
   * 
   * Opción 1: Agregar dependencia (simple pero recrea callback)
   * ```typescript
   * const handleRetry = useCallback(() => {
   *   if (onRetry) {
   *     Alert.alert(...);
   *   }
   * }, [onRetry]);  // Dependencia agregada
   * ```
   * 
   * Opción 2: Usar función directamente sin useCallback (si no hay optimización necesaria)
   * ```typescript
   * const handleRetry = () => {
   *   if (onRetry) {
   *     Alert.alert(...);
   *   }
   * };
   * ```
   * 
   * VERIFICACIÓN:
   * 1. Instalar ESLint plugin react-hooks
   * 2. Verificar que no hay warnings de missing dependencies
   * 3. Usar React DevTools para verificar que callbacks se actualizan
   */
  const handleRetry = useCallback(() => {
    if (onRetryRef.current) {
      Alert.alert(
        'Reintentar',
        '¿Seguro que deseas intentar de nuevo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Sí', 
            // Usar ref.current para obtener la última versión
            onPress: () => onRetryRef.current && onRetryRef.current() 
          }
        ]
      );
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/**
         * ERROR #7: Accesibilidad en Contenido No Textual (Emojis)
         * 
         * SITUACIÓN INICIAL:
         * - Emoji usado como icono visual sin alternativa textual
         * - Screen readers no pueden interpretar el significado
         * 
         * CÓDIGO PROBLEMÁTICO:
         * ```typescript
         * <Text style={styles.icon}>⚠️</Text>
         * ```
         * 
         * PROBLEMA IDENTIFICADO:
         * 1. Emojis son contenido no textual según WCAG 2.1
         * 2. Screen readers anuncian: "warning emoji" o "triangular flag emoji"
         * 3. Usuario con discapacidad visual no entiende el contexto
         * 4. No sabe si es un error, advertencia, o solo decoración
         * 5. Violación de WCAG 2.1 Success Criterion 1.1.1 (Non-text Content)
         * 
         * EXPERIENCIA DEL USUARIO:
         * 
         * Sin accesibilidad:
         * - VoiceOver: "warning emoji" ← ¿Qué significa? ¿Es un error?
         * - TalkBack: "warning emoji" ← No hay contexto
         * 
         * Con accesibilidad:
         * - VoiceOver: "Advertencia, image" ← Claro y conciso
         * - TalkBack: "Advertencia, image" ← Usuario entiende el contexto
         * 
         * SOLUCIÓN IMPLEMENTADA:
         * 1. accessibilityLabel - Texto alternativo que describe el emoji
         * 2. accessibilityRole - Indica que es una imagen (para contexto adicional)
         * 3. El emoji visual permanece para usuarios que pueden verlo
         * 
         * CÓDIGO CORREGIDO:
         * ```typescript
         * <Text 
         *   style={styles.icon}
         *   accessibilityLabel="Advertencia"
         *   accessibilityRole="image"
         * >
         *   ⚠️
         * </Text>
         * ```
         * 
         * ALTERNATIVA MEJORADA (icono vectorial):
         * En producción, preferir iconos vectoriales sobre emojis:
         * ```typescript
         * import { WarningIcon } from 'react-native-vector-icons/MaterialIcons';
         * 
         * <WarningIcon 
         *   size={48} 
         *   color="#FFA500"
         *   accessibilityLabel="Advertencia"
         * />
         * ```
         * 
         * VENTAJAS DE ICONOS VECTORIALES:
         * - Renderizado consistente entre plataformas
         * - Mejor control de tamaño y color
         * - No dependen de la fuente del sistema
         * - Accesibilidad más fácil de implementar
         * 
         * VERIFICACIÓN:
         * 1. Activar VoiceOver (iOS) o TalkBack (Android)
         * 2. Navegar al componente de error
         * 3. Verificar que se anuncia "Advertencia" y no solo "emoji"
         */}
        <Text 
          style={styles.icon}
          accessibilityLabel="Advertencia"
          accessibilityRole="image"
        >
          ⚠️
        </Text>
      </View>
      <Text style={styles.title}>¡Oops!</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
          accessible={true}
          accessibilityLabel="Reintentar"
          accessibilityHint="Vuelve a intentar la operación fallida"
        >
          <Text style={styles.retryText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
