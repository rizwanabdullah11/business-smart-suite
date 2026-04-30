import { moduleKeyForSlug } from "@/lib/platform/plans"
import type { AuthUser } from "@/lib/server/auth"

export function isModuleEnabledForUser(user: AuthUser, moduleSlug: string): boolean {
  const key = moduleKeyForSlug(moduleSlug)
  // Not a platform-gated module → allow
  if (!key) return true

  const enabled = user.enabledModules
  // Backward-compat: if not present, don't block
  if (!Array.isArray(enabled)) return true
  return enabled.includes(key)
}

