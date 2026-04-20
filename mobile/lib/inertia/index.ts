/**
 * @inertiajs/react-native
 *
 * Public API — mirrors the web adapter's exports.
 */

// App setup
export { createInertiaApp } from "./createInertiaApp"

// Router
export { router } from "./router"

// Hooks
export { usePage, useFlash } from "./context"
export { useForm } from "./form"
export type { InertiaFormProps } from "./form"

// Components
export { Link } from "./link"

// Types
export type {
  InertiaPage,
  PageProps,
  Errors,
  VisitOptions,
  Method,
  PageComponent,
  LayoutFunction,
  FlashData,
} from "./types"
