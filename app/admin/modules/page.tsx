"use client"

import { useEffect, useMemo, useState } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { useEnabledModules } from "@/hooks/use-enabled-modules"
import { MODULE_CATALOG, PLAN_DEFAULT_MODULES, type ModuleKey, type SubscriptionPlan } from "@/lib/modules/catalog"
import { Permission } from "@/lib/types/permissions"
import { COLORS } from "@/constant/colors"

type OrgRow = { _id: string; name?: string; email?: string }

function readToken() {
  try {
    return localStorage.getItem("token")
  } catch {
    return null
  }
}

function readActiveOrgId() {
  try {
    return localStorage.getItem("activeOrganizationId") || ""
  } catch {
    return ""
  }
}

export default function AdminModulesPage() {
  const { can, loading: permsLoading } = usePermissions()
  const { plan, enabledModules, availableModules, loading, refresh, error } = useEnabledModules()

  const [organizations, setOrganizations] = useState<OrgRow[]>([])
  const [activeOrgId, setActiveOrgId] = useState<string>(() => readActiveOrgId())
  const [draftPlan, setDraftPlan] = useState<SubscriptionPlan>("starter")
  const [draftEnabled, setDraftEnabled] = useState<Set<ModuleKey>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string>("")
  const [saveOk, setSaveOk] = useState<string>("")

  const allowed = can ? can : () => false
  const canManage = allowed(Permission.MANAGE_ROLES)

  useEffect(() => {
    if (!canManage) return
    const token = readToken()
    if (!token) return
    fetch("/api/organizations", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setOrganizations(Array.isArray(rows) ? rows : []))
      .catch(() => setOrganizations([]))
  }, [canManage])

  useEffect(() => {
    setDraftPlan(plan || "starter")
    setDraftEnabled(new Set(enabledModules))
  }, [plan, enabledModules])

  useEffect(() => {
    const id = readActiveOrgId()
    if (id !== activeOrgId) setActiveOrgId(id)
  }, [activeOrgId])

  const planAvailableSet = useMemo(() => new Set(PLAN_DEFAULT_MODULES[draftPlan] || []), [draftPlan])
  const sortedCatalog = useMemo(() => [...MODULE_CATALOG].sort((a, b) => a.label.localeCompare(b.label)), [])

  const onSelectOrg = (orgId: string) => {
    setActiveOrgId(orgId)
    try {
      if (orgId) localStorage.setItem("activeOrganizationId", orgId)
      else localStorage.removeItem("activeOrganizationId")
      window.dispatchEvent(new Event("organization-change"))
    } catch {
      // ignore
    }
    refresh()
  }

  const toggleModule = (key: ModuleKey) => {
    setDraftEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const applyPlanDefaults = () => {
    setDraftEnabled(new Set(PLAN_DEFAULT_MODULES[draftPlan] || []))
  }

  const save = async () => {
    setSaveError("")
    setSaveOk("")
    if (!activeOrgId) {
      setSaveError("Select an organization first.")
      return
    }
    setSaving(true)
    try {
      const token = readToken()
      const enabledInPlan = Array.from(draftEnabled).filter((m) => planAvailableSet.has(m))
      const res = await fetch("/api/modules", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          organizationId: activeOrgId,
          plan: draftPlan,
          enabledModules: enabledInPlan,
        }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.message || payload?.error || "Failed to save module activation")
      }
      setSaveOk("Saved successfully.")
      try {
        localStorage.removeItem(`enabledModulesCache:v1:${activeOrgId}`)
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event("organization-change"))
      await refresh()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (permsLoading) {
    return (
      <div className="p-6" style={{ color: COLORS.textSecondary }}>
        Loading…
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="p-6">
        <div className="rounded-xl border p-5" style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}>
          <h1 className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
            Module Activation
          </h1>
          <p className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
            You do not have permission to manage module activation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl border p-6" style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Module Activation
            </h1>
            <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
              Choose an organization, set its subscription plan, and enable only the modules included in that plan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={activeOrgId}
              onChange={(e) => onSelectOrg(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm font-semibold"
              style={{ borderColor: COLORS.border, background: COLORS.bgWhite, color: COLORS.textPrimary, minWidth: 260 }}
              title="Select organization scope"
            >
              <option value="">Select organization…</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name || org.email || org._id}
                </option>
              ))}
            </select>

            <select
              value={draftPlan}
              onChange={(e) => setDraftPlan(e.target.value as SubscriptionPlan)}
              className="px-3 py-2 rounded-lg border text-sm font-semibold"
              style={{ borderColor: COLORS.border, background: COLORS.bgWhite, color: COLORS.textPrimary, minWidth: 180 }}
              disabled={!activeOrgId}
              title="Subscription plan"
            >
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {!activeOrgId ? (
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: COLORS.border, background: COLORS.bgGrayLight }}>
            <p className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
              Select an organization to manage its module access.
            </p>
            <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
              Modules are hidden until an active organization is chosen (this prevents Admin from seeing modules with no scope).
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: COLORS.orange200, background: COLORS.orange50 }}>
            <p className="text-sm font-semibold" style={{ color: COLORS.orange700 }}>
              {error}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border p-6" style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              Modules
            </h2>
            <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
              Only modules included in the selected plan can be enabled.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyPlanDefaults}
              disabled={!activeOrgId}
              className="px-4 py-2 rounded-lg text-sm font-bold border"
              style={{
                borderColor: COLORS.purple200,
                background: COLORS.purple50,
                color: COLORS.purple700,
                opacity: activeOrgId ? 1 : 0.6,
              }}
            >
              Apply plan defaults
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!activeOrgId || saving}
              className="px-4 py-2 rounded-lg text-sm font-bold"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#341746)",
                color: COLORS.textWhite,
                opacity: !activeOrgId || saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {saveError ? (
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: COLORS.orange200, background: COLORS.orange50 }}>
            <p className="text-sm font-semibold" style={{ color: COLORS.orange700 }}>
              {saveError}
            </p>
          </div>
        ) : null}
        {saveOk ? (
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: COLORS.green200, background: COLORS.green100 }}>
            <p className="text-sm font-semibold" style={{ color: COLORS.green600 }}>
              {saveOk}
            </p>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedCatalog.map((mod) => {
            const inPlan = planAvailableSet.has(mod.key)
            const checked = draftEnabled.has(mod.key) && inPlan
            const disabled = !activeOrgId || !inPlan
            return (
              <label
                key={mod.key}
                className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer"
                style={{
                  borderColor: COLORS.border,
                  background: disabled ? COLORS.bgGrayLight : COLORS.bgWhite,
                  opacity: disabled ? 0.75 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleModule(mod.key)}
                  className="mt-1"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>
                      {mod.label}
                    </p>
                    {!inPlan ? (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ borderColor: COLORS.border, color: COLORS.textSecondary, background: COLORS.bgGrayLight }}
                      >
                        Not in plan
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                    {mod.description}
                  </p>
                  <p className="text-[11px] mt-2" style={{ color: COLORS.textLight }}>
                    Route: <span className="font-mono">/{mod.routeSegment}</span>
                  </p>
                </div>
              </label>
            )
          })}
        </div>

        {loading ? (
          <p className="text-xs mt-4" style={{ color: COLORS.textSecondary }}>
            Loading current activation…
          </p>
        ) : null}
        {activeOrgId && availableModules?.length ? (
          <p className="text-xs mt-3" style={{ color: COLORS.textSecondary }}>
            Plan modules: <span className="font-semibold">{draftPlan}</span> · Available:{" "}
            <span className="font-semibold">{availableModules.length}</span> · Enabled:{" "}
            <span className="font-semibold">{draftEnabled.size}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}

