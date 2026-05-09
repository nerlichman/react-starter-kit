/**
 * @inertiajs/react-native — FlashToaster
 *
 * Listens for `navigate` router events and shows a native toast (via `burnt`)
 * whenever the server sets `flash.notice` or `flash.alert`.
 *
 * Mount once at the root (createInertiaApp does this automatically). Screens
 * never need to look at flash data themselves.
 */

import { useEffect } from "react"
import * as Burnt from "burnt"

import { events } from "./events"
import type { InertiaPage } from "./types"

interface FlashShape {
  notice?: string
  alert?: string
}

export function FlashToaster() {
  useEffect(() => {
    return events.on<InertiaPage>("navigate", (page) => {
      const flash = (page?.props as { flash?: FlashShape } | undefined)?.flash
      if (!flash) return

      if (flash.notice) {
        Burnt.toast({
          title: flash.notice,
          preset: "done",
          haptic: "success",
        })
      }
      if (flash.alert) {
        Burnt.toast({
          title: flash.alert,
          preset: "error",
          haptic: "error",
        })
      }
    })
  }, [])

  return null
}
