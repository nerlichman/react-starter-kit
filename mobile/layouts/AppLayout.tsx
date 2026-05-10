/**
 * App layout — main layout for authenticated screens.
 *
 * Uses react-native-bottom-tabs for a real native UITabBarController (iOS)
 * and BottomNavigationView (Android). On iOS 26+, liquid glass is automatic.
 *
 * The tab bar is just UI — tapping a tab calls router.visit().
 * Same pattern as the web sidebar layout.
 */

import React, { type ReactNode, useEffect, useMemo, useState } from "react"
import { View, SafeAreaView, StyleSheet } from "react-native"
import TabView, { type AppleIcon } from "react-native-bottom-tabs"

import { router, usePage } from "../lib/inertia"
import { useTheme, type Theme } from "../lib/theme"

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

// `href` is where tapping the tab navigates; `prefix` is the URL pattern that
// keeps the tab highlighted (so /settings/sessions still lights up Settings).
const tabConfig: Record<string, { href: string; prefix: string }> = {
  dashboard: { href: "/dashboard", prefix: "/dashboard" },
  settings: { href: "/settings/profile", prefix: "/settings" },
}

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { url } = usePage()
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  // Derive the URL-driven tab index every render — no useEffect lag, so when
  // a Link navigates into a tabbed screen, the tab updates in the same paint
  // as the screen content (otherwise the new screen flashes inside the old
  // tab's slot for one frame).
  const urlIndex = routes.findIndex((r) =>
    url.startsWith(tabConfig[r.key]!.prefix),
  )
  const resolvedUrlIndex = urlIndex >= 0 ? urlIndex : 0

  // Optimistic state purely so a tab tap shows its highlight before the
  // network fetch lands. Cleared once the URL catches up.
  const [optimisticIndex, setOptimisticIndex] = useState<number | null>(null)
  useEffect(() => {
    if (optimisticIndex !== null && optimisticIndex === resolvedUrlIndex) {
      setOptimisticIndex(null)
    }
  }, [optimisticIndex, resolvedUrlIndex])

  const index = optimisticIndex ?? resolvedUrlIndex

  return (
    <TabView
      sidebarAdaptable
      tabLabelStyle={{ fontWeight: "normal", fontSize: 10 }}
      navigationState={{ index, routes }}
      onIndexChange={(newIndex) => {
        setOptimisticIndex(newIndex)
        const href = tabConfig[routes[newIndex]!.key]?.href
        if (!href) return
        // A tab tap is a context switch, not a step in a navigation stack:
        // drop any back-history accumulated within the previous tab so the
        // target tab root never shows a back arrow (standard iOS behavior).
        router.clearHistory()
        router.replace(href)
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

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    scene: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  })
