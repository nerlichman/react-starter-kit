/**
 * Inertia React Native app entry point.
 *
 * Compare to the web entrypoint (app/frontend/entrypoints/inertia.tsx):
 *
 *   createInertiaApp({
 *     pages: "../pages",
 *     layout: () => [PersistentLayout],
 *   })
 *
 * Same pattern — provide a resolve function and optional default layout.
 */

import { createInertiaApp, type PageComponent } from "./lib/inertia"

// Import all screens eagerly (same as web's import.meta.glob)
import DashboardIndex from "./screens/dashboard/index"
import SessionsNew from "./screens/sessions/new"
import SettingsProfilesShow from "./screens/settings/profiles/show"

// Screen registry — maps Inertia component names to RN screen components
const screens: Record<string, { default: PageComponent }> = {
  "dashboard/index": { default: DashboardIndex },
  "sessions/new": { default: SessionsNew },
  "settings/profiles/show": { default: SettingsProfilesShow },
}

createInertiaApp({
  // Point to your Rails server
  // For local development:
  //   - iOS Simulator: use localhost
  //   - Android Emulator: use 10.0.2.2 (maps to host localhost)
  //   - Physical device: use your machine's local IP
  baseUrl: __DEV__
    ? "http://localhost:3000"
    : "https://myapp.example.com",

  // Resolve component names to screen components — same as web
  resolve: (name) => {
    const screen = screens[name]
    if (!screen) {
      throw new Error(
        `[Inertia] Screen not found: "${name}". ` +
          `Available screens: ${Object.keys(screens).join(", ")}`,
      )
    }
    return screen
  },
})
