# Errores Avanzados - Detalle y Soluciones

## ERROR #11: ErrorBoundary - Memory Leak en Reset

**Archivo**: `src/components/ErrorBoundary.tsx`  
**Línea**: 30-32  
**Severidad**: Alta  
**Categoría**: Memory Leak / React Class Components

### Problema

El método `handleReset` modifica el estado directamente sin verificar si el componente sigue montado. En escenarios donde el ErrorBoundary se desmonta mientras se ejecuta el reset, puede causar memory leaks.

### Código con Error

```typescript
private handleReset = () => {
  this.setState({ hasError: false, error: null });
};
```

### Solución

```typescript
export default class ErrorBoundary extends Component<Props, State> {
  private isMounted: boolean = false;

  public componentDidMount() {
    this.isMounted = true;
  }

  public componentWillUnmount() {
    this.isMounted = false;
  }

  private handleReset = () => {
    if (this.isMounted) {
      this.setState({ hasError: false, error: null });
    }
  };

  // ... resto del código
}
```

---

## ERROR #12: LoginForm - Race Condition con mountedRef

**Archivo**: `src/components/LoginForm.tsx`  
**Línea**: 7, 9-13  
**Severidad**: Alta  
**Categoría**: Race Condition / Memory Leak

### Problema

El `mountedRef` se define pero nunca se usa. Además, el `handleLogin` es async pero no maneja correctamente el estado de montaje del componente. Si el usuario navega a otra pantalla mientras el login está en proceso, se produce un race condition.

### Código con Error

```typescript
const mountedRef = useRef(true);

useEffect(() => {
    return () => {
        mountedRef.current = false;
    };
}, []);

const handleLogin = async () => {
    onLogin(email, password);  // No usa mountedRef
};
```

### Solución

```typescript
export default function LoginForm({ onLogin, loading, error }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleLogin = async () => {
        if (!mountedRef.current) return;
        await onLogin(email, password);
    };

    // O eliminar mountedRef si no se necesita
}
```

**Alternativa**: Si no hay operaciones asíncronas en el componente, eliminar el `mountedRef` completamente.

---

## ERROR #13: studentService - Cache Sin Límite (Memory Leak)

**Archivo**: `src/services/studentService.ts`  
**Línea**: 8-9  
**Severidad**: Alta  
**Categoría**: Memory Leak / Cache Management

### Problema

El `Map` cache crece indefinidamente sin límite. En una app que se usa por horas con muchos estudiantes, el cache puede consumir demasiada memoria.

### Código con Error

```typescript
private cache = new Map<string, { data: any; timestamp: number }>();
private readonly CACHE_TTL = 5 * 60 * 1000;
```

### Solución - Implementar LRU Cache

```typescript
class StudentService {
  private baseUrl = '/api/students';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private readonly MAX_CACHE_SIZE = 50; // Límite de 50 items

  private cleanCache() {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      // Eliminar los items más antiguos
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.cleanCache();
  }

  async getAll(): Promise<Student[]> {
    const cacheKey = 'all-students';
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const response = await apiClient.get<{ data: Student[] }>(this.baseUrl);
    const students = response.data.data;
    
    this.setCache(cacheKey, students);
    
    return students;
  }

  // ... resto de métodos usando setCache en lugar de cache.set
}
```

---

## ERROR #14: AuthContext - Re-renders Innecesarios

**Archivo**: `src/context/AuthContext.tsx`  
**Línea**: 49-58  
**Severidad**: Media  
**Categoría**: Performance / React Context

### Problema

El objeto `value` se crea en cada render, causando que todos los componentes que consumen el contexto se re-rendericen innecesariamente, incluso si solo cambia `loading` y no `user`.

### Código con Error

```typescript
const value: AuthContextType = {
  user,
  loading,
  error,
  isAuthenticated,
  login,
  logout,
};

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
```

### Solución - Memoizar el value

```typescript
const value = useMemo<AuthContextType>(() => ({
  user,
  loading,
  error,
  isAuthenticated,
  login,
  logout,
}), [user, loading, error, isAuthenticated, login, logout]);

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
```

---

## ERROR #15: useAuth - Memory Leak en Multiple Effects

**Archivo**: `src/hooks/useAuth.ts`  
**Línea**: 107-117  
**Severidad**: Alta  
**Categoría**: Memory Leak / Race Condition

### Problema

El hook tiene dos efectos que pueden causar race conditions:
1. El effect de `checkAuth` se ejecuta al montar
2. El effect de cleanup establece `isMounted.current = false`

Si `checkAuth` es una operación asíncrona y el componente se desmonta antes de que termine, el estado se intenta actualizar en un componente desmontado.

### Código con Error

```typescript
const isMounted = useRef(true);

const checkAuth = useCallback(async () => {
  try {
    const token = await getAccessToken();
    // ... operaciones async
    const user = await authApi.getCurrentUser();
    
    if (isMounted.current) {
      setState({ user, loading: false, error: null, isAuthenticated: true });
    }
  } catch (error) {
    // ...
  }
}, []);

useEffect(() => {
  isMounted.current = true;
  checkAuth();
  
  return () => {
    isMounted.current = false;
  };
}, [checkAuth]);
```

### Solución - AbortController para Cancelar Requests

```typescript
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<UseAuthState>({
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async (signal?: AbortSignal) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setState(prev => ({ ...prev, isAuthenticated: false }));
        return;
      }

      setState(prev => ({ ...prev, loading: true }));
      
      const user = await authApi.getCurrentUser(signal);
      
      if (!signal?.aborted) {
        setState({
          user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      if (!signal?.aborted) {
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    checkAuth(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, [checkAuth]);

  // ... resto del código
}
```

---

## ERROR #16: students.tsx - Estado Sin Usar (refreshing)

**Archivo**: `src/app/students.tsx`  
**Línea**: 14, 36-40  
**Severidad**: Baja  
**Categoría**: Code Quality / Unused State

### Problema

El estado `refreshing` y la función `onRefresh` se definen pero nunca se usan en el componente. Falta el `RefreshControl` en el `FlatList`.

### Código con Error

```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await refresh();
  setRefreshing(false);
}, [refresh]);

// ... en el return
<View style={styles.container}>
  <StudentList 
    students={students} 
    onStudentPress={handleStudentPress} 
  />
</View>
```

### Solución - Pasar RefreshControl al StudentList

```typescript
// Opción 1: Pasar onRefresh como prop
<StudentList 
  students={students} 
  onStudentPress={handleStudentPress}
  onRefresh={onRefresh}
  refreshing={refreshing}
/>

// Opción 2: Eliminar estado no usado
// Si no se implementa pull-to-refresh, eliminar el código
```

**En StudentList.tsx**:

```typescript
interface StudentListProps {
  students: Student[];
  onStudentPress: (student: Student) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function StudentList({ 
  students, 
  onStudentPress,
  onRefresh,
  refreshing = false
}: StudentListProps) {
  // ...

  return (
    <View style={styles.container}>
      <TextInput /* ... */ />
      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron estudiantes</Text>
        }
      />
    </View>
  );
}
```

---

## ERROR #17: StudentList - keyExtractor Incorrecto con Index

**Archivo**: `src/components/StudentList.tsx`  
**Línea**: 26  
**Severidad**: Media  
**Categoría**: Performance / React Anti-pattern

### Problema

Usar `index` en el `keyExtractor` es un anti-pattern en React. Si la lista cambia (agregar, eliminar, reordenar), React no puede optimizar correctamente el re-renderizado y puede causar bugs visuales.

### Código con Error

```typescript
<FlatList
  data={filteredStudents}
  renderItem={renderStudent}
  keyExtractor={(item, index) => `${item.id}-${index}`}  // index innecesario
  // ...
/>
```

### Solución

```typescript
<FlatList
  data={filteredStudents}
  renderItem={renderStudent}
  keyExtractor={(item) => item.id.toString()}  // Solo ID
  // ...
/>
```

**Nota**: Si hay IDs duplicados (no debería), usar combinación de campos únicos:

```typescript
keyExtractor={(item) => `${item.id}-${item.matricula}`}
```

---

## ERROR #18: StudentForm - Callback sin Dependencias

**Archivo**: `src/components/StudentForm.tsx`  
**Línea**: 38-42  
**Severidad**: Media  
**Categoría**: React Hooks / ESLint Rule

### Problema

El `useCallback` de `resetForm` no tiene dependencias, pero `useEffect` lo usa como dependencia. Esto causa que el effect se ejecute en cada render innecesariamente.

### Código con Error

```typescript
const resetForm = useCallback(() => {
  setNombre('');
  setApellido('');
  setMatricula('');
  setEmail('');
}, []);  // Sin dependencias

useEffect(() => {
  if (!student) {
    resetForm();
  }
}, [student, resetForm]);  // resetForm como dependencia
```

### Solución

```typescript
// Opción 1: Mover la lógica al useEffect directamente
useEffect(() => {
  if (!student) {
    setNombre('');
    setApellido('');
    setMatricula('');
    setEmail('');
  }
}, [student]);  // Solo student como dependencia

// Opción 2: Eliminar resetForm si no se usa en otro lado
```

---

## ERROR #19: useStudents - Optimistic Update sin Rollback Correcto

**Archivo**: `src/hooks/useStudents.ts`  
**Línea**: 29-46  
**Severidad**: Alta  
**Categoría**: UX / Data Consistency

### Problema

El optimistic update elimina el estudiante de la lista inmediatamente, pero si el delete falla, solo muestra un error. Sin embargo, hay un bug: `previousStudents` captura el estado ANTES del update, pero si hay múltiples deletes en secuencia, el rollback puede restaurar una lista desactualizada.

### Código con Error

```typescript
const deleteStudent = useCallback(async (id: number) => {
  const previousStudents = state.students;  // Captura estado actual
  
  setState(prev => ({
    ...prev,
    students: prev.students.filter(s => s.id !== id),
  }));

  try {
    await studentService.delete(id);
  } catch (error) {
    setState(prev => ({
      ...prev,
      students: previousStudents,  // Problema: puede ser estado desactualizado
      error: 'Error al eliminar estudiante',
    }));
  }
}, [state.students]);
```

### Solución - Usar functional update

```typescript
const deleteStudent = useCallback(async (id: number) => {
  // Guardar referencia del estudiante eliminado
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
    // Restaurar solo el estudiante eliminado
    setState(prev => ({
      ...prev,
      students: deletedStudent ? [...prev.students, deletedStudent] : prev.students,
      error: 'Error al eliminar estudiante',
    }));
  }
}, []);  // Sin dependencia de state.students
```

---

## ERROR #20: SearchBar - Debounce Timer sin Cleanup en Unmount

**Archivo**: `src/components/SearchBar.tsx`  
**Línea**: 18-28  
**Severidad**: Alta  
**Categoría**: Memory Leak / Race Condition

### Problema

El timer del debounce se limpia en el effect, pero hay un bug: el effect que ejecuta `onChangeText` tiene `localValue` como dependencia, lo que significa que se crea un nuevo timer en cada carácter escrito. Si el usuario escribe "juan" rápido, se crean 4 timers.

### Código con Error

```typescript
useEffect(() => {
  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current);
  }

  debounceTimer.current = setTimeout(() => {
    onChangeText(localValue);
  }, debounceMs);

  return () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };
}, [localValue, debounceMs]);  // Se ejecuta en cada cambio de localValue
```

### Solución - Usar useCallback para el debounce

```typescript
export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = "Buscar...", 
  onClear,
  debounceMs = 300
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar con el valor externo
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Función de debounce con useCallback
  const debouncedOnChange = useCallback(
    debounce((text: string) => {
      onChangeText(text);
    }, debounceMs),
    [onChangeText, debounceMs]
  );

  useEffect(() => {
    debouncedOnChange(localValue);
    
    return () => {
      debouncedOnChange.cancel();
    };
  }, [localValue, debouncedOnChange]);

  const handleClear = () => {
    setLocalValue('');
    if (onClear) {
      onClear();
    }
  };

  // ... resto del componente
}

// Helper function para debounce con cancel
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return debounced;
}
```

**Alternativa más simple**:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    onChangeText(localValue);
  }, debounceMs);

  return () => {
    clearTimeout(timer);
  };
}, [localValue, debounceMs, onChangeText]);  // Agregar onChangeText como dependencia
```

---

## Resumen de Severidad

| Error | Severidad | Categoría | Dificultad |
|-------|-----------|-----------|------------|
| #11 - ErrorBoundary | Alta | Memory Leak | Avanzado |
| #12 - LoginForm | Alta | Race Condition | Avanzado |
| #13 - studentService | Alta | Memory Leak | Avanzado |
| #14 - AuthContext | Media | Performance | Intermedio |
| #15 - useAuth | Alta | Memory Leak | Avanzado |
| #16 - students.tsx | Baja | Code Quality | Básico |
| #17 - StudentList | Media | Performance | Intermedio |
| #18 - StudentForm | Media | React Hooks | Intermedio |
| #19 - useStudents | Alta | Data Consistency | Avanzado |
| #20 - SearchBar | Alta | Memory Leak | Avanzado |

---

## Conceptos Clave para Enseñar

1. **Memory Leaks en React Native**
   - Timers sin cleanup
   - Event listeners sin remover
   - Suscripciones sin cancelar
   - AbortController para requests

2. **Race Conditions**
   - Operaciones async en componentes que se desmontan
   - Multiple requests simultáneos
   - Cache invalidation

3. **React Performance**
   - Memoización con useMemo/useCallback
   - keyExtractor correcto
   - Evitar re-renders innecesarios

4. **Cache Management**
   - LRU Cache
   - TTL (Time To Live)
   - Invalidation strategies

5. **Optimistic Updates**
   - Rollback strategies
   - Error handling
   - State consistency

---

**Fecha**: Octubre 2026  
**Versión**: 1.0
