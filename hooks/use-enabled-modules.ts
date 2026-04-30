"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ModuleKey, SubscriptionPlan } from "@/lib/modules/catalog"

type EnabledModulesState = {
  loading: boolean
  organizationId: string | null
  plan: SubscriptionPlan | null
  enabledModules: ModuleKey[]
  availableModules: ModuleKey[]
  error?: string
}

const CACHE_PREFIX = "enabledModulesCache:v1"

function readActiveOrgId() {
  try {
    return localStorage.getItem("activeOrganizationId")
  } catch {
    return null
  }
}

function readToken() {
  try {
    return localStorage.getItem("token")
  } catch {
    return null
  }
}

export function useEnabledModules() {
  const [state, setState] = useState<EnabledModulesState>(() => {
    const orgId = readActiveOrgId()
    if (!orgId) {
      return { loading: false, organizationId: null, plan: null, enabledModules: [], availableModules: [] }
    }
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}:${orgId}`)
      const parsed = raw ? (JSON.parse(raw) as Omit<EnabledModulesState, "loading">) : null
      if (parsed?.organizationId === orgId && Array.isArray(parsed.enabledModules)) {
        return { ...parsed, loading: false }
      }
    } catch {
      // ignore
    }
    return { loading: true, organizationId: orgId, plan: null, enabledModules: [], availableModules: [] }
  })

  const refresh = useCallback(async () => {
    const orgId = readActiveOrgId()
    if (!orgId) {
      setState({ loading: false, organizationId: null, plan: null, enabledModules: [], availableModules: [] })
      return
    }

    setState((prev) => ({ ...prev, loading: true, organizationId: orgId, error: undefined }))
    try {
      const token = readToken()
      const res = await fetch("/api/modules", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const payload = (await res.json().catch(() => null)) as any
      if (!res.ok) {
        throw new Error(payload?.message || payload?.error || "Failed to load module activation")
      }

      const next: EnabledModulesState = {
        loading: false,
        organizationId: String(payload.organizationId || orgId),
        plan: payload.plan || null,
        enabledModules: Array.isArray(payload.enabledModules) ? payload.enabledModules : [],
        availableModules: Array.isArray(payload.availableModules) ? payload.availableModules : [],
      }

      setState(next)
      try {
        localStorage.setItem(`${CACHE_PREFIX}:${orgId}`, JSON.stringify({ ...next, loading: undefined }))
      } catch {
        // ignore cache write errors
      }
    } catch (e) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load module activation",
      }))
    }
  }, [])

  useEffect(() => {
    refresh()
    const onOrgChange = () => refresh()
    const onAuthChange = () => refresh()
    window.addEventListener("organization-change", onOrgChange)
    window.addEventListener("auth-change", onAuthChange)
    return () => {
      window.removeEventListener("organization-change", onOrgChange)
      window.removeEventListener("auth-change", onAuthChange)
    }
  }, [refresh])

  const enabledSet = useMemo(() => new Set(state.enabledModules), [state.enabledModules])

  const isEnabled = useCallback(
    (moduleKey: string) => {
      return enabledSet.has(moduleKey as ModuleKey)
    },
    [enabledSet]
  )

  return {
    ...state,
    enabledSet,
    isEnabled,
    refresh,
  }
}

