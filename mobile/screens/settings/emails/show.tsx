/**
 * Settings Email screen — maps to Inertia component 'settings/emails/show'
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

import {
  usePage,
  useForm,
  type PageComponent,
} from "../../../lib/inertia"
import AppLayout from "../../../layouts/AppLayout"
import ScreenHeader from "../../../components/ScreenHeader"
import { useTheme, type Theme } from "../../../lib/theme"
import type { SettingsEmailProps } from "../../../shared/types"

const SettingsEmailScreen: PageComponent = () => {
  const { props } = usePage<SettingsEmailProps>()
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

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
    <>
      <ScreenHeader title="Email" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.saveButtonText}>Update email</Text>
        )}
      </Pressable>
      </ScrollView>
    </>
  )
}

SettingsEmailScreen.layout = (page) => <AppLayout>{page}</AppLayout>

export default SettingsEmailScreen

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
    warning: {
      fontSize: 13,
      color: theme.colors.warning,
      paddingHorizontal: 4,
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
