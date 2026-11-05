# Ejercicios Prácticos - Clases 3 y 4

## Instrucciones

Los ejercicios están diseñados para practicar los conceptos de cada clase. Deben completarse en orden.

---

## Clase 3: Estado Global y Context API

### Ejercicio 1: Cart Context

**Objetivo**: Crear un Context para manejar un carrito de compras.

**Archivo a crear**: `src/context/CartContext.tsx`

**Requisitos**:

1. Tipos necesarios:
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: Product[];
  total: number;
  itemCount: number;
}

interface CartContextType extends CartState {
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}
```

2. Funcionalidades:
   - Agregar producto al carrito
   - Si el producto ya existe, incrementar cantidad
   - Eliminar producto del carrito
   - Actualizar cantidad de un producto
   - Calcular total automáticamente
   - Contar productos automáticamente
   - Vaciar carrito

3. Proveedor:
   - Crear `CartProvider`
   - Crear hook `useCart`
   - Exportar correctamente

**Tiempo estimado**: 15 minutos

**Testing**:
```typescript
// En un componente
const { items, total, addItem, removeItem } = useCart();

addItem({ id: 1, name: 'Producto 1', price: 100, quantity: 1 });
console.log(items); // [{ id: 1, name: 'Producto 1', price: 100, quantity: 1 }]
console.log(total); // 100

addItem({ id: 1, name: 'Producto 1', price: 100, quantity: 1 });
console.log(items); // [{ id: 1, name: 'Producto 1', price: 100, quantity: 2 }]
console.log(total); // 200
```

---

### Ejercicio 2: Theme Context

**Objetivo**: Crear un Context para manejar el tema de la aplicación.

**Archivo a crear**: `src/context/ThemeContext.tsx`

**Requisitos**:

1. Tipos necesarios:
```typescript
type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
```

2. Colores para cada tema:
```typescript
const lightColors: ThemeColors = {
  background: '#FFFFFF',
  text: '#111827',
  primary: '#3B82F6',
  secondary: '#6B7280',
  border: '#E5E7EB',
};

const darkColors: ThemeColors = {
  background: '#111827',
  text: '#FFFFFF',
  primary: '#3B82F6',
  secondary: '#9CA3AF',
  border: '#374151',
};
```

3. Funcionalidades:
   - Cambiar entre light/dark
   - Obtener colores del tema actual
   - Toggle theme
   - Set theme específico

4. Extra (Opcional):
   - Persistir tema en AsyncStorage
   - Detectar tema del sistema con `useColorScheme()`

**Tiempo estimado**: 15 minutos

**Testing**:
```typescript
// En un componente
const { theme, colors, toggleTheme } = useTheme();

console.log(theme); // 'light'
console.log(colors.background); // '#FFFFFF'

toggleTheme();
console.log(theme); // 'dark'
console.log(colors.background); // '#111827'
```

---

### Ejercicio 3: Notification Context

**Objetivo**: Crear un Context para sistema de notificaciones toast.

**Archivo a crear**: `src/context/NotificationContext.tsx`

**Requisitos**:

1. Tipos necesarios:
```typescript
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
```

2. Funcionalidades:
   - Mostrar notificaciones de diferentes tipos
   - Auto-dismiss después de X segundos (default: 3000ms)
   - Dismiss manual
   - Dismiss all
   - Stack de notificaciones (máximo 5)

3. Extra (Opcional):
   - Componente visual para mostrar notificaciones
   - Animaciones de entrada/salida

**Tiempo estimado**: 20 minutos

**Testing**:
```typescript
// En un componente
const { showSuccess, showError } = useNotification();

showSuccess('Éxito', 'Producto agregado al carrito');
// Muestra notificación verde con título "Éxito"

showError('Error', 'No se pudo conectar al servidor');
// Muestra notificación roja con título "Error"
```

---

## Clase 4: Navegación Avanzada

### Ejercicio 1: Configurar Tabs

**Objetivo**: Crear un Tab Navigator con 4 tabs.

**Archivos a crear/modify**:
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx` (Home)
- `app/(tabs)/students.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/settings.tsx`

**Requisitos**:

1. Configurar tabs con iconos:
```typescript
// Tab Home - icono home
// Tab Students - icono people + badge con contador
// Tab Profile - icono person
// Tab Settings - icono settings
```

2. Estilos:
   - Tab activo: color #3B82F6
   - Tab inactivo: color #6B7280
   - Tab bar: fondo blanco, borde superior gris

3. Badge dinámico:
   - Usar el CartContext del ejercicio anterior
   - Mostrar badge con cantidad de productos en Students tab

**Tiempo estimado**: 15 minutos

---

### Ejercicio 2: Deep Linking

**Objetivo**: Configurar deep linking para abrir estudiante por ID.

**Archivos a crear/modify**:
- `app.json`
- `app/students/[id].tsx`

**Requisitos**:

1. Configurar scheme en app.json:
```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

2. Crear pantalla de detalle de estudiante:
```typescript
// app/students/[id].tsx
export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Cargar estudiante con useStudents hook
  // Mostrar información del estudiante
}
```

3. Testing:
```bash
# Test deep link
npx uri-scheme open "myapp://students/123" --ios
npx uri-scheme open "myapp://students/456" --android
```

**Tiempo estimado**: 15 minutos

---

### Ejercicio 3: Auth Flow

**Objetivo**: Implementar flujo de autenticación completo.

**Archivos a crear/modify**:
- `app/_layout.tsx`
- `app/login.tsx`
- `app/register.tsx`
- `src/context/AuthContext.tsx` (ya creado, usarlo)

**Requisitos**:

1. Modificar `app/_layout.tsx`:
```typescript
export default function RootLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Stack>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="students/[id]" />
    </Stack>
  );
}
```

2. Crear pantalla de login:
   - Formulario con email y password
   - Botón de login
   - Link a register
   - Usar `useAuth()` hook

3. Crear pantalla de registro:
   - Formulario con email, password y confirm password
   - Botón de registro
   - Link a login
   - Usar `useAuth()` hook

4. Implementar logout:
   - Agregar botón de logout en Profile tab
   - Limpiar sesión y navegar a login

**Tiempo estimado**: 20 minutos

---

## Proyecto Integrador

**Objetivo**: Crear una aplicación completa que integre todo lo aprendido.

**Funcionalidades requeridas**:

1. **Autenticación**:
   - Login
   - Register
   - Logout
   - Protected routes

2. **Navegación**:
   - Tabs: Home, Students, Profile, Settings
   - Stack: Students → Student Detail
   - Deep linking: `myapp://students/:id`

3. **Estado Global**:
   - AuthContext: usuario autenticado
   - ThemeContext: tema light/dark
   - CartContext: carrito de compras
   - NotificationContext: notificaciones toast

4. **Funcionalidades**:
   - Ver lista de estudiantes
   - Ver detalle de estudiante
   - Agregar al carrito (simulado)
   - Cambiar tema
   - Ver notificaciones

**Archivos sugeridos**:
```
src/
├── context/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   ├── CartContext.tsx
│   └── NotificationContext.tsx
├── hooks/
│   ├── useStudents.ts
│   └── useAuth.ts
├── components/
│   ├── StudentCard.tsx
│   ├── StudentList.tsx
│   ├── LoginForm.tsx
│   ├── Notification.tsx
│   └── Loading.tsx
└── app/
    ├── _layout.tsx
    ├── login.tsx
    ├── register.tsx
    ├── (tabs)/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── students.tsx
    │   ├── profile.tsx
    │   └── settings.tsx
    └── students/
        └── [id].tsx
```

**Tiempo estimado**: 2-3 horas

---

## Criterios de Evaluación

### Clase 3: Estado Global

- **CartContext**: 30%
- **ThemeContext**: 30%
- **NotificationContext**: 40%

### Clase 4: Navegación

- **Tabs**: 30%
- **Deep Linking**: 30%
- **Auth Flow**: 40%

### Proyecto Integrador

- **Funcionalidad**: 40%
- **Código limpio**: 30%
- **Context API**: 20%
- **Navegación**: 10%

---

## Recursos de Ayuda

### Documentación:
- [React Context](https://react.dev/reference/react/createContext)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org/)

### Ejemplos:
- Ver archivos existentes en el proyecto
- Revisar `ERRORES_AVANZADOS_DETALLE.md`
- Consultar `CLASE-3-ESTADO-GLOBAL-CONTEXT.md`
- Consultar `CLASE-4-NAVEGACION-AVANZADA.md`

---

**Fecha**: Octubre 2026  
**Versión**: 1.0
