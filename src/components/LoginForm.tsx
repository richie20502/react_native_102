import { LoginFormProps } from "@/interfaces/auth.interface";
import { useState, useEffect, useRef } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginForm({
    onLogin,
    loading,
    error
}: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleLogin = async () => {
        onLogin(email, password);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar sesión</Text>

            <TextInput
                style={styles.input}
                placeholder="Usuario"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {error !== "" && (
                <Text style={styles.error}>{error}</Text>
            )}

            <Button
                title={loading ? "Validando..." : "Iniciar sesión"}
                onPress={handleLogin}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    error: {
        color: "red",
        marginBottom: 15,
        textAlign: "center",
    },
});
