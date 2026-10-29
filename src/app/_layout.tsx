/**
 * Layout raíz de la aplicación
 * Configura el Stack Navigator principal
 */

import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="student/[id]"
                options={{
                    headerShown: true,
                    title: "Detalle de Estudiante",
                    headerStyle: {
                        backgroundColor: "#FFFFFF",
                    },
                    headerTitleStyle: {
                        fontWeight: "600",
                    },
                    headerTintColor: "#111827",
                }}
            />
        </Stack>
    );
}