"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/lib/types/permissions"
import { PLATFORM_MODULES, getDefaultEnabledModulesForPlan, type SubscriptionPlan, type PlatformModuleKey } from "@/lib/platform/plans"
import { COLORS } from "@/constant/colors"

type Org = { _id: string; name: string; email: string }

const ORG_STORAGE_KEY = "activeOrganizationId"

export default function BillingPage() {
  const router = useRouter()
  const { can, isAdmin, isOrganization, loading: permLoading } = usePermissions()

  const [orgs, setOrgs] = useState<Org[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [plan, setPlan] = useState<SubscriptionPlan>("starter")
  const [enabledModules, setEnabledModules] = useState<PlatformModuleKey[]>([])

  const allowedKeys = useMemo(() => new Set<PlatformModuleKey>(PLATFORM_MODULES.map((m) => m.key)), [])

  useEffect(() => {
    if (!permLoading && !can(Permission.VIEW_ORGANIZATION)) {
      router.push("/unauthorized")
    }
  }, [can, permLoading, router])

  useEffect(() => {
    const fromStorage = localStorage.getItem(ORG_STORAGE_KEY) || ""
    setSelectedOrgId(fromStorage)
  }, [])

  useEffect(() => {
    const loadOrgs = async () => {
      if (!isAdmin) return
      const token = localStorage.getItem("token")
      const res = await fetch("/api/organizations", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json().catch(() => [])
      setOrgs(Array.isArray(data) ? data : [])
    }
    void loadOrgs()
  }, [isAdmin])

  const loadPlanSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/billing/plan", { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to load plan settings")

      const nextPlan = (String(data?.plan || "starter") as SubscriptionPlan) || "starter"
      const nextEnabledRaw: unknown[] = Array.isArray(data?.enabledModules) ? data.enabledModules : []
      const nextEnabled = nextEnabledRaw
        .map((k) => String(k || "").trim())
        .filter((k): k is PlatformModuleKey => allowedKeys.has(k as PlatformModuleKey))

      setPlan(nextPlan)
      setEnabledModules(nextEnabled.length > 0 ? nextEnabled : getDefaultEnabledModulesForPlan(nextPlan))
    } catch (e) {
      // If org isn't selected for admin, keep UI but show empty state.
      console.error(e)
      setEnabledModules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (can(Permission.VIEW_ORGANIZATION)) {
      void loadPlanSettings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrgId, can])

  const onSelectOrg = (orgId: string) => {
    setSelectedOrgId(orgId)
    if (orgId) localStorage.setItem(ORG_STORAGE_KEY, orgId)
    else localStorage.removeItem(ORG_STORAGE_KEY)
    window.dispatchEvent(new Event("auth-change"))
  }

  const onToggleModule = (key: PlatformModuleKey) => {
    setEnabledModules((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const onSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/billing/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, enabledModules }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to save")
      window.dispatchEvent(new Event("auth-change"))
      alert("Plan saved successfully.")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save plan"
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  if (permLoading || loading) {
    return <div className="p-8">Loading…</div>
  }

  if (!can(Permission.VIEW_ORGANIZATION)) {
    return null
  }

  return (
    <div className="min-h-screen p-6" style={{ background: COLORS.bgGray }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
            Billing & Plan
          </h1>
          <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
            Set your subscription plan and enabled platform modules.
          </p>
        </div>

        {isAdmin ? (
          <div className="mb-6 rounded-xl p-4" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
              Organization (scope)
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => onSelectOrg(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border"
              style={{ borderColor: COLORS.border, background: COLORS.bgWhite, color: COLORS.textPrimary }}
            >
              <option value="">Select organization…</option>
              {orgs.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
            <p className="text-xs mt-2" style={{ color: COLORS.textSecondary }}>
              Admin plan settings apply to the currently selected organization.
            </p>
          </div>
        ) : null}

        <div className="rounded-xl p-5 mb-6" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
          <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
            Subscription plan
          </label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
            className="w-full px-4 py-2.5 rounded-lg border"
            style={{ borderColor: COLORS.border, background: COLORS.bgWhite, color: COLORS.textPrimary }}
            disabled={!isAdmin}
          >
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="enterprise">Enterprise</option>
          </select>
          {!isAdmin && isOrganization ? (
            <p className="text-xs mt-2" style={{ color: COLORS.textSecondary }}>
              Only system admin can change plan.
            </p>
          ) : null}
        </div>

        <div className="rounded-xl p-5" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
              Enabled modules
            </h2>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setEnabledModules(getDefaultEnabledModulesForPlan(plan))}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: COLORS.bgGray, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
              >
                Reset to plan defaults
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            {PLATFORM_MODULES.map((m) => {
              const available = m.availableIn.includes(plan)
              const checked = enabledModules.includes(m.key)
              return (
                <label
                  key={m.key}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg"
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    background: checked ? `${COLORS.primary}08` : COLORS.bgWhite,
                    opacity: available ? 1 : 0.6,
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      {m.label}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.textSecondary }}>
                      Available in: {m.availableIn.join(", ")}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!isAdmin || !available}
                    onChange={() => onToggleModule(m.key)}
                    className="h-5 w-5"
                  />
                </label>
              )
            })}
          </div>

          <div className="mt-5 flex justify-end">
            {isAdmin ? (
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg font-semibold"
                style={{ background: COLORS.primary, color: COLORS.textWhite, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

