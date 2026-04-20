/**
 * Dashboard screen — maps to Inertia component 'dashboard/index'
 *
 * Equivalent to app/frontend/pages/dashboard/index.tsx on web.
 */

import React from "react"
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native"

import { usePage, router, Link, type PageComponent } from "../../lib/inertia"
import AppLayout from "../../layouts/AppLayout"
import type { DashboardProps } from "../../shared/types"

const DashboardScreen: PageComponent = () => {
  const { props } = usePage<DashboardProps>()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    router.reload({
      onFinish: () => setRefreshing(false),
    })
  }, [])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.welcome}>
        Welcome back, {props.auth.user.name}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Getting Started</Text>
        <Text style={styles.cardText}>
          This is your Inertia React Native app, powered by the same Rails
          backend as your web app. The data you see here was fetched using the
          Inertia protocol — no separate API needed.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Text style={styles.cardText}>
          Email: {props.auth.user.email}
        </Text>
        <Text style={styles.cardText}>
          Verified: {props.auth.user.verified ? "Yes" : "No"}
        </Text>
        <Text style={styles.cardText}>
          Joined: {new Date(props.auth.user.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Link href="/settings/profile" style={styles.link}>
        <Text style={styles.linkText}>Go to Settings →</Text>
      </Link>
    </ScrollView>
  )
}

// App screens use the AppLayout (with tab bar)
DashboardScreen.layout = (page) => <AppLayout>{page}</AppLayout>

export default DashboardScreen

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
  welcome: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  cardText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  link: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "500",
  },
})
