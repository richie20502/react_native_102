import { useState } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";

interface LoginFormProps {
    onLogin: (email: string, password: string) => void;
    loading?: boolean;
    error?: string;
}

export default function LoginForm({
    onLogin,
    loading,
    error
}: LoginFormProps) {
    const router = useRouter();
    const { colors } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        onLogin(email, password);
    };

    const hasError = error && error.length > 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Iniciar sesion</Text>

            <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Email"
                placeholderTextColor={colors.secondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="Contrasena"
                placeholderTextColor={colors.secondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCorrect={false}
            />

            {hasError && (
                <Text style={styles.error}>{error}</Text>
            )}

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Validando..." : "Iniciar sesion"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/register")} style={styles.linkContainer}>
                <Text style={[styles.link, { color: colors.primary }]}>
                    No tienes cuenta? Registrate
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
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
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    error: {
        color: "#EF4444",
        marginBottom: 15,
        textAlign: "center",
    },
    button: {
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    linkContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    link: {
        fontSize: 14,
    },
});
