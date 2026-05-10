/**
 * Settings Password screen — maps to Inertia component 'settings/passwords/show'
 */

import React, { useMemo } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native"

import { useForm, type PageComponent } from "../../../lib/inertia"
import AppLayout from "../../../layouts/AppLayout"
import ScreenHeader from "../../../components/ScreenHeader"
import { useTheme, type Theme } from "../../../lib/theme"

const SettingsPasswordScreen: PageComponent = () => {
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
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
    <>
      <ScreenHeader title="Password" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.saveButtonText}>Update password</Text>
        )}
      </Pressable>
      </ScrollView>
    </>
  )
}

SettingsPasswordScreen.layout = (page) => <AppLayout>{page}</AppLayout>

export default SettingsPasswordScreen

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 20,
      gap: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      gap: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      fontSize: 17,
      color: theme.colors.text,
      paddingVertical: 6,
    },
    error: {
      fontSize: 13,
      color: theme.colors.danger,
      marginTop: 4,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.primaryMuted,
    },
    saveButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 17,
      fontWeight: "600",
    },
  })
