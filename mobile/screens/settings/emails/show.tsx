/**
 * Settings Email screen — maps to Inertia component 'settings/emails/show'
 */

import React from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native"

import {
  usePage,
  useForm,
  useBack,
  type PageComponent,
} from "../../../lib/inertia"
import AppLayout from "../../../layouts/AppLayout"
import type { SettingsEmailProps } from "../../../shared/types"

const SettingsEmailScreen: PageComponent = () => {
  const { props } = usePage<SettingsEmailProps>()
  const { canGoBack, back } = useBack()

  const form = useForm({
    email: props.auth.user.email,
    password_challenge: "",
  })

  const onSave = () => {
    form.patch("/settings/email", {
      onSuccess: () =>
        form.setData((prev) => ({ ...prev, password_challenge: "" })),
    })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {canGoBack ? (
        <Pressable onPress={back} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
      ) : null}

      <Text style={styles.title}>Email</Text>
      <Text style={styles.subtitle}>
        Update the email address associated with your account
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={form.data.email}
          onChangeText={(v) => form.setData("email", v)}
          style={styles.input}
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

      <View style={styles.card}>
        <Text style={styles.label}>Current password</Text>
        <TextInput
          value={form.data.password_challenge}
          onChangeText={(v) => form.setData("password_challenge", v)}
          style={styles.input}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          editable={!form.processing}
        />
        {form.errors.password_challenge ? (
          <Text style={styles.error}>{form.errors.password_challenge}</Text>
        ) : null}
      </View>

      {props.auth.user.verified ? null : (
        <Text style={styles.warning}>
          Your email is not yet verified. Please check your inbox.
        </Text>
      )}

      <Pressable
        style={[
          styles.saveButton,
          (!form.isDirty || form.processing) && styles.saveButtonDisabled,
        ]}
        onPress={onSave}
        disabled={!form.isDirty || form.processing}
      >
        {form.processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Update email</Text>
        )}
      </Pressable>
    </ScrollView>
  )
}

SettingsEmailScreen.layout = (page) => <AppLayout>{page}</AppLayout>

export default SettingsEmailScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    fontSize: 17,
    color: "#2563eb",
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 17,
    color: "#000",
    paddingVertical: 6,
  },
  error: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 4,
  },
  warning: {
    fontSize: 13,
    color: "#b45309",
    paddingHorizontal: 4,
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
})
