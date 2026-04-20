/**
 * Settings Profile screen — maps to Inertia component 'settings/profiles/show'
 *
 * Placeholder for Phase 1. Will be fully built in Phase 3.
 */

import React from "react"
import { View, Text, ScrollView, StyleSheet } from "react-native"

import { usePage, type PageComponent } from "../../../lib/inertia"
import AppLayout from "../../../layouts/AppLayout"
import type { SettingsProfileProps } from "../../../shared/types"

const SettingsProfileScreen: PageComponent = () => {
  const { props } = usePage<SettingsProfileProps>()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile Settings</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{props.auth.user.name}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{props.auth.user.email}</Text>
      </View>
    </ScrollView>
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
    gap: 4,
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
})
