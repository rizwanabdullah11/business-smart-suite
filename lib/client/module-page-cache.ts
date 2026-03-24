"use client"

export type ModulePageCachePayload = {
  categories: any[]
  archivedCategories: any[]
  categoryItemView: Record<string, "active" | "archived" | "completed" | "highlighted">
  expandedCategories: string[]
  cachedAt: number
}

const MODULE_PAGE_CACHE_PREFIX = "modulePageCache:v1"
const MODULE_PAGE_CACHE_TTL_MS = 2 * 60 * 1000

function getScopeKey() {
  if (typeof window === "undefined") return "server"

  const activeOrganizationId = localStorage.getItem("activeOrganizationId") || "no-org"
  const userRaw = localStorage.getItem("user")

  let userId = "anonymous"
  let role = "unknown"
  try {
    const parsed = userRaw ? JSON.parse(userRaw) : null
    userId = String(parsed?.id || parsed?._id || parsed?.email || "anonymous")
    role = String(parsed?.role || "unknown").toLowerCase()
  } catch {
    userId = "anonymous"
    role = "unknown"
  }

  return `${role}:${userId}:${activeOrganizationId}`
}

function getCacheKey(moduleKey: string) {
  return `${MODULE_PAGE_CACHE_PREFIX}:${moduleKey}:${getScopeKey()}`
}

export function readModulePageCache(moduleKey: string): ModulePageCachePayload | null {
  if (typeof window === "undefined") return null

  try {
    const raw = sessionStorage.getItem(getCacheKey(moduleKey))
    if (!raw) return null

    const parsed = JSON.parse(raw) as ModulePageCachePayload
    if (!parsed?.cachedAt) return null
    if (Date.now() - parsed.cachedAt > MODULE_PAGE_CACHE_TTL_MS) {
      sessionStorage.removeItem(getCacheKey(moduleKey))
      return null
    }

    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.archivedCategories)) return null

    return parsed
  } catch {
    return null
  }
}

export function writeModulePageCache(
  moduleKey: string,
  payload: Omit<ModulePageCachePayload, "cachedAt">
) {
  if (typeof window === "undefined") return

  try {
    sessionStorage.setItem(
      getCacheKey(moduleKey),
      JSON.stringify({
        ...payload,
        cachedAt: Date.now(),
      } satisfies ModulePageCachePayload)
    )
  } catch {
    // Ignore sessionStorage write failures.
  }
}
