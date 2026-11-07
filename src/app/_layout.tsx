/**
 * Layout raíz de la aplicación
 */

import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import { CartProvider } from "../context/CartContext";
import { NotificationProvider } from "../context/NotificationContext";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Stack>
              <Stack.Screen
                name="index"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="login"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="register"
                options={{ title: 'Registro' }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />
            </Stack>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
