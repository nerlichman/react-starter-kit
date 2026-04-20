/**
 * @inertiajs/react-native — createInertiaApp
 *
 * The entry point for an Inertia React Native app.
 * Same pattern as the web adapter's createInertiaApp.
 */

import React, { useEffect, useState, useRef } from "react"
import { View, ActivityIndicator, Text, StyleSheet } from "react-native"
import { registerRootComponent } from "expo"

import { router } from "./router"
import { InertiaProvider } from "./context"
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

      return unsubscribe
    }, [])

    // Error state
    if (error) {
      return (
        <View style={styles.error}>
          <Text style={styles.errorTitle}>Inertia Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )
    }

    // Loading state
    if (!page || !renderedElement) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      )
    }

    // Render the resolved component inside the provider
    return <InertiaProvider page={page}>{renderedElement}</InertiaProvider>
  }

  // Register as the Expo root component
  registerRootComponent(InertiaApp)
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ef4444",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
})
