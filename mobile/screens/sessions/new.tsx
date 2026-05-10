/**
 * Login screen — maps to Inertia component 'sessions/new'
 *
 * Equivalent to app/frontend/pages/sessions/new.tsx on web.
 */

import React, { useMemo } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native"

import { useForm, Link, type PageComponent } from "../../lib/inertia"
import AuthLayout from "../../layouts/AuthLayout"
import { useTheme, type Theme } from "../../lib/theme"

const LoginScreen: PageComponent = () => {
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
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
            placeholderTextColor={theme.colors.textMuted}
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
            placeholderTextColor={theme.colors.textMuted}
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/sign_up">
          <Text style={styles.footerLink}>Sign up</Text>
        </Link>
      </View>
    </View>
  )
}

// Auth screens use the AuthLayout (no tab bar)
LoginScreen.layout = (page) => <AuthLayout>{page}</AuthLayout>

export default LoginScreen

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
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
      color: theme.colors.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    error: {
      fontSize: 13,
      color: theme.colors.danger,
    },
    button: {
      backgroundColor: theme.colors.inverseSurface,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.colors.onInverseSurface,
      fontSize: 16,
      fontWeight: "600",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 24,
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    footerLink: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "500",
    },
  })
