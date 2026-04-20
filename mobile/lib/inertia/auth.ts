/**
 * Auth token management using expo-secure-store.
 * Stores the session token securely on device.
 */

import * as SecureStore from "expo-secure-store"

const SESSION_TOKEN_KEY = "inertia_session_token"

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY)
  } catch {
    return null
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token)
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY)
}
