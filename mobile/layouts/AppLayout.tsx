/**
 * App layout — main layout for authenticated screens.
 *
 * Uses react-native-bottom-tabs for a real native UITabBarController (iOS)
 * and BottomNavigationView (Android). On iOS 26+, liquid glass is automatic.
 *
 * The tab bar is just UI — tapping a tab calls router.visit().
 * Same pattern as the web sidebar layout.
 */

import React, { type ReactNode, useState, useEffect } from "react"
import { View, SafeAreaView, StyleSheet } from "react-native"
import TabView, { type AppleIcon } from "react-native-bottom-tabs"

import { router, usePage } from "../lib/inertia"

const sfIcon = (name: string): AppleIcon => ({
  sfSymbol: name as AppleIcon["sfSymbol"],
})

const routes = [
  {
    key: "dashboard",
    title: "Dashboard",
    focusedIcon: sfIcon("house.fill"),
    unfocusedIcon: sfIcon("house"),
  },
  {
    key: "settings",
    title: "Settings",
    focusedIcon: sfIcon("gearshape.fill"),
    unfocusedIcon: sfIcon("gearshape"),
  },
]

const tabHrefs: Record<string, string> = {
  dashboard: "/dashboard",
  settings: "/settings/profile",
}

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { url } = usePage()

  // Derive active tab from the current Inertia URL
  const urlIndex = routes.findIndex((r) => url.startsWith(tabHrefs[r.key]!))
  const [index, setIndex] = useState(urlIndex >= 0 ? urlIndex : 0)

  // Sync tab selection when URL changes (after Inertia navigation completes)
  useEffect(() => {
    if (urlIndex >= 0) setIndex(urlIndex)
  }, [urlIndex])

  return (
    <TabView
      navigationState={{ index, routes }}
      onIndexChange={(newIndex) => {
        setIndex(newIndex) // Immediate visual feedback
        const href = tabHrefs[routes[newIndex]!.key]
        if (href) router.visit(href)
      }}
      renderScene={({ route }) => {
        const isActive = route.key === routes[index]?.key
        return (
          <SafeAreaView style={styles.scene}>
            {isActive ? children : <View style={styles.scene} />}
          </SafeAreaView>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    backgroundColor: "#fff",
  },
})
