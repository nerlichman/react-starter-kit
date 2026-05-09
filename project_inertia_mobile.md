---
name: Inertia React Native Mobile App
description: Building a mobile app using Expo + a custom @inertiajs/react-native adapter. Tracks architecture decisions, current progress, and next steps.
type: project
originSessionId: b0c1e3c0-1010-40f2-816b-e0ac2acb81e6
---

# Inertia React Native Mobile App

## Goal

Native iOS/Android app for the Rails 8 + Inertia v3 + React 19 starter kit. Truly native UI — bottom tab bar with iOS 26 liquid glass, native navigation, pull-to-refresh, modals.

## Architecture

- **Expo SDK 54+, NOT Expo Router.** Inertia is the router; client-side file-based routing duplicates server routes.
- **Capacitor rejected.** WebView wrapper fails the native-UI requirement.
- **No nav config in the adapter.** Tab bar is just UI in a layout component (parallel to the web sidebar) — calls `router.visit()` on tap. Adapter doesn't know about navigation structure.
- **Adapter API mirrors web exactly:** `createInertiaApp`, `usePage`, `useForm`, `<Link>`, `router.visit()`. Screens live in `mobile/screens/` mirroring `app/frontend/pages/`.
- **Native tabs via `react-native-bottom-tabs`** — wraps `UITabBarController`/`BottomNavigationView`, liquid glass automatic on iOS 26.
- **Bearer token auth alongside cookies.** Native sends `X-Inertia-Native: true`. Backend tries cookie auth first, falls back to Bearer; returns `X-Session-Token` header on web auth and `200 JSON {session_token, location}` on native auth (RN can't reliably read headers from manual 302s).

## Current State (2026-05-09)

### Phase 1 — COMPLETE

Adapter core, backend native branches (sessions + users controllers), login + dashboard, AuthLayout/AppLayout, native tab bar via `react-native-bottom-tabs`, screen registry, TypeScript clean.

### Phase 2 — COMPLETE

- Back navigation (snapshot-based history stack, `router.back()`, `router.canGoBack()`, `useBack()` hook)
- `router.replace()`, `router.reload()`
- Android hardware back wired to `router.back()`
- Flash messages via `<FlashToaster />` (auto-mounted, uses `burnt` for native toasts)
- Single-fire lifecycle on redirect chains (internal `_silent` option)
- Login/logout clear history

### Phase 3 — MOSTLY DONE

- Native tab bar already done in Phase 1.
- Settings screens: profile (editable), password, email, sessions (list with destroy + native confirm).
- Sign-up screen + native users_controller branch.
- `<ScreenHeader>` component for consistent back-button + title bar across sub-screens.
- Tab UX polish: URL-derived tab index (no flicker on Link → tabbed screen), `prefix` separate from `href` (sub-pages keep parent tab highlighted), tab tap clears history.

**Phase 3 remaining:** Native push/pop animations and iOS swipe-back are deferred — option C was tried and reverted (see "Native transition strategy" below). Appearance/theme picker still TODO. iOS 26 liquid glass likely automatic via `react-native-bottom-tabs`, needs visual verification on iOS 26 sim.

### Native transition strategy

Three options were considered for native push/pop animations + swipe-back:

- **A — Full React Navigation + per-tab stacks.** Largest refactor. Adds slide animations, swipe-back, and per-tab back-stack preservation (each tab remembers its own stack when you switch away). Animated nav header.
- **B — Single global stack via React Navigation.** Slide animations + swipe-back, but tabs stay outside the stack so switching tabs still uses `replace` (no per-tab preservation).
- **C — `react-native-screens` `<ScreenStack>` directly.** ~1 file of changes. Native push/pop animations and swipe-back without React Navigation. Keeps the Inertia router as the single source of truth for navigation state.

**Tried C, rolled it back (2026-05-09).** ScreenStack makes the _entire_ nav tree visible UI, which clashes with our single global router stack. On a tab tap from a sub-page, this sequence happened in three frames: (1) `clearHistory()` mutated the router synchronously but React state still held the old stack; (2) the new tab's scene mounted ScreenStack with the _previous tab's_ deep stack visible (back-arrow flashing on a screen that no longer made sense); (3) fetch landed and ScreenStack diffed the swap as a push animation. The same-depth-replace `stackAnimation: "none"` patch helped a little but didn't fix the stale-state flash.

The single-component renderer is simpler and visibly better for our app: instant component swap, no leaked tree, no animation expectations. Reverted createInertiaApp + AuthLayout + the auth-screen wrappers; kept `ScreenHeader` (real win, independent of the stack rendering).

**Future upgrade path to A.** Native push/pop animations and iOS swipe-back genuinely require per-tab stack preservation — anything less leaves the same-tab vs cross-tab semantics ambiguous to the renderer. Signals A is worth doing: users complain switching tabs loses their sub-page position; we want animated header transitions or modal presentation; we add a third tab and the cross-tab confusion grows. When that happens, expect to refactor the router from a single global `history` to `Map<tabKey, InertiaPage[]>` and adopt `@react-navigation/native` + `@react-navigation/native-stack` (with `react-native-bottom-tabs/react-navigation` for the tab integration).

### Phase 4 — NOT STARTED

Push notifications, file downloads, deep linking (needed for password reset), haptics, biometric auth.

## Extraction plan (next session — 2026-05-10+)

Decision (2026-05-09): the foundation is solid enough to extract the adapter as a publishable package. Goal: ship two artifacts so the work is reusable and the names are claimed before squatters take them.

### npm package — extract first

Source: `mobile/lib/inertia/` (10 cohesive files, no leakage from starter-kit code).

**Expo coupling audit** — three touch points that need to be made pluggable so the package works in bare RN too:

- `auth.ts` uses `expo-secure-store`. Plan: take a `storage: { getItem, setItem, removeItem }` option in `createInertiaApp`, default to expo-secure-store when present.
- `createInertiaApp.tsx` uses `registerRootComponent` from `"expo"`. Plan: return the `InertiaApp` component; consumer calls `registerRootComponent` (Expo) or `AppRegistry.registerComponent` (bare) themselves.
- `flash.tsx` uses `burnt` directly. Plan: accept a custom `onFlash` callback; ship Burnt as the default but optional.

**v1 stance:** Expo-friendly defaults (auto-detect / auto-use) but expose pluggability. Single package, zero-config on Expo, opt-in pluggability for bare RN.

**Proposed structure:**

```
react-starter-kit/
├── packages/
│   └── inertia-react-native/   ← publishable npm package
│       ├── package.json         (name, peer deps, exports)
│       ├── README.md
│       ├── tsconfig.json
│       └── src/                 (moved from mobile/lib/inertia/)
├── mobile/
│   ├── package.json             (workspaces: ["../packages/*"])
│   └── ...                      (consumes via the package name, symlinked)
```

Workspace-linked = edits to the adapter are live during dev, no publish dance.

### gem — claim name now, flesh out later

Source: scattered Rails patterns currently inline in the starter-kit.

Realistic scope (~5 small files):

- `lib/inertia_rails/native/middleware.rb` — `version_stale?` bypass for `X-Inertia-Native` requests.
- `lib/inertia_rails/native/controller.rb` — concern providing `native_request?`, `render_native_auth_success(token:, location:)`, `render_native_validation_errors(errors)`.
- `lib/inertia_rails/native/railtie.rb` — auto-mounts the middleware patch.
- A generator that adds `include InertiaRails::Native::Controller` and `skip_forgery_protection if: -> { native_request? }` to `ApplicationController`.

**Strategy:** scaffold + register a v0.0.1 placeholder release immediately so the name is reserved. Then do the real extraction in a follow-up commit. The starter-kit's existing controllers (`SessionsController`, `UsersController`, `ApplicationController`, `config/initializers/inertia_rails.rb`) get cleaned up to use the gem.

### Naming — DECIDE FIRST THING TOMORROW

| npm options                                                               | gem options                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `@gogrow/inertia-react-native` (scoped — safest re: Inertia.js trademark) | `inertia_rails_native` (matches `inertia_rails` parent style) |
| `inertia-react-native` (unscoped, descriptive)                            | `inertia-rails-native` (hyphen-style for extension gems)      |

Recommended: `inertia-react-native` + `inertia_rails_native`, unless wary of the Inertia.js maintainers' trademark — then prefix the npm one with `@gogrow/`.

### Sequence to execute (in order)

1. Pick names.
2. Scaffold the gem under `gems/inertia_rails_native/` with bin/setup, gemspec, version.rb, empty lib/. Push v0.0.1 to RubyGems to claim the name.
3. Scaffold `packages/inertia-react-native/` (package.json, tsconfig, README stub, empty src/). No npm publish yet.
4. Move `mobile/lib/inertia/*` → `packages/inertia-react-native/src/*`. Set up workspace in `mobile/package.json`. Update `mobile/` imports from `"./lib/inertia"` → the package name. Verify typecheck + simulator. **One commit.**
5. Make Expo bits pluggable (storage, registration, toast). Verify still works with current mobile/. **One commit per concern.**
6. Flesh out the gem: extract the Rails patterns into the gem properly. Update `mobile/`-consuming controllers to `include InertiaRails::Native::Controller`. Drop the inline initializer + ad-hoc helpers. **One commit.**
7. Write proper READMEs (overview, install, "use with Rails" section, full API reference) for both.
8. First real release to npm + a fleshed-out gem release.

### Documentation split — what goes where

Keep the package READMEs focused on the _adapter_. App-level setup goes in the starter-kit's own README (or `mobile/README.md`).

**Package README (`packages/inertia-react-native/README.md`)** — adapter-only:

- What the package does (Inertia.js client for React Native)
- Installation + peer deps
- Quick start (createInertiaApp, screen registry, layouts)
- API reference: `usePage`, `useForm`, `useBack`, `useFlash`, `<Link>`, `<FlashToaster>`, `router.*`
- Pluggability: storage, root registration, toast backend
- "Use with Rails" pointer to the gem's README

**Gem README (`gems/inertia_rails_native/README.md`)** — Rails-only:

- What the gem provides (native_request? + middleware bypass + auth helpers)
- Installation + generator
- Patterns to apply in controllers
- Pointer back to the npm package

**Project README (`README.md` or `mobile/README.md`)** — app-level setup that doesn't belong in either package:

- How to run the mobile app locally (Metro vs `npm run ios`/`run android`)
- How to point at a different backend (`baseUrl` in `app.tsx`)
- **Expo prebuild gotchas — important:**
  - Source icon must be 1024×1024 PNG (no transparency, no rounded corners — iOS adds those).
  - Changing `mobile/assets/icon.png` does NOT update the running app — the native projects bake in a copy at `mobile/ios/.../AppIcon.appiconset/` during `expo prebuild`. After any asset change, run `npx expo prebuild --clean` then `npm run ios`.
  - The iOS Simulator aggressively caches the installed app's icon. After rebuild, long-press → Remove App in the Simulator before `npm run ios`, or use Device → Erase All Content and Settings if it persists.
  - Splash screen uses the modern `expo-splash-screen` plugin (not the legacy top-level `splash` key). Configure under `plugins` in `app.json`.
- Optional: hold the splash until Inertia's first page renders by calling `SplashScreen.preventAutoHideAsync()` in `app.tsx` and `SplashScreen.hideAsync()` once `renderedElement` is set in `createInertiaApp`.
- **iOS 26 liquid glass tab bar:** automatic via `react-native-bottom-tabs`, but the bar is _only_ given the new appearance if the app is **linked against the iOS 26 SDK** at compile time. Just running on an iOS 26 device is not enough — UIKit checks the linked SDK version and intentionally serves apps built with older SDKs the legacy flat appearance (Apple's standard "no visual redesign without recompile" backwards-compat). Practical chain: iOS 26 SDK ⇐ Xcode 26 ⇐ macOS 26 (Tahoe). On macOS Sequoia 15.3 with Xcode 16/17, expect a flat tab bar even on iOS 26 devices. No in-code workaround. When eventually building on macOS 26 + Xcode 26, the appearance switches automatically — no code changes.

### Phase 5 — NOT STARTED

EAS Build, app icons, store submission.

## Hard-won protocol/RN insights

These bite when you hit them and the fixes are non-obvious:

1. **Flash is at the top level of the page object, not in props.** Inertia Rails 3.19 puts `flash` next to `component`/`props`/`url` (configured via `config.flash_keys`, default `[:notice, :alert]`). Reading `page.props.flash` silently returns nothing.

2. **First request needs `version_stale?` bypass.** Native first request has no `X-Inertia-Version`, so `nil != "hash"` → middleware returns 409 → router clears (already null) version → infinite loop. Web doesn't hit this because the first page load is HTML, not Inertia. Fix is `config/initializers/inertia_rails.rb` — prepend `version_stale?` returning false for native requests.

3. **RN fetch can return opaque redirects.** With `redirect: 'manual'` you sometimes get `status === 0`, `type === 'opaqueredirect'`, headers unreadable. Lost the `X-Session-Token` after login this way. Native auth now returns `200 JSON {session_token, location}` instead of a 302 to dodge this entirely.

4. **Response body streams read once.** Calling `response.json()` then `response.text()` (or vice versa) silently fails. Always `await response.text()` once and `JSON.parse` from the string.

5. **Validation errors arrive via redirect chain, not always 422.** Rails redirects failures with `inertia: {errors: ...}`, which lands in `page.props.errors` after the redirect-followed GET. `useForm`'s `onSuccess` reads those and treats the submission as a failure. Without this, all redirect-style validation flows silently looked successful.

6. **Router is a singleton that survives Metro hot reload.** State (history, currentPage, authToken) persists across JS bundle refreshes. When testing back-stack behavior, do a full app restart, not just Cmd+R.

7. **Tab flicker = useEffect lag in derived state.** When a Link navigates into a tabbed screen, deriving the active tab index via useEffect causes one frame where the new screen renders inside the old tab's slot. Derive from URL during render; use optimistic state only for tap feedback.

8. **Tab `href` ≠ tab `prefix`.** `href` is where the tap goes (`/settings/profile`), `prefix` is what keeps the tab highlighted (`/settings`) — otherwise sub-pages fall back to a different tab.

9. **Tab tap should clear history.** A tab is a context switch, not a stack push. iOS tab roots never show a back arrow.

10. **`burnt` is a native module.** Adding it requires a rebuild (`npm run ios`), not just a Metro reload. iOS pods need `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install` on rbenv 4.0.

## Repo conventions worth knowing

- `mobile/ios/` and `mobile/android/` are gitignored — Expo prebuild regenerates them. Native deps are added via package.json + autolinking.
- `mobile/.npmrc` doesn't override the project's CodeArtifact registry. To install public packages, pass `--registry=https://registry.npmjs.org/`.
- `tsc --noEmit` is the canonical typecheck — runs clean across the whole project.

## Key file map

```
Backend:
  config/initializers/inertia_rails.rb       — version_stale? bypass for native
  app/controllers/application_controller.rb  — Bearer auth, native_request?, CSRF skip
  app/controllers/sessions_controller.rb     — Native: 200 JSON login / 422 JSON errors
  app/controllers/users_controller.rb        — Same pattern for sign-up

Mobile adapter (mobile/lib/inertia/):
  router.ts          — fetch + protocol engine, history stack, redirect handling
  context.tsx        — InertiaProvider, usePage(), useFlash(), useBack()
  createInertiaApp.tsx — bootstrap, screen resolution, FlashToaster + Android back
  form.ts            — useForm() (reads errors from redirect chain)
  link.tsx           — <Link> component
  flash.tsx          — <FlashToaster /> using burnt
  auth.ts            — token storage in expo-secure-store
  events.ts          — EventEmitter (replaces document.dispatchEvent)
  types.ts           — protocol types

Mobile app:
  app.tsx                              — entry, screen registry
  layouts/AppLayout.tsx                — tabs (UITabBarController via react-native-bottom-tabs)
  layouts/AuthLayout.tsx               — centered card
  components/ScreenHeader.tsx          — shared back+title header
  screens/{dashboard,sessions,users,settings/{profiles,passwords,emails,sessions}}
```

## User preferences (from sessions)

- Open to creating new OSS tooling (the @inertiajs/react-native adapter itself).
- Hard requirement: native UI (liquid glass tab bar, native transitions).
- Server-driven nav (Inertia philosophy). Pushed back early on a design that had `navigation: { tabs: {...} }` in the adapter — tab bar is "just UI" like the web sidebar.
- Commits at natural unit boundaries; verifies in simulator between batches.
