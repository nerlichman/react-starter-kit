/**
 * Shared types between web and mobile.
 * Mirrors app/frontend/types/index.ts (without lucide-react dependency).
 */

export interface Auth {
  user: User
  session: Pick<Session, "id">
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  verified: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface Session {
  id: string
  user_agent: string
  ip_address: string
  created_at: string
}

export interface SharedProps {
  auth: Auth
  flash?: FlashData
  [key: string]: unknown
}

export interface FlashData {
  alert?: string
  notice?: string
}

/** Page-specific prop types */

export interface DashboardProps extends SharedProps {}

export interface SessionsNewProps extends SharedProps {}

export interface SettingsProfileProps extends SharedProps {}

export interface SettingsPasswordProps extends SharedProps {}

export interface SettingsEmailProps extends SharedProps {}

export interface SettingsSessionsProps extends SharedProps {
  sessions: Session[]
}

export interface SettingsAppearanceProps extends SharedProps {}
