/**
 * @inertiajs/react-native — createInertiaApp
 *
 * The entry point for an Inertia React Native app.
 * Same pattern as the web adapter's createInertiaApp.
 */

import React, { useEffect, useState, useRef } from "react"
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  BackHandler,
  Platform,
  useColorScheme,
} from "react-native"
import { registerRootComponent } from "expo"
import { StatusBar } from "expo-status-bar"

import { router } from "./router"
import { InertiaProvider } from "./context"
import { FlashToaster } from "./flash"
import type {
  ResolveComponent,
  PageComponent,
  InertiaPage,
  LayoutFunction,
} from "./types"

interface CreateInertiaAppOptions {
  /** Base URL of the Rails backend */
  baseUrl: string

  /** The initial URL to visit on app launch (default: '/dashboard') */
  initialUrl?: string

  /**
   * Resolve a component name to a React component.
   * Same as the web adapter's resolve option.
   */
  resolve: ResolveComponent

  /**
   * Default layout to wrap all screens (if the screen doesn't define its own).
   * Same concept as the web adapter.
   */
  layout?: LayoutFunction | LayoutFunction[]
}

export function createInertiaApp(options: CreateInertiaAppOptions) {
  const { baseUrl, initialUrl = "/dashboard", resolve, layout } = options

  function InertiaApp() {
    const [page, setPage] = useState<InertiaPage | null>(null)
    const [renderedElement, setRenderedElement] =
      useState<React.ReactElement | null>(null)
    const [error, setError] = useState<string | null>(null)
    const initialized = useRef(false)
    const scheme = useColorScheme()
    const isDark = scheme === "dark"
    const bg = isDark ? "#000000" : "#ffffff"
    const errorTitleColor = isDark ? "#ff453a" : "#ef4444"
    const errorTextColor = isDark ? "#8e8e93" : "#666666"

    useEffect(() => {
      // Prevent double-initialization in React strict mode
      if (initialized.current) return
      initialized.current = true

      console.log("[Inertia] Initializing app, baseUrl:", baseUrl)

      // Configure the router
      router.configure(baseUrl)

      // Subscribe to page changes
      const unsubscribe = router.onPageChange(async (newPage) => {
        console.log(
          "[Inertia] Page changed:",
          newPage.component,
          "url:",
          newPage.url,
        )

        try {
          // Resolve the component
          const module = await resolve(newPage.component)
          const Component = (module.default || module) as PageComponent

          // Build the element
          let element = React.createElement(Component, newPage.props)

          // Apply layouts (same logic as web adapter)
          const layouts = Component.layout || layout
          if (layouts) {
            const layoutArray = Array.isArray(layouts) ? layouts : [layouts]
            for (const layoutFn of [...layoutArray].reverse()) {
              element = layoutFn(element)
            }
          }

          // Update both page (for context) and element (for rendering)
          setPage(newPage)
          setRenderedElement(element)
          setError(null)
        } catch (err: any) {
          console.error(
            `[Inertia] Failed to resolve component "${newPage.component}":`,
            err.message,
          )
          setError(
            `Component not found: "${newPage.component}". ` +
              `Make sure it's registered in the screens map.`,
          )
        }
      })

      // Bootstrap: load auth token, then visit the initial URL
      const bootstrap = async () => {
        console.log("[Inertia] Bootstrapping, visiting:", initialUrl)
        await router.init()
        await router.visit(initialUrl)
      }

      bootstrap()

      // Android hardware back button → router.back(). When the history stack
      // is empty, return false so the OS handles it (closes the app).
      let backSubscription: { remove: () => void } | null = null
      if (Platform.OS === "android") {
        backSubscription = BackHandler.addEventListener(
          "hardwareBackPress",
          () => router.back(),
        )
      }

      return () => {
        unsubscribe()
        backSubscription?.remove()
      }
    }, [])

    // Error state
    if (error) {
      return (
        <View style={[styles.error, { backgroundColor: bg }]}>
          <StatusBar style="auto" />
          <Text style={[styles.errorTitle, { color: errorTitleColor }]}>
            Inertia Error
          </Text>
          <Text style={[styles.errorText, { color: errorTextColor }]}>
            {error}
          </Text>
        </View>
      )
    }

    // Loading state
    if (!page || !renderedElement) {
      return (
        <View style={[styles.loading, { backgroundColor: bg }]}>
          <StatusBar style="auto" />
          <ActivityIndicator size="large" />
        </View>
      )
    }

    // Render the resolved component inside the provider
    return (
      <InertiaProvider page={page}>
        <StatusBar style="auto" />
        <FlashToaster />
        {renderedElement}
      </InertiaProvider>
    )
  }

  // Register as the Expo root component
  registerRootComponent(InertiaApp)
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
})
