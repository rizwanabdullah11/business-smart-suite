"use client"

import { useEffect, useMemo, useState } from "react"
import { TrendingUp, TrendingDown, FileText, Users, AlertCircle, CheckCircle, FileDown, Loader2 } from "lucide-react"
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
  dateValue?: string
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
  docs: AnyDoc[]
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

type DashboardApiResponse = {
  stats?: Omit<DashboardStat, "icon">[]
  recentActivities?: ActivityItem[]
  docs?: AnyDoc[]
}

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
  const { user, isAuthenticated, isAdmin, isEmployee, isOrganization, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStat[]>([
    { title: "Total Documents", value: "-", change: "0%", trend: "up", icon: FileText, color: COLORS.blue500, subtitle: "live data" },
    { title: "Active Users", value: "-", change: "0%", trend: "up", icon: Users, color: COLORS.emerald500, subtitle: "live data" },
    { title: "Pending Reviews", value: "-", change: "0%", trend: "down", icon: AlertCircle, color: COLORS.orange500, subtitle: "live data" },
    { title: "Completed Tasks", value: "-", change: "0%", trend: "up", icon: CheckCircle, color: COLORS.green500, subtitle: "live data" },
  ])
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [dashboardDocs, setDashboardDocs] = useState<AnyDoc[]>([])
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportStartDate, setExportStartDate] = useState("")
  const [exportEndDate, setExportEndDate] = useState("")

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
        if (!Array.isArray(parsed.stats) || !Array.isArray(parsed.recentActivities) || !Array.isArray(parsed.docs)) return false
        if (cancelled) return true
        setStats(hydrateCachedStats(parsed.stats))
        setRecentActivities(parsed.recentActivities)
        setDashboardDocs(parsed.docs)
        setLoading(false)
        return true
      } catch {
        return false
      }
    }

    const loadDashboardData = async (_allowRetry = true, forceRefresh = false) => {
      if (!forceRefresh && applyCached()) {
        return
      }
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
        const response = await fetch("/api/auth/dashboard", {
          headers,
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error("Failed to load dashboard data")
        }

        const payload = (await response.json()) as DashboardApiResponse
        const nextStats = hydrateCachedStats(Array.isArray(payload.stats) ? payload.stats : [])
        const docs = Array.isArray(payload.docs) ? payload.docs : []
        const activities = Array.isArray(payload.recentActivities) ? payload.recentActivities : []

        if (cancelled) return
        setStats(nextStats)
        setDashboardDocs(docs)
        setRecentActivities(activities)
        try {
          const payload: DashboardCachePayload = {
            stats: toSerializableStats(nextStats),
            recentActivities: activities,
            docs,
            cachedAt: Date.now(),
          }
          sessionStorage.setItem(cacheKey, JSON.stringify(payload))
        } catch {
          // Ignore cache write failures.
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
  const isExportRangeValid =
    Boolean(exportStartDate) &&
    Boolean(exportEndDate) &&
    new Date(exportStartDate).getTime() <= new Date(exportEndDate).getTime()
  const dashboardScopeLabel = useMemo(() => {
    if (isEmployee) return "Employee Dashboard"
    if (isOrganization) return "Organization Dashboard"
    if (isAdmin) return "Admin Dashboard"
    return "Dashboard"
  }, [isAdmin, isEmployee, isOrganization])

  const handleExportPdf = async () => {
    if (!exportStartDate || !exportEndDate) {
      alert("Please select a start date and end date first.")
      return
    }
    if (new Date(exportStartDate).getTime() > new Date(exportEndDate).getTime()) {
      alert("End date must be after start date.")
      return
    }

    setExportingPdf(true)
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 40
      const contentWidth = pageWidth - margin * 2
      const lineHeight = 16
      let y = margin
      const startDate = new Date(`${exportStartDate}T00:00:00`)
      const endDate = new Date(`${exportEndDate}T23:59:59.999`)
      const filteredDocs = dashboardDocs.filter((doc) => {
        const rawDate = doc.updatedAt || doc.createdAt
        if (!rawDate) return false
        const date = new Date(rawDate)
        if (Number.isNaN(date.getTime())) return false
        return date >= startDate && date <= endDate
      })
      const filteredActivities = recentActivities.filter((activity) => {
        if (!activity.dateValue) return false
        const date = new Date(activity.dateValue)
        if (Number.isNaN(date.getTime())) return false
        return date >= startDate && date <= endDate
      })
      const filteredStats = [
        {
          title: "Total Documents",
          value: String(filteredDocs.length),
          subtitle: "within selected date range",
          change: "filtered",
        },
        {
          title: "Active Users",
          value: stats.find((stat) => stat.title === "Active Users")?.value || "-",
          subtitle: "current scoped users",
          change: "live",
        },
        {
          title: "Pending Reviews",
          value: String(filteredDocs.filter((doc) => !doc.approved).length),
          subtitle: "within selected date range",
          change: "filtered",
        },
        {
          title: "Completed Tasks",
          value: String(filteredDocs.filter((doc) => Boolean(doc.approved)).length),
          subtitle: "within selected date range",
          change: "filtered",
        },
      ]

      const ensurePageSpace = (heightNeeded = 24) => {
        if (y + heightNeeded <= pageHeight - margin) return
        doc.addPage()
        y = margin
      }

      const writeWrappedText = (text: string, size = 11, color: string = COLORS.textSecondary) => {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(size)
        doc.setTextColor(color)
        const lines = doc.splitTextToSize(text, contentWidth)
        ensurePageSpace(lines.length * lineHeight)
        doc.text(lines, margin, y)
        y += lines.length * lineHeight
      }

      const writeSectionTitle = (text: string) => {
        ensurePageSpace(30)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.setTextColor(COLORS.textPrimary)
        doc.text(text, margin, y)
        y += 24
      }

      const writeItemTitle = (text: string) => {
        ensurePageSpace(20)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(COLORS.textPrimary)
        doc.text(text, margin, y)
        y += 16
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(22)
      doc.setTextColor(COLORS.textPrimary)
      doc.text("Business Smart Suite Dashboard Report", margin, y)
      y += 28

      writeWrappedText(`Scope: ${dashboardScopeLabel}`, 12, COLORS.primary)
      writeWrappedText(`User: ${user?.name || "Unknown User"} (${user?.role || "unknown"})`)
      writeWrappedText(`Generated: ${new Date().toLocaleString()}`)
      writeWrappedText(`Date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`)

      const activeOrganizationId =
        typeof window !== "undefined" ? localStorage.getItem("activeOrganizationId") || "" : ""
      if (activeOrganizationId) {
        writeWrappedText(`Organization Scope ID: ${activeOrganizationId}`)
      }

      y += 8
      writeSectionTitle("Summary")
      filteredStats.forEach((stat) => {
        writeItemTitle(`${stat.title}: ${stat.value}`)
        writeWrappedText(`${stat.subtitle} | Change: ${stat.change}`)
        y += 6
      })

      y += 6
      writeSectionTitle("Recent Activity")
      if (filteredActivities.length === 0) {
        writeWrappedText(loading ? "Dashboard data is still loading." : "No recent activity found in the selected date range.")
      } else {
        filteredActivities.forEach((activity, index) => {
          writeItemTitle(`${index + 1}. ${activity.action}`)
          writeWrappedText(`Item: ${activity.item}`)
          writeWrappedText(`By: ${activity.user} | Time: ${activity.time}`)
          y += 8
        })
      }

      const safeScope = dashboardScopeLabel.toLowerCase().replace(/\s+/g, "-")
      const safeDate = new Date().toISOString().slice(0, 10)
      doc.save(`${safeScope}-${safeDate}.pdf`)
    } catch (error) {
      console.error("Failed to export dashboard PDF:", error)
      alert("Failed to export dashboard PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="space-y-8">
            <div
                className="p-6 rounded-xl border space-y-4"
                style={{
                    background: COLORS.bgWhite,
                    borderColor: COLORS.border
                }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
                            {dashboardScopeLabel}
                        </h2>
                        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                            Select a start and end date, then export the scoped dashboard data as PDF.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleExportPdf}
                        disabled={exportingPdf || loading || !isExportRangeValid}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold transition-all duration-200"
                        style={{
                            background: COLORS.gradientIndigo,
                            color: COLORS.textWhite,
                            boxShadow: COLORS.shadowPurple,
                            opacity: exportingPdf || loading || !isExportRangeValid ? 0.7 : 1
                        }}
                    >
                        {exportingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
                        {exportingPdf ? "Generating PDF..." : "Download PDF"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
                            Start date
                        </label>
                        <input
                            type="date"
                            value={exportStartDate}
                            onChange={(e) => setExportStartDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            style={{
                                borderColor: COLORS.border,
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
                            End date
                        </label>
                        <input
                            type="date"
                            value={exportEndDate}
                            onChange={(e) => setExportEndDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            style={{
                                borderColor: COLORS.border,
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                            }}
                        />
                    </div>
                </div>

                {!isExportRangeValid ? (
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                        Select a valid start date and end date to enable PDF download.
                    </p>
                ) : null}
            </div>

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
