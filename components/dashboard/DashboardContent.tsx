"use client"

import { useEffect, useMemo, useState } from "react"
import { TrendingUp, TrendingDown, FileText, Users, AlertCircle, CheckCircle } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useAuth } from "@/contexts/auth-context"

type DashboardStat = {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
  color: string
  subtitle: string
}

type ActivityItem = {
  action: string
  item: string
  time: string
  user: string
}

type AnyDoc = {
  _id?: string
  title?: string
  approved?: boolean
  archived?: boolean
  isArchived?: boolean
  createdAt?: string
  updatedAt?: string
}

const DASHBOARD_CACHE_KEY_PREFIX = "dashboardCache:v1"
const DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000

type DashboardCachePayload = {
  stats: Omit<DashboardStat, "icon">[]
  recentActivities: ActivityItem[]
  cachedAt: number
}

function getDashboardIconByTitle(title: string) {
  if (title === "Total Documents") return FileText
  if (title === "Active Users") return Users
  if (title === "Pending Reviews") return AlertCircle
  if (title === "Completed Tasks") return CheckCircle
  return FileText
}

function toSerializableStats(stats: DashboardStat[]): Omit<DashboardStat, "icon">[] {
  return stats.map(({ icon: _icon, ...rest }) => rest)
}

function hydrateCachedStats(stats: Omit<DashboardStat, "icon">[]): DashboardStat[] {
  return stats.map((stat) => ({
    ...stat,
    icon: getDashboardIconByTitle(stat.title),
  }))
}

const MODULE_ENDPOINTS = [
  "policies",
  "procedures",
  "forms",
  "certificates",
  "business-continuity",
  "management-reviews",
  "job-descriptions",
  "work-instructions",
  "risk-assessments",
  "coshh",
  "technical-file",
  "ims-aspects-impacts",
  "audit-schedule",
  "interested-parties",
  "organisational-context",
  "objectives",
  "maintenance",
  "improvement-register",
  "statement-of-applicability",
  "legal-register",
  "suppliers",
  "training",
  "energy-consumption",
]

function formatTimeAgo(dateValue?: string) {
  if (!dateValue) return "Unknown time"
  const now = Date.now()
  const then = new Date(dateValue).getTime()
  if (Number.isNaN(then)) return "Unknown time"
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export function DashboardContent() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStat[]>([
    { title: "Total Documents", value: "-", change: "0%", trend: "up", icon: FileText, color: COLORS.blue500, subtitle: "live data" },
    { title: "Active Users", value: "-", change: "0%", trend: "up", icon: Users, color: COLORS.emerald500, subtitle: "live data" },
    { title: "Pending Reviews", value: "-", change: "0%", trend: "down", icon: AlertCircle, color: COLORS.orange500, subtitle: "live data" },
    { title: "Completed Tasks", value: "-", change: "0%", trend: "up", icon: CheckCircle, color: COLORS.green500, subtitle: "live data" },
  ])
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    let cancelled = false
    const activeOrganizationId = localStorage.getItem("activeOrganizationId") || "no-org"
    const userRaw = localStorage.getItem("user")
    let userId = "anonymous"
    try {
      const parsed = userRaw ? JSON.parse(userRaw) : null
      userId = String(parsed?.id || parsed?._id || parsed?.email || "anonymous")
    } catch {
      userId = "anonymous"
    }
    const cacheKey = `${DASHBOARD_CACHE_KEY_PREFIX}:${activeOrganizationId}:${userId}`

    const applyCached = () => {
      try {
        const raw = sessionStorage.getItem(cacheKey)
        if (!raw) return false
        const parsed = JSON.parse(raw) as DashboardCachePayload
        if (!parsed?.cachedAt) return false
        if (Date.now() - parsed.cachedAt > DASHBOARD_CACHE_TTL_MS) return false
        if (!Array.isArray(parsed.stats) || !Array.isArray(parsed.recentActivities)) return false
        if (cancelled) return true
        setStats(hydrateCachedStats(parsed.stats))
        setRecentActivities(parsed.recentActivities)
        setLoading(false)
        return true
      } catch {
        return false
      }
    }

    const loadDashboardData = async (allowRetry = true, forceRefresh = false) => {
      if (!forceRefresh && applyCached()) {
        return
      }
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
        const fetchJson = async (url: string) => {
          const res = await fetch(url, { headers })
          if (!res.ok) return null
          return res.json()
        }

        const manualPromise = fetchJson("/api/manuals")
        const modulePromises = MODULE_ENDPOINTS.map((module) => fetchJson(`/api/${module}`))
        const usersPromise = fetchJson("/api/users")

        const [manualsRaw, usersRaw, ...moduleRaw] = await Promise.all([
          manualPromise,
          usersPromise,
          ...modulePromises,
        ])

        const manuals = Array.isArray(manualsRaw) ? manualsRaw : []
        const moduleDocs = moduleRaw.flatMap((chunk) => (Array.isArray(chunk) ? chunk : []))
        const allDocs: AnyDoc[] = [...manuals, ...moduleDocs]

        const activeDocs = allDocs.filter((doc) => !doc.archived && !doc.isArchived)
        const completedCount = activeDocs.filter((doc) => Boolean(doc.approved)).length
        const pendingCount = activeDocs.filter((doc) => !doc.approved).length
        const hasUsersAccess = Array.isArray(usersRaw)
        const userCount = hasUsersAccess ? usersRaw.length : null

        const nextStats: DashboardStat[] = [
          {
            title: "Total Documents",
            value: String(activeDocs.length),
            change: "live",
            trend: "up",
            icon: FileText,
            color: COLORS.blue500,
            subtitle: "current total",
          },
          {
            title: "Active Users",
            value: userCount === null ? "-" : String(userCount),
            change: "live",
            trend: "up",
            icon: Users,
            color: COLORS.emerald500,
            subtitle: hasUsersAccess ? "users in system" : "permission required",
          },
          {
            title: "Pending Reviews",
            value: String(pendingCount),
            change: "live",
            trend: "down",
            icon: AlertCircle,
            color: COLORS.orange500,
            subtitle: "not completed yet",
          },
          {
            title: "Completed Tasks",
            value: String(completedCount),
            change: "live",
            trend: "up",
            icon: CheckCircle,
            color: COLORS.green500,
            subtitle: "approved/completed",
          },
        ]
        if (cancelled) return
        setStats(nextStats)

        const activities: ActivityItem[] = activeDocs
          .map((doc) => {
            const createdAt = doc.createdAt ? new Date(doc.createdAt).getTime() : 0
            const updatedAt = doc.updatedAt ? new Date(doc.updatedAt).getTime() : 0
            const action = doc.approved
              ? "Document Approved"
              : updatedAt > createdAt
                ? "Document Updated"
                : "Document Created"
            return {
              action,
              item: doc.title || "Untitled Document",
              time: formatTimeAgo(doc.updatedAt || doc.createdAt),
              user: "System",
              sortTime: updatedAt || createdAt,
            }
          })
          .sort((a: any, b: any) => b.sortTime - a.sortTime)
          .map(({ sortTime, ...rest }: any) => rest)

        if (cancelled) return
        setRecentActivities(activities)
        try {
          const payload: DashboardCachePayload = {
            stats: toSerializableStats(nextStats),
            recentActivities: activities,
            cachedAt: Date.now(),
          }
          sessionStorage.setItem(cacheKey, JSON.stringify(payload))
        } catch {
          // Ignore cache write failures.
        }

        // On first login redirect there can be a brief token/cookie race on some hosts.
        // If everything comes back empty, retry once shortly after.
        if (allowRetry && activeDocs.length === 0) {
          window.setTimeout(() => {
            if (!cancelled) loadDashboardData(false, true)
          }, 900)
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboardData()

    const handleAuthChange = () => {
      if (!cancelled) loadDashboardData(false, true)
    }
    window.addEventListener("auth-change", handleAuthChange)

    return () => {
      cancelled = true
      window.removeEventListener("auth-change", handleAuthChange)
    }
  }, [authLoading, isAuthenticated])

  const gradients = useMemo(
    () => [COLORS.gradientBlue, COLORS.gradientGreen, COLORS.gradientSunset, COLORS.gradientIndigo],
    []
  )
  const shadows = useMemo(
    () => [COLORS.shadowBlue, COLORS.shadowGreen, COLORS.shadowOrange, COLORS.shadowPurple],
    []
  )
  const visibleActivities = showAllActivities ? recentActivities : recentActivities.slice(0, 6)

  return (
    <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown

                    return (
                        <div
                            key={index}
                            className="p-7 rounded-xl border-0 transition-all duration-300 hover:scale-105 cursor-pointer"
                            style={{
                                background: gradients[index],
                                boxShadow: shadows[index]
                            }}
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div
                                    className="p-4 rounded-lg backdrop-blur-sm"
                                    style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                                >
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <div
                                    className="flex items-center gap-1 text-base font-bold text-white"
                                >
                                    <TrendIcon className="w-5 h-5" />
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2 text-white">
                                {stat.value}
                            </h3>
                            <p className="text-base font-bold mb-2 text-white opacity-90">
                                {stat.title}
                            </p>
                            <p className="text-sm text-white opacity-75">
                                {loading ? "loading..." : stat.subtitle}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div
                className="p-7 rounded-xl border"
                style={{
                    background: COLORS.bgWhite,
                    borderColor: COLORS.border
                }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
                        Recent Activity
                    </h2>
                    <button
                        onClick={() => setShowAllActivities((prev) => !prev)}
                        className="text-base font-bold"
                        style={{ color: COLORS.primary }}
                    >
                        {showAllActivities ? "View Less" : "View All"}
                    </button>
                </div>
                <div className="space-y-4">
                    {visibleActivities.length === 0 ? (
                      <div className="p-5 rounded-lg" style={{ background: COLORS.bgGray }}>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {loading ? "Loading recent activity..." : "No recent activity found."}
                        </p>
                      </div>
                    ) : (
                      visibleActivities.map((activity, index) => (
                          <div
                              key={index}
                              className="flex items-center justify-between p-5 rounded-lg transition-all duration-200 hover:bg-opacity-50"
                              style={{ background: COLORS.bgGray }}
                          >
                              <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                      <span className="font-bold text-base" style={{ color: COLORS.textPrimary }}>
                                          {activity.action}
                                      </span>
                                      <span
                                          className="px-3 py-1 rounded text-sm font-semibold"
                                          style={{
                                              background: `${COLORS.primary}15`,
                                              color: COLORS.primary
                                          }}
                                      >
                                          {activity.item}
                                      </span>
                                  </div>
                                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                                      by {activity.user} • {activity.time}
                                  </p>
                                </div>
                          </div>
                      ))
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    className="p-7 rounded-xl border-0 cursor-pointer transition-all duration-300 hover:scale-105"
                    style={{
                        background: COLORS.gradientCyan,
                        boxShadow: COLORS.shadowBlue
                    }}
                >
                    <div className="text-center">
                        <div
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm"
                            style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                        >
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">
                            Create Document
                        </h3>
                        <p className="text-base text-white opacity-90">
                            Start a new policy or procedure
                        </p>
                    </div>
                </div>

                <div
                    className="p-7 rounded-xl border-0 cursor-pointer transition-all duration-300 hover:scale-105"
                    style={{
                        background: COLORS.gradientForest,
                        boxShadow: COLORS.shadowGreen
                    }}
                >
                    <div className="text-center">
                        <div
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm"
                            style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                        >
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">
                            Review Tasks
                        </h3>
                        <p className="text-base text-white opacity-90">
                            Check pending approvals
                        </p>
                    </div>
                </div>

                <div
                    className="p-7 rounded-xl border-0 cursor-pointer transition-all duration-300 hover:scale-105"
                    style={{
                        background: COLORS.gradientPurple,
                        boxShadow: COLORS.shadowPink
                    }}
                >
                    <div className="text-center">
                        <div
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm"
                            style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                        >
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white">
                            View Alerts
                        </h3>
                        <p className="text-base text-white opacity-90">
                            Check system notifications
                        </p>
                    </div>
                </div>
            </div>
    </div>
  )
}
