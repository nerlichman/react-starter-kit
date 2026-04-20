/**
 * @inertiajs/react-native — Protocol types
 *
 * These mirror the Inertia.js protocol specification.
 * See: https://inertiajs.com/the-protocol
 */

import type React from "react"
import type { ComponentType } from "react"

/** The page object returned by the server */
export interface InertiaPage<TProps extends PageProps = PageProps> {
  component: string
  props: TProps & {
    errors?: Errors
  }
  url: string
  version: string | null
  clearHistory?: boolean
  encryptHistory?: boolean
}

/** Base page props — all pages receive at least these */
export interface PageProps {
  [key: string]: unknown
}

/** Validation errors from the server */
export type Errors = Record<string, string | string[]>

/** Options for router.visit() */
export interface VisitOptions {
  method?: Method
  data?: Record<string, unknown>
  replace?: boolean
  only?: string[]
  except?: string[]
  headers?: Record<string, string>
  preserveState?: boolean
  onBefore?: () => boolean | void
  onStart?: () => void
  onSuccess?: (page: InertiaPage) => void
  onError?: (errors: Errors) => void
  onFinish?: () => void
}

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

/** A resolved page module */
export interface PageModule {
  default: PageComponent
}

/** A page component with optional layout */
export type PageComponent = ComponentType<any> & {
  layout?: LayoutFunction | LayoutFunction[]
}

/** Layout wrapper function */
export type LayoutFunction = (page: React.ReactElement) => React.ReactElement

/** resolve() function signature — same as web */
export type ResolveComponent = (
  name: string,
) => PageModule | Promise<PageModule>

/** Router event types */
export type RouterEvent =
  | "before"
  | "start"
  | "success"
  | "error"
  | "finish"
  | "navigate"

export interface RouterEventPayloads {
  before: { url: string; method: Method }
  start: undefined
  success: InertiaPage
  error: Errors
  finish: undefined
  navigate: InertiaPage
}

/** Flash data from Rails */
export interface FlashData {
  alert?: string
  notice?: string
}
