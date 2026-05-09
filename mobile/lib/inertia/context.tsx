/**
 * @inertiajs/react-native — React Context
 *
 * Provides the current Inertia page to the component tree.
 * usePage() works identically to the web adapter.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { router } from "./router"
import type { InertiaPage, PageProps, FlashData } from "./types"

const InertiaContext = createContext<InertiaPage | null>(null)

interface InertiaProviderProps {
  page: InertiaPage
  children: ReactNode
}

export function InertiaProvider({ page, children }: InertiaProviderProps) {
  return (
    <InertiaContext.Provider value={page}>{children}</InertiaContext.Provider>
  )
}

/**
 * usePage() — identical API to the web adapter.
 *
 * Returns the current page object with typed props.
 *
 * Usage:
 *   const { props, url, component } = usePage<MyPageProps>()
 */
export function usePage<TProps extends PageProps = PageProps>() {
  const page = useContext(InertiaContext)

  if (!page) {
    throw new Error(
      "usePage() called before Inertia page was loaded. " +
        "Make sure your component is rendered inside an Inertia screen.",
    )
  }

  return page as InertiaPage<TProps>
}

/**
 * useFlash() — convenience hook for flash messages.
 */
export function useFlash(): FlashData {
  const page = useContext(InertiaContext)
  const props = page?.props as any
  return {
    alert: props?.flash?.alert,
    notice: props?.flash?.notice,
  }
}

/**
 * useBack() — back-navigation helpers.
 *
 *   const { canGoBack, back } = useBack()
 *
 * Re-renders the consumer when the navigable history changes (e.g. after a
 * push or pop) so a header back button can show/hide correctly.
 */
export function useBack() {
  const [canGoBack, setCanGoBack] = useState(router.canGoBack())

  useEffect(() => {
    return router.onPageChange(() => {
      setCanGoBack(router.canGoBack())
    })
  }, [])

  return {
    canGoBack,
    back: () => router.back(),
  }
}
