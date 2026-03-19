"use client"

import { useEffect } from "react"

const ORG_STORAGE_KEY = "activeOrganizationId"

export function OrganizationScopeProvider() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window)

    const patchedFetch: typeof window.fetch = async (input, init) => {
      try {
        const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
        const isApiCall =
          requestUrl.startsWith("/api/") ||
          requestUrl.includes("/api/")

        if (!isApiCall) {
          return originalFetch(input, init)
        }

        const activeOrganizationId = localStorage.getItem(ORG_STORAGE_KEY)
        if (!activeOrganizationId) {
          return originalFetch(input, init)
        }

        const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined))
        headers.set("x-organization-id", activeOrganizationId)

        return originalFetch(input, {
          ...init,
          headers,
        })
      } catch {
        return originalFetch(input, init)
      }
    }

    window.fetch = patchedFetch
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}
