/**
 * App layout — main layout for authenticated screens.
 *
 * Includes a native tab bar at the bottom.
 * The tab bar is just UI — tapping a tab calls router.visit().
 * Same pattern as the web sidebar layout.
 */

import React, { type ReactNode, useCallback } from "react"
import { View, StyleSheet, SafeAreaView, Pressable, Text } from "react-native"

import { router, usePage } from "../lib/inertia"

interface TabItemConfig {
  title: string
  href: string
  /** SF Symbol name (iOS) — for Phase 3 we'll use real native tab bar */
  icon: string
}

const tabs: TabItemConfig[] = [
  { title: "Dashboard", href: "/dashboard", icon: "house" },
  { title: "Settings", href: "/settings/profile", icon: "gear" },
]

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { url } = usePage()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{children}</View>
      <TabBar currentUrl={url} />
    </SafeAreaView>
  )
}

/**
 * TabBar — placeholder using React Native views for Phase 1.
 *
 * In Phase 3, this will be replaced with a real native UITabBar
 * (via react-native-bottom-tabs or @expo/ui) that renders
 * liquid glass on iOS 26 automatically.
 *
 * The API won't change — it's still just UI that calls router.visit().
 */
function TabBar({ currentUrl }: { currentUrl: string }) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TabBarItem
          key={tab.href}
          tab={tab}
          isActive={currentUrl.startsWith(tab.href)}
        />
      ))}
    </View>
  )
}

function TabBarItem({
  tab,
  isActive,
}: {
  tab: TabItemConfig
  isActive: boolean
}) {
  const handlePress = useCallback(() => {
    router.visit(tab.href)
  }, [tab.href])

  return (
    <Pressable onPress={handlePress} style={styles.tabItem}>
      <Text
        style={[
          styles.tabLabel,
          isActive ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
      >
        {tab.title}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
    backgroundColor: "#fafafa",
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#000",
  },
  tabLabelInactive: {
    color: "#999",
  },
})
