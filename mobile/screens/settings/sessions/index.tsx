/**
 * Settings Sessions screen — maps to Inertia component 'settings/sessions/index'
 *
 * Lists all of the user's active sessions and lets them revoke any except
 * the current one. The destroy redirects back to /settings/sessions with a
 * flash[:notice], which the FlashToaster will surface.
 */

import React, { useMemo } from "react"
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
import { useTheme, type Theme } from "../../../lib/theme"
import type { SettingsSessionsProps, Session } from "../../../shared/types"

const SettingsSessionsScreen: PageComponent = () => {
  const { props } = usePage<SettingsSessionsProps>()
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])
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

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 20,
      gap: 12,
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
    list: {
      gap: 12,
    },
    card: {
      backgroundColor: theme.colors.surface,
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
      color: theme.colors.text,
    },
    badge: {
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    meta: {
      fontSize: 13,
      color: theme.colors.textMuted,
    },
    revokeButton: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.dangerSurface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginTop: 8,
    },
    revokeText: {
      color: theme.colors.dangerStrong,
      fontSize: 14,
      fontWeight: "600",
    },
  })
