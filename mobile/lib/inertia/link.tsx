/**
 * @inertiajs/react-native — Link component
 *
 * Equivalent to the web <Link> component.
 * Renders a Pressable that calls router.visit() on press.
 */

import React, { useCallback, type ReactNode } from "react"
import { Pressable, type PressableProps } from "react-native"

import { router } from "./router"
import type { Method, VisitOptions } from "./types"

interface LinkProps extends Omit<PressableProps, "onPress"> {
  /** The URL to visit */
  href: string
  /** HTTP method (default: GET) */
  method?: Method | Lowercase<Method>
  /** Data to send with the request */
  data?: Record<string, unknown>
  /** Replace the current history entry instead of pushing */
  replace?: boolean
  /** Only reload specific props */
  only?: string[]
  /** Additional visit options */
  visitOptions?: Omit<VisitOptions, "method" | "data" | "replace" | "only">
  /** Children to render */
  children: ReactNode
}

export function Link({
  href,
  method = "GET",
  data,
  replace,
  only,
  visitOptions,
  children,
  ...pressableProps
}: LinkProps) {
  const handlePress = useCallback(() => {
    router.visit(href, {
      method: method.toUpperCase() as Method,
      data,
      replace,
      only,
      ...visitOptions,
    })
  }, [href, method, data, replace, only, visitOptions])

  return (
    <Pressable onPress={handlePress} {...pressableProps}>
      {children}
    </Pressable>
  )
}
