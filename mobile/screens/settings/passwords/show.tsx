/**
 * Settings Password screen — maps to Inertia component 'settings/passwords/show'
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

import { useForm, useBack, type PageComponent } from "../../../lib/inertia"
import AppLayout from "../../../layouts/AppLayout"

const SettingsPasswordScreen: PageComponent = () => {
  const { canGoBack, back } = useBack()

  const form = useForm({
    password_challenge: "",
    password: "",
    password_confirmation: "",
  })

  const onSave = () => {
    form.patch("/settings/password", {
      onSuccess: () => form.reset(),
    })
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {canGoBack ? (
        <Pressable onPress={back} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
      ) : null}

      <Text style={styles.title}>Password</Text>
      <Text style={styles.subtitle}>
        Use a long password to keep your account secure
      </Text>

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

      <View style={styles.card}>
        <Text style={styles.label}>New password</Text>
        <TextInput
          value={form.data.password}
          onChangeText={(v) => form.setData("password", v)}
          style={styles.input}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          editable={!form.processing}
        />
        {form.errors.password ? (
          <Text style={styles.error}>{form.errors.password}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Confirm new password</Text>
        <TextInput
          value={form.data.password_confirmation}
          onChangeText={(v) => form.setData("password_confirmation", v)}
          style={styles.input}
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
          <Text style={styles.saveButtonText}>Update password</Text>
        )}
      </Pressable>
    </ScrollView>
  )
}

SettingsPasswordScreen.layout = (page) => <AppLayout>{page}</AppLayout>

export default SettingsPasswordScreen

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
