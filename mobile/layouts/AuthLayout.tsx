/**
 * Auth layout — centered card for login/signup screens.
 * No tab bar. Similar to the web AuthSimpleLayout.
 */

import React, { type ReactNode, useMemo } from "react"
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from "react-native"

import { useTheme, type Theme } from "../lib/theme"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const theme = useTheme()
  const styles = useMemo(() => makeStyles(theme), [theme])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: 24,
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
    },
  })
