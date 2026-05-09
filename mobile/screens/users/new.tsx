/**
 * Sign-up screen — maps to Inertia component 'users/new'
 *
 * Equivalent to app/frontend/pages/users/new.tsx on web.
 */

import React from "react"
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native"

import { useForm, Link, type PageComponent } from "../../lib/inertia"
import AuthLayout from "../../layouts/AuthLayout"

const SignUpScreen: PageComponent = () => {
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
})
