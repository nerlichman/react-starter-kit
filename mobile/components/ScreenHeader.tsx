/**
 * ScreenHeader — a consistent header bar for sub-screens.
 *
 * Renders a back chevron (when there's history to pop) on the left and an
 * optional centered title. Designed for iOS look-and-feel; on Android the
 * styling still works but the hardware back button is also wired in
 * createInertiaApp().
 *
 * Use at the top of any non-tab-root screen:
 *
 *   <ScreenHeader title="Password" />
 *   <ScrollView>...</ScrollView>
 */

import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import { useBack } from "../lib/inertia"

interface ScreenHeaderProps {
  title?: string
  /** Render extra trailing content on the right (e.g. a save button) */
  trailing?: React.ReactNode
}

export default function ScreenHeader({ title, trailing }: ScreenHeaderProps) {
  const { canGoBack, back } = useBack()

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {canGoBack ? (
          <Pressable onPress={back} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleContainer} pointerEvents="none">
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.trailingSide]}>{trailing}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 8,
  },
  side: {
    width: 80,
    justifyContent: "center",
  },
  trailingSide: {
    alignItems: "flex-end",
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 17,
    color: "#2563eb",
    fontWeight: "500",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
})
