/**
 * Pantalla de Login
 * Punto de entrada principal - redirige según estado de autenticación
 */

import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { useLogin } from "../hooks/useLogin";
import { LoginRequest } from "../interfaces/auth.interface";
import { getAccessToken } from "../utils/storage";

export default function LoginScreen() {
    const router = useRouter();
    const { login, loading, error } = useLogin();

    // Verificar si ya hay sesión activa
    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async () => {
        const token = await getAccessToken();
        if (token) {
            // Si hay token, ir a tabs
            router.replace("/home" as any);
        }
    };

    const handleLogin = async (data: LoginRequest) => {
        const success = await login(data);
        if (success) {
            router.replace("/home" as any);
        }
    };

    return (
        <View style={styles.container}>
            <LoginForm
                onLogin={(email, password) =>
                    handleLogin({ email, password })
                }
                loading={loading}
                error={error}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
});