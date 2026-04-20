/**
 * Login screen — maps to Inertia component 'sessions/new'
 *
 * Equivalent to app/frontend/pages/sessions/new.tsx on web.
 */

import React from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native"

import { useForm, type PageComponent } from "../../lib/inertia"
import AuthLayout from "../../layouts/AuthLayout"
import type { SessionsNewProps } from "../../shared/types"

const LoginScreen: PageComponent = () => {
  const form = useForm({
    email: "",
    password: "",
  })

  const handleSubmit = () => {
    form.post("/sign_in")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>
        Enter your email and password to access your account
      </Text>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, form.errors.email && styles.inputError]}
            value={form.data.email}
            onChangeText={(v) => form.setData("email", v)}
            placeholder="email@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
          {form.errors.email && (
            <Text style={styles.error}>{form.errors.email}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, form.errors.password && styles.inputError]}
            value={form.data.password}
            onChangeText={(v) => form.setData("password", v)}
            placeholder="Password"
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />
          {form.errors.password && (
            <Text style={styles.error}>{form.errors.password}</Text>
          )}
        </View>

        <Pressable
          style={[styles.button, form.processing && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={form.processing}
        >
          <Text style={styles.buttonText}>
            {form.processing ? "Signing in..." : "Sign in"}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

// Auth screens use the AuthLayout (no tab bar)
LoginScreen.layout = (page) => <AuthLayout>{page}</AuthLayout>

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  error: {
    fontSize: 13,
    color: "#ef4444",
  },
  button: {
    backgroundColor: "#171717",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
