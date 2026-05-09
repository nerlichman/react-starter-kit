/**
 * Settings Profile screen — maps to Inertia component 'settings/profiles/show'
 *
 * Editable name form. On submit:
 *   - PATCH /settings/profile (Inertia)
 *   - Server redirects to /settings/profile with flash[:notice]
 *   - FlashToaster shows a native success toast
 *   - On validation error, the form displays inline errors
 */

import React from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

import ScreenHeader from "../../../components/ScreenHeader"
import AppLayout from "../../../layouts/AppLayout"
import {
  Link,
  type PageComponent,
  useForm,
  usePage,
} from "../../../lib/inertia"
import type { SettingsProfileProps } from "../../../shared/types"

const SettingsProfileScreen: PageComponent = () => {
  const { props } = usePage<SettingsProfileProps>()

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
          <ActivityIndicator color="#fff" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
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
  value: {
    fontSize: 17,
    color: "#000",
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
    color: "#2563eb",
    fontWeight: "500",
  },
})

