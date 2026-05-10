/**
 * Sign-up screen — maps to Inertia component 'users/new'
 *
 * Equivalent to app/frontend/pages/users/new.tsx on web.
 */

import React, { useMemo } from "react"
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native"

import { useForm, Link, type PageComponent } from "../../lib/inertia"
import AuthLayout from "../../layouts/AuthLayout"
import { useTheme, type Theme } from "../../lib/theme"

const SignUpScreen: PageComponent = () => {
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
  const form = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const handleSubmit = () => {
    form.post("/sign_up", {
      onSuccess: () => form.reset("password", "password_confirmation"),
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>
      <Text style={styles.subtitle}>
        Enter your details below to create your account
      </Text>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, form.errors.name && styles.inputError]}
            value={form.data.name}
            onChangeText={(v) => form.setData("name", v)}
            placeholder="Full name"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            editable={!form.processing}
          />
          {form.errors.name ? (
            <Text style={styles.error}>{form.errors.name}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email address</Text>
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
            editable={!form.processing}
          />
          {form.errors.email ? (
            <Text style={styles.error}>{form.errors.email}</Text>
          ) : null}
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
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!form.processing}
          />
          {form.errors.password ? (
            <Text style={styles.error}>{form.errors.password}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={[
              styles.input,
              form.errors.password_confirmation && styles.inputError,
            ]}
            value={form.data.password_confirmation}
            onChangeText={(v) => form.setData("password_confirmation", v)}
            placeholder="Confirm password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!form.processing}
          />
          {form.errors.password_confirmation ? (
            <Text style={styles.error}>{form.errors.password_confirmation}</Text>
          ) : null}
        </View>

        <Pressable
          style={[styles.button, form.processing && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={form.processing}
        >
          <Text style={styles.buttonText}>
            {form.processing ? "Creating account..." : "Create account"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/sign_in">
          <Text style={styles.footerLink}>Log in</Text>
        </Link>
      </View>
    </View>
  )
}

SignUpScreen.layout = (page) => <AuthLayout>{page}</AuthLayout>

export default SignUpScreen

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
