/**
 * Settings Sessions screen — maps to Inertia component 'settings/sessions/index'
 *
 * Lists all of the user's active sessions and lets them revoke any except
 * the current one. The destroy redirects back to /settings/sessions with a
 * flash[:notice], which the FlashToaster will surface.
 */

import React from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native"

import {
  usePage,
  router,
  type PageComponent,
} from "../../../lib/inertia"
import AppLayout from "../../../layouts/AppLayout"
import ScreenHeader from "../../../components/ScreenHeader"
import type { SettingsSessionsProps, Session } from "../../../shared/types"

const SettingsSessionsScreen: PageComponent = () => {
  const { props } = usePage<SettingsSessionsProps>()
  const currentSessionId = props.auth.session.id

  const revoke = (session: Session) => {
    Alert.alert(
      "Revoke session?",
      "This device will be signed out.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: () => router.delete(`/sessions/${session.id}`),
        },
      ],
    )
  }

  return (
    <>
      <ScreenHeader title="Sessions" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sessions</Text>
      <Text style={styles.subtitle}>
        Manage your active sessions across devices
      </Text>

      <View style={styles.list}>
        {props.sessions.map((session) => {
          const isCurrent = session.id === currentSessionId
          return (
            <View key={session.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.userAgent} numberOfLines={2}>
                  {session.user_agent}
                </Text>
                {isCurrent ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Current</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.meta}>IP: {session.ip_address}</Text>
              <Text style={styles.meta}>
                Active since: {new Date(session.created_at).toLocaleString()}
              </Text>

              {!isCurrent ? (
                <Pressable
                  onPress={() => revoke(session)}
                  style={styles.revokeButton}
                >
                  <Text style={styles.revokeText}>Revoke</Text>
                </Pressable>
              ) : null}
            </View>
          )
        })}
      </View>
      </ScrollView>
    </>
  )
}

SettingsSessionsScreen.layout = (page) => <AppLayout>{page}</AppLayout>

export default SettingsSessionsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    gap: 12,
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
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  userAgent: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  badge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  meta: {
    fontSize: 13,
    color: "#6b7280",
  },
  revokeButton: {
    alignSelf: "flex-start",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  revokeText: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "600",
  },
})
