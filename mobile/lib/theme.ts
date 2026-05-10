/**
 * Theme tokens + useTheme() hook.
 *
 * Reads the device's color scheme via React Native's `useColorScheme()` so the
 * app follows the OS appearance (Settings → Display & Brightness on iOS,
 * Settings → Display on Android). When we add a user-pickable theme later,
 * the override layer slots in here — call sites stay unchanged.
 */

import { useColorScheme } from "react-native"

export interface ThemeColors {
  background: string
  surface: string
  surfaceMuted: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  primary: string
  primaryMuted: string
  onPrimary: string
  inverseSurface: string
  onInverseSurface: string
  danger: string
  dangerStrong: string
  dangerSurface: string
  warning: string
}

export interface Theme {
  scheme: "light" | "dark"
  colors: ThemeColors
}

const lightColors: ThemeColors = {
  background: "#ffffff",
  surface: "#f5f5f5",
  surfaceMuted: "#e5e7eb",
  text: "#000000",
  textSecondary: "#4b5563",
  textMuted: "#6b7280",
  border: "#d4d4d4",
  primary: "#2563eb",
  primaryMuted: "#93c5fd",
  onPrimary: "#ffffff",
  inverseSurface: "#171717",
  onInverseSurface: "#ffffff",
  danger: "#ef4444",
  dangerStrong: "#b91c1c",
  dangerSurface: "#fee2e2",
  warning: "#b45309",
}

const darkColors: ThemeColors = {
  background: "#000000",
  surface: "#1c1c1e",
  surfaceMuted: "#2c2c2e",
  text: "#ffffff",
  textSecondary: "#c7c7cc",
  textMuted: "#8e8e93",
  border: "#3a3a3c",
  primary: "#0a84ff",
  primaryMuted: "#1f3a5f",
  onPrimary: "#ffffff",
  inverseSurface: "#f2f2f7",
  onInverseSurface: "#000000",
  danger: "#ff453a",
  dangerStrong: "#ff6b6b",
  dangerSurface: "#3a1f1f",
  warning: "#ffb454",
}

export function useTheme(): Theme {
  const scheme = useColorScheme()
  return scheme === "dark"
    ? { scheme: "dark", colors: darkColors }
    : { scheme: "light", colors: lightColors }
}
