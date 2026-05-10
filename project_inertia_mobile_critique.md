# Inertia React Native Adapter — Plan Critique

Written as a second-opinion read of `project_inertia_mobile.md` against the
original framing question: _"what would it take to build an Inertia.js React
Native (with Expo) client for a Rails + Inertia + React app?"_

The intent is to give the CTO and the next agent session a single place to
align on (a) where the current plan diverges from that goal, (b) which
decisions should be reopened before the extraction commits go out, and (c)
the protocol-surface gaps that aren't visible in the current doc.

---

## TL;DR

The plan is real progress and the philosophy is right, but two things are
out of alignment with the original goal and should be addressed before the
package is extracted:

1. **Native transitions were a stated hard requirement and currently aren't
   shipped.** Option C was correctly rolled back, but option B (a single
   global React Navigation stack with tabs outside it) was dismissed too
   quickly. It's the standard pattern in shipped native apps and is worth a
   real prototype before defaulting to "instant component swap, no
   animation."
2. **The protocol engine is a from-scratch reimplementation rather than a
   wrapper over `@inertiajs/core`.** Core is framework-agnostic exactly so
   that adapters don't redo this work. Reimplementing means perpetual drift
   from upstream Inertia and a long tail of features (partial reloads,
   deferred props, mergeProps, prefetch, encrypted history) that have to be
   re-built and re-maintained.

Plus a smaller set of scoping/naming items below.

---

## What the plan gets right

- Hits the major work areas (protocol client, component resolver,
  navigation bridge, forms, auth, versioning, flash, links).
- Rejected WebView/Capacitor — the original goal demanded native UI.
- Held the Inertia philosophy line: the tab bar is "just UI" in a layout,
  not adapter config. Server-driven navigation stays intact.
- Hard-won insights (page-level `flash`, opaque redirects, body
  stream-once, version_stale loop, tab flicker via useEffect lag) are
  exactly the kind of thing a scoping doc misses and are worth keeping
  prominent in the README of the extracted package.
- The extraction shape (npm + gem, package READMEs scoped to the adapter,
  app-level setup in the starter README) is well thought through.

---

## Top-tier issues — reopen before extraction

### 1. Native transitions: option B deserves a real prototype

The current state is "instant component swap, no animation." The original
goal explicitly listed native transitions as a hard requirement. The
doc's option C post-mortem is honest engineering, but it jumps from
"C didn't work" to "A is the only real answer" and parks the work.

Option B — a single global `@react-navigation/native-stack` with the tab
bar living outside the stack — is the pattern used by a large number of
shipped native apps (tabs replace, sub-pages push). It gives:

- Native slide-in/out push and pop animations on iOS and Android.
- iOS edge swipe-back gesture for free.
- Animated native header transitions.

What it doesn't give: per-tab back-stack preservation. The doc dismisses B
on that basis, but the question is whether per-tab preservation is
actually required for this app or assumed-required because the web mental
model carries it in. For a starter kit with a small surface (dashboard,
settings sub-pages, auth), losing per-tab preservation is almost
certainly the right trade vs. shipping with no transitions.

Concretely: prototype B in a branch. The integration point is making the
Inertia router push to a React Navigation stack when the destination is a
sub-page, and call `popToTop` + tab change when the destination is
another tab root. The router stays the source of truth for `currentPage`;
React Navigation owns the visible stack and the animation.

If B turns out to feel wrong, then A is justified — but the decision
should come from comparing two working prototypes, not from option C's
failure.

### 2. Build the adapter on top of `@inertiajs/core`, not from scratch

`router.ts` in `mobile/lib/inertia/` reads as a from-scratch protocol
engine. `@inertiajs/core` (the package the official React and Vue
adapters wrap) already handles:

- Visit lifecycle (`router.visit`, cancellation, `onBefore`/`onStart`/
  `onProgress`/`onSuccess`/`onError`/`onFinish`).
- Version handling and the 409 + `X-Inertia-Location` flow.
- Partial reloads (`only`, `except`, `reset`).
- Deferred props.
- Merged props (`mergeProps`).
- Prefetch and `cache_for`.
- Encrypted history (Inertia v2).
- Form data serialization and progress events.

The reasons to build on core:

- Every protocol feature we don't reimplement is a feature we don't have
  to test, version, or fix.
- When Inertia ships a new feature in core (and they will — Inertia v2
  has shipped several), we get it by bumping a dependency, not by
  porting code.
- The web-specific parts of core that don't apply (history API, scroll,
  link interception) are opt-in — they live in the React/Vue adapters,
  not in core itself.

What an RN adapter needs to add on top of core:

- A React Native fetch implementation (core lets you plug one in).
- A storage shim for "version" / "history" (web uses `localStorage`/
  `sessionStorage`; we use `expo-secure-store` or `AsyncStorage`).
- A renderer (component name → RN screen) — the same pattern the
  official React adapter uses.
- The native-specific protocol forks we already invented (the native
  auth handshake, `X-Inertia-Native` header, redirect-as-200 for login).
- The RN-specific UI shims (`<Link>` as Pressable, `useForm` without DOM
  assumptions, `<FlashToaster>`).

The work that's already been done in `router.ts` isn't wasted — most of
it becomes the integration glue between core and RN. But it should be
re-grounded on core before the package is published, because publishing
locks in the reimplementation and creates real refactor cost later.

### 3. Deep linking is foundational, not Phase 4

The doc parks deep linking in Phase 4 ("not started") and frames it as
"needed for password reset." In a server-driven-nav app, deep links _are_
Inertia URLs — they're the addressing scheme. Without them:

- Push-notification taps can't route into the app.
- The OS can't restore the user to where they were after backgrounding.
- Share-sheet handoff doesn't work.
- Universal links / app links can't deliver into real screens.

This should be part of the foundation, not polish. It's also entangled
with the navigation choice in item 1 — React Navigation has first-class
linking config, which makes the deep-link-to-Inertia-URL mapping cheap
if we adopt option B.

### 4. iOS 26 liquid glass is blocked on toolchain, not code

The doc correctly identifies that liquid glass on `react-native-bottom-tabs`
requires being linked against the iOS 26 SDK (Xcode 26 / macOS 26). It
buries this in "prebuild gotchas." The consequence is that the stated
hard requirement of liquid glass cannot be delivered on the current dev
machine today regardless of what we ship in code.

This should be surfaced at the top of the plan as a known timeline
constraint, with a clear "ship without liquid glass now, automatic
upgrade when toolchain updates" framing — and the screenshots in any
demo/README need to be honest about what's actually rendered today vs.
what'll appear later.

---

## Second-tier issues — protocol surface

The plan treats the adapter as done-enough to extract, but several
Inertia features have no story:

- **Partial reloads** (`only`, `except`, `reset`) — silent.
- **Deferred props** — silent.
- **`mergeProps`** — silent.
- **Prefetching** (`<Link prefetch>`, `router.prefetch`, `cache_for`) —
  silent.
- **Encrypted history** (Inertia v2) — silent.
- **`useRemember`** — silent. Matters more on RN, not less: app
  backgrounding and HMR both reset transient state.
- **Persistent layouts** — silent. The screen registry maps names to
  components; how does layout persistence work?
- **Polling / `reload({ interval })`** — `reload()` exists; polling
  unclear.
- **`whenVisible` / lazy loading on scroll** — no DOM
  IntersectionObserver; could be wired to `FlatList` viewability config.
  Silent.
- **File uploads** — `FormData` with file URIs + upload progress events.
  Silent.
- **Initial-load mechanism** — what URL is hit at cold start, how is the
  first render produced. Never described.

Recommendation: before extraction, add a "feature matrix" table to the
package README that lists every official Inertia feature and marks each
as **supported / partial / not yet / N/A on RN**. This is the canonical
way adapters communicate scope and it makes the gap honest.

If we adopt item 2 (build on core), several of these come along for
free or near-free.

### Versioning is bypassed, not solved

Bypassing `version_stale?` for native works, but it's a deliberate
compromise: we lose cache invalidation as a lever on the native client.
Document it as a chosen trade, not a workaround, and call out what we'd
do if we wanted it back (e.g., a "min app version" header that triggers
a force-update flow).

### Protocol forks need to be named

These are all reasonable but they're forks of the stock Inertia
experience and should be enumerated in the gem README so adopters know
what they're opting into:

- `X-Inertia-Native: true` request header (custom).
- `200 JSON { session_token, location }` auth handshake (invented —
  Inertia has no auth handshake).
- Cookie-first, Bearer-fallback auth (diverges from stock Inertia
  Rails).

---

## Naming — flip the default

The current recommendation is `inertia-react-native` (unscoped) with
scoped only "if wary of trademark." That's the wrong default.

The `inertiajs` GitHub org owns the canonical packages. Publishing
`inertia-react-native` as an unaffiliated package will:

- Be read as official by users searching for "inertia react native."
- Invite a trademark / branding objection from the Inertia
  maintainers.
- Make a future donation of the package to the official org harder
  (the name is occupied by an unofficial release with its own
  semver history).

Defaults to use:

- npm: scoped (`@<org>/inertia-react-native`).
- gem: prefixed (`<org>-inertia_rails_native` or similar).

Unscoped names only after explicit signoff from the Inertia
maintainers, ideally with a path to moving the package under
`@inertiajs/` if the community wants it.

---

## Engineering quality items

These don't block extraction but should be on the list:

- **No testing strategy.** A protocol engine with redirect-chain
  validation handling, history snapshots, and singleton state needs
  unit tests for `router.ts` and integration tests against the Rails
  backend. Right now there are none mentioned.
- **Singleton router across Metro HMR** is documented as an insight but
  it's hidden global state — a footgun for tests and for any future
  multi-window / multi-account flow. Consider making the router
  instance an explicit context value with a factory.
- **Android cookie jar.** "Cookie auth first" needs explicit Android
  verification; RN fetch cookie persistence has had long-standing
  iOS/Android divergence. If it doesn't hold on Android, the "fallback
  to Bearer" path is effectively the primary path there.
- **Feature matrix in the README** (mentioned above) doubles as the
  testing checklist.

---

## Suggested re-sequencing before extraction

In priority order:

1. **Prototype option B** for navigation. If it works, retrofit before
   extracting. If it doesn't, document why and proceed.
2. **Re-base `router.ts` on `@inertiajs/core`.** Keep the integration
   glue, drop the reimplemented protocol bits.
3. **Add deep linking** (URL → screen → Inertia visit) as a foundation
   item, not Phase 4.
4. **Write the feature matrix** in the package README — supported /
   partial / not yet / N/A.
5. **Enumerate the protocol forks** in the gem README.
6. **Flip the naming default** to scoped.
7. **Then** execute the extraction sequence the original plan already
   has (gem scaffold, package scaffold, move files, pluggability,
   gem fill-out, READMEs, release).

Items 1 and 2 are the load-bearing ones. The rest are cheap once those
are settled.
