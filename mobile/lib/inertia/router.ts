/**
 * @inertiajs/react-native — Router
 *
 * The core engine. Handles:
 * - Fetching Inertia JSON responses from the server
 * - Redirect following (302/303)
 * - Version conflict handling (409)
 * - Validation error handling (422)
 * - Partial reloads
 * - Auth token management
 *
 * This is the mobile equivalent of @inertiajs/core's Router class.
 * It replaces XHR + window.history with fetch() + React state.
 */

import { getToken, setToken, clearToken } from "./auth"
import { events } from "./events"
import type {
  InertiaPage,
  VisitOptions,
  Method,
  Errors,
  PageProps,
} from "./types"

type PageListener = (page: InertiaPage) => void

class InertiaRouter {
  private baseUrl: string = ""
  private currentPage: InertiaPage | null = null
  private history: InertiaPage[] = []
  private version: string | null = null
  private authToken: string | null = null
  private pageListeners: Set<PageListener> = new Set()
  private abortController: AbortController | null = null
  // Set internally by back() so the next setPage() doesn't re-push to history
  private suppressHistoryPush = false

  /** Configure the router with the server base URL */
  configure(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
  }

  /** Initialize auth token from secure storage */
  async init() {
    this.authToken = await getToken()
  }

  /** Get the current page */
  getPage(): InertiaPage | null {
    return this.currentPage
  }

  /** Subscribe to page changes (used by InertiaContext) */
  onPageChange(listener: PageListener): () => void {
    this.pageListeners.add(listener)
    return () => this.pageListeners.delete(listener)
  }

  private setPage(page: InertiaPage, options: { replace?: boolean } = {}) {
    // Push the outgoing page onto history unless we're replacing or popping
    if (
      this.currentPage &&
      !options.replace &&
      !this.suppressHistoryPush &&
      this.currentPage.url !== page.url
    ) {
      this.history.push(this.currentPage)
    }
    this.suppressHistoryPush = false

    this.currentPage = page
    this.version = page.version
    for (const listener of this.pageListeners) {
      listener(page)
    }
  }

  /** Whether there's a previous page to navigate back to */
  canGoBack(): boolean {
    return this.history.length > 0
  }

  /**
   * Pop the previous page off the history stack and render it.
   * Returns true if it navigated back, false if the stack was empty.
   */
  back(): boolean {
    const previous = this.history.pop()
    if (!previous) return false
    this.suppressHistoryPush = true
    this.setPage(previous)
    return true
  }

  /** Clear the history stack — useful after login or logout */
  clearHistory() {
    this.history = []
  }

  /** Core visit method — fetches Inertia JSON and updates state */
  async visit(url: string, options: VisitOptions = {}): Promise<void> {
    const method: Method = (options.method || "GET").toUpperCase() as Method
    // Internal flag: when handleResponse recurses (e.g. follows a redirect),
    // the outer visit owns lifecycle events. The inner one stays silent so
    // before/start/finish/onFinish fire exactly once per user-initiated visit.
    const silent = options._silent === true

    // Fire 'before' event (cancelable)
    if (!silent) {
      if (options.onBefore && options.onBefore() === false) return
      if (!events.emit("before", { url, method })) return
    }

    // Cancel any in-flight request (only the outer visit does this — inner
    // redirect-followers must not abort their own parent)
    if (!silent) {
      if (this.abortController) {
        this.abortController.abort()
      }
      this.abortController = new AbortController()

      events.emit("start")
      options.onStart?.()
    }

    try {
      const response = await this.makeRequest(url, method, options)
      await this.handleResponse(response, url, options)
    } catch (error: any) {
      if (error.name === "AbortError") return
      console.error("[Inertia] Request failed:", error)
      if (!silent) {
        options.onError?.({ _global: error.message } as unknown as Errors)
        events.emit("error", { _global: error.message })
      }
    } finally {
      if (!silent) {
        this.abortController = null
        events.emit("finish")
        options.onFinish?.()
      }
    }
  }

  private async makeRequest(
    url: string,
    method: Method,
    options: VisitOptions,
  ): Promise<Response> {
    const fullUrl = this.resolveUrl(url)

    const headers: Record<string, string> = {
      "X-Inertia": "true",
      "X-Inertia-Native": "true",
      Accept: "application/json",
      ...options.headers,
    }

    if (this.version) {
      headers["X-Inertia-Version"] = this.version
    }

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`
    }

    // Partial reload headers
    if (options.only && this.currentPage) {
      headers["X-Inertia-Partial-Data"] = options.only.join(",")
      headers["X-Inertia-Partial-Component"] = this.currentPage.component
    }
    if (options.except && this.currentPage) {
      headers["X-Inertia-Partial-Except"] = options.except.join(",")
      headers["X-Inertia-Partial-Component"] = this.currentPage.component
    }

    // Build request body
    let body: string | undefined
    if (options.data && method !== "GET") {
      headers["Content-Type"] = "application/json"
      body = JSON.stringify(options.data)
    }

    // Build URL with query params for GET
    let requestUrl = fullUrl
    if (options.data && method === "GET") {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(options.data)) {
        params.append(key, String(value))
      }
      requestUrl = `${fullUrl}?${params.toString()}`
    }

    console.log(`[Inertia] ${method} ${requestUrl}`)

    const response = await fetch(requestUrl, {
      method,
      headers,
      body,
      redirect: "manual",
      signal: this.abortController?.signal,
    })

    console.log(
      `[Inertia] Response: ${response.status} ${response.type || ""}`,
      "X-Inertia:", response.headers.get("X-Inertia"),
      "Location:", response.headers.get("Location"),
    )

    return response
  }

  private async handleResponse(
    response: Response,
    originalUrl: string,
    options: VisitOptions,
  ): Promise<void> {
    // React Native may return status 0 with type 'opaqueredirect' when
    // using redirect: 'manual'. In that case, we can't read headers.
    // Fall back to re-fetching with redirect: 'follow'.
    if (response.status === 0 || response.type === "opaqueredirect") {
      console.log("[Inertia] Opaque redirect detected, re-fetching with follow")
      const fullUrl = this.resolveUrl(originalUrl)
      const headers: Record<string, string> = {
        "X-Inertia": "true",
        "X-Inertia-Native": "true",
        Accept: "application/json",
      }
      if (this.version) headers["X-Inertia-Version"] = this.version
      if (this.authToken) headers["Authorization"] = `Bearer ${this.authToken}`

      const followResponse = await fetch(fullUrl, {
        method: "GET",
        headers,
        redirect: "follow",
      })
      return this.handleResponse(followResponse, originalUrl, options)
    }

    // Handle redirects (302/303) — follow them manually
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location")
      console.log("[Inertia] Following redirect to:", location)

      // Capture session token from redirect responses (e.g., after login)
      const sessionToken = response.headers.get("X-Session-Token")
      if (sessionToken) {
        console.log("[Inertia] Captured session token from redirect")
        this.authToken = sessionToken
        await setToken(sessionToken)
      }

      if (location) {
        return this.visit(location, {
          method: "GET",
          _silent: true,
          onSuccess: options.onSuccess,
          onError: options.onError,
        })
      }
    }

    // Handle 401 unauthorized — token expired or invalidated
    if (response.status === 401) {
      console.log("[Inertia] 401 Unauthorized — clearing token, redirecting to login")
      await clearToken()
      this.authToken = null
      return this.visit("/sign_in", { method: "GET", _silent: true })
    }

    // Handle 409 version conflict — clear version and retry
    if (response.status === 409) {
      const location = response.headers.get("X-Inertia-Location")
      this.version = null
      if (location) {
        return this.visit(location, { _silent: true })
      }
      return this.visit(originalUrl, { _silent: true })
    }

    // Capture session token from any response
    const sessionToken = response.headers.get("X-Session-Token")
    if (sessionToken) {
      console.log("[Inertia] Captured session token")
      this.authToken = sessionToken
      await setToken(sessionToken)
    }

    // Handle non-Inertia responses
    const isInertia = response.headers.get("X-Inertia") === "true"
    if (!isInertia) {
      // Read body once — response.json()/text() consume the stream and can't be called twice.
      const bodyText = await response.text().catch(() => null)
      console.log(`[Inertia] Non-Inertia body (${response.status}):`, bodyText?.substring(0, 300))

      let body: any = null
      if (bodyText) {
        try {
          body = JSON.parse(bodyText)
        } catch {
          // Not JSON
        }
      }

      // Native auth success — backend returns { session_token, location } as 200 JSON
      // instead of a 302 redirect (which React Native can't reliably intercept).
      if (response.ok && body?.session_token && body?.location) {
        console.log("[Inertia] Native auth success — storing token, visiting:", body.location)
        this.authToken = String(body.session_token)
        await setToken(String(body.session_token))
        this.clearHistory()
        return this.visit(body.location, {
          method: "GET",
          replace: true,
          _silent: true,
          onSuccess: options.onSuccess,
        })
      }

      // Native validation errors — backend returns { errors: {...} } as 422 JSON
      if (response.status === 422 && body?.errors) {
        console.log("[Inertia] Native validation errors:", Object.keys(body.errors))
        options.onError?.(body.errors)
        events.emit("error", body.errors)
        return
      }

      // Unhandled non-Inertia response
      console.error(
        `[Inertia] Unhandled non-Inertia response (${response.status}):`,
        bodyText?.substring(0, 200) ?? "(empty)",
      )
      return
    }

    // Parse the Inertia JSON page object
    const page: InertiaPage = await response.json()

    // Handle validation errors (422)
    if (response.status === 422) {
      // Merge errors into current page props
      if (this.currentPage) {
        const errorPage: InertiaPage = {
          ...this.currentPage,
          props: {
            ...this.currentPage.props,
            errors: page.props.errors || {},
          },
        }
        this.setPage(errorPage)
      }
      options.onError?.(page.props.errors || {})
      events.emit("error", page.props.errors)
      return
    }

    // Merge props for partial reloads
    if ((options.only || options.except) && this.currentPage) {
      page.props = { ...this.currentPage.props, ...page.props }
    }

    // Partial reloads, reloads, and explicit replace skip the history push
    const replace =
      options.replace || !!options.only || !!options.except ||
      // A reload of the same URL is a replace, not a push
      (this.currentPage?.url === page.url)

    this.setPage(page, { replace })

    options.onSuccess?.(page)
    events.emit("success", page)
    events.emit("navigate", page)
  }

  private resolveUrl(url: string): string {
    // If already absolute, use as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    // Otherwise, prepend base URL
    return `${this.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
  }

  // Convenience methods — matching the web API exactly

  get(url: string, options?: Omit<VisitOptions, "method">) {
    return this.visit(url, { ...options, method: "GET" })
  }

  post(url: string, data?: Record<string, unknown>, options?: Omit<VisitOptions, "method" | "data">) {
    return this.visit(url, { ...options, method: "POST", data })
  }

  put(url: string, data?: Record<string, unknown>, options?: Omit<VisitOptions, "method" | "data">) {
    return this.visit(url, { ...options, method: "PUT", data })
  }

  patch(url: string, data?: Record<string, unknown>, options?: Omit<VisitOptions, "method" | "data">) {
    return this.visit(url, { ...options, method: "PATCH", data })
  }

  delete(url: string, options?: Omit<VisitOptions, "method">) {
    return this.visit(url, { ...options, method: "DELETE" })
  }

  reload(options?: Omit<VisitOptions, "method">) {
    if (!this.currentPage) return Promise.resolve()
    return this.visit(this.currentPage.url, {
      ...options,
      preserveState: true,
    })
  }

  /** Visit a URL replacing the current page in history (no back entry) */
  replace(url: string, options?: Omit<VisitOptions, "replace">) {
    return this.visit(url, { ...options, replace: true })
  }

  /** Destroy the server session, clear local auth, and navigate to login */
  async logout(sessionId?: string) {
    // Destroy the session server-side if we have an ID
    if (sessionId) {
      try {
        await this.delete(`/sessions/${sessionId}`)
      } catch {
        // Session may already be destroyed — continue with local cleanup
      }
    }

    await clearToken()
    this.authToken = null
    this.currentPage = null
    this.version = null
    this.clearHistory()
    return this.visit("/sign_in", { replace: true })
  }
}

/** Singleton router instance — same pattern as web */
export const router = new InertiaRouter()
