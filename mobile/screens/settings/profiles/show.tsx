/**
 * Settings Profile screen — maps to Inertia component 'settings/profiles/show'
 *
 * Editable name form. On submit:
 *   - PATCH /settings/profile (Inertia)
 *   - Server redirects to /settings/profile with flash[:notice]
 *   - FlashToaster shows a native success toast
 *   - On validation error, the form displays inline errors
 */

import React, { useMemo } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

import AppLayout from "../../../layouts/AppLayout"
import {
  Link,
  type PageComponent,
  useForm,
  usePage,
} from "../../../lib/inertia"
import { useTheme, type Theme } from "../../../lib/theme"
import type { SettingsProfileProps } from "../../../shared/types"

const SettingsProfileScreen: PageComponent = () => {
  const { props } = usePage<SettingsProfileProps>()
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  const form = useForm({ name: props.auth.user.name })

  const onSave = () => {
    form.patch("/settings/profile", {
      onSuccess: () => form.setDefaults(),
    })
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={form.data.name}
          onChangeText={(value) => form.setData("name", value)}
          style={styles.input}
          autoCapitalize="words"
          editable={!form.processing}
        />
        {form.errors.name ? (
          <Text style={styles.error}>{form.errors.name}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{props.auth.user.email}</Text>
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
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </Pressable>

      <View style={styles.subLinks}>
        <Link href="/settings/password" style={styles.subLink}>
          <Text style={styles.subLinkText}>Change password →</Text>
        </Link>
        <Link href="/settings/email" style={styles.subLink}>
          <Text style={styles.subLinkText}>Change email →</Text>
        </Link>
        <Link href="/settings/sessions" style={styles.subLink}>
          <Text style={styles.subLinkText}>Active sessions →</Text>
        </Link>
      </View>
      </ScrollView>
    </>
  )
}

SettingsProfileScreen.layout = (page) => <AppLayout>{page}</AppLayout>

export default SettingsProfileScreen

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
    value: {
      fontSize: 17,
      color: theme.colors.text,
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
    subLinks: {
      marginTop: 8,
      gap: 4,
    },
    subLink: {
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    subLinkText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: "500",
    },
  })
