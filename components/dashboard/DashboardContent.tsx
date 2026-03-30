"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  FileDown,
  Loader2,
  ArrowLeft,
  Activity,
  Zap,
  ShieldCheck,
  BarChart2,
  BookOpen,
} from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useAuth } from "@/contexts/auth-context"
import { Permission } from "@/lib/types/permissions"

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
  _module?: string
  title?: string
  approved?: boolean
  archived?: boolean
  isArchived?: boolean
  createdAt?: string
  updatedAt?: string
}

const PDF_MODULE_ORDER = [
  "manual",
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
  "customer-feedback",
] as const

const PDF_MODULE_LABELS: Record<string, string> = {
  manual: "Manual",
  policies: "Policies",
  procedures: "Procedures",
  forms: "Forms",
  certificates: "Certificates",
  "business-continuity": "Business Continuity",
  "management-reviews": "Management Reviews",
  "job-descriptions": "Job Descriptions",
  "work-instructions": "Work Instructions",
  "risk-assessments": "Risk Assessments",
  coshh: "COSHH",
  "technical-file": "Technical File",
  "ims-aspects-impacts": "IMS Aspects & Impacts",
  "audit-schedule": "Audit Schedule",
  "interested-parties": "Interested Parties",
  "organisational-context": "Organisational Context",
  objectives: "Objectives",
  maintenance: "Maintenance",
  "improvement-register": "Improvement Register",
  "statement-of-applicability": "Statement of Applicability",
  "legal-register": "Legal Register",
  suppliers: "Suppliers",
  training: "Training",
  "energy-consumption": "Energy Consumption",
  "customer-feedback": "Customer Feedback",
}

const DASHBOARD_CACHE_KEY_PREFIX = "dashboardCache:v3"
const DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000

type DashboardCachePayload = {
  stats: Omit<DashboardStat, "icon">[]
  recentActivities: ActivityItem[]
  docs: AnyDoc[]
  archivedDocs: AnyDoc[]
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
  archivedDocs?: AnyDoc[]
}

type MonthlyActivityPoint = {
  name: string
  value: number
}

type AchievementPoint = {
  name: string
  late: number
  onTime: number
}

type CostPoint = {
  name: string
  cost: number
}

type AnalyticsSummary = {
  totalItems: number
  completed: number
  pending: number
  totalCost: number
  averageCost: number
}

type DashboardAnalyticsResponse = {
  summary?: AnalyticsSummary
  monthlyActivity?: MonthlyActivityPoint[]
  achievementData?: AchievementPoint[]
  costTrend?: CostPoint[]
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
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, isEmployee, isOrganization, loading: authLoading, can } = useAuth()
  const [stats, setStats] = useState<DashboardStat[]>([
    { title: "Total Documents", value: "-", change: "0%", trend: "up", icon: FileText, color: COLORS.blue500, subtitle: "live data" },
    { title: "Active Users", value: "-", change: "0%", trend: "up", icon: Users, color: COLORS.emerald500, subtitle: "live data" },
    { title: "Pending Reviews", value: "-", change: "0%", trend: "down", icon: AlertCircle, color: COLORS.orange500, subtitle: "live data" },
    { title: "Completed Tasks", value: "-", change: "0%", trend: "up", icon: CheckCircle, color: COLORS.green500, subtitle: "live data" },
  ])
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [dashboardDocs, setDashboardDocs] = useState<AnyDoc[]>([])
  const [archivedDocsFromApi, setArchivedDocsFromApi] = useState<AnyDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportStartDate, setExportStartDate] = useState("")
  const [exportEndDate, setExportEndDate] = useState("")
  const [activeQuickAction, setActiveQuickAction] = useState<"create" | "review" | "alerts" | null>(null)
  const [activeDocList, setActiveDocList] = useState<"archived" | "stale" | null>(null)

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
        if (!Array.isArray(parsed.stats) || !Array.isArray(parsed.recentActivities) || !Array.isArray(parsed.docs) || !Array.isArray(parsed.archivedDocs)) return false
        if (cancelled) return true
        setStats(hydrateCachedStats(parsed.stats))
        setRecentActivities(parsed.recentActivities)
        setDashboardDocs(parsed.docs)
        setArchivedDocsFromApi(parsed.archivedDocs)
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
        const archivedDocs = Array.isArray(payload.archivedDocs) ? payload.archivedDocs : []
        const activities = Array.isArray(payload.recentActivities) ? payload.recentActivities : []

        if (cancelled) return
        setStats(nextStats)
        setDashboardDocs(docs)
        setArchivedDocsFromApi(archivedDocs)
        setRecentActivities(activities)
        try {
          const cachePayload: DashboardCachePayload = {
            stats: toSerializableStats(nextStats),
            recentActivities: activities,
            docs,
            archivedDocs,
            cachedAt: Date.now(),
          }
          sessionStorage.setItem(cacheKey, JSON.stringify(cachePayload))
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
  const visibleActivities = recentActivities
  const pendingReviewDocs = useMemo(() => dashboardDocs.filter((doc) => !doc.approved), [dashboardDocs])
  const archivedDocs = archivedDocsFromApi
  const staleDocs = useMemo(
    () =>
      dashboardDocs.filter((doc) => {
        const rawDate = doc.updatedAt || doc.createdAt
        if (!rawDate) return false
        const timestamp = new Date(rawDate).getTime()
        if (Number.isNaN(timestamp)) return false
        return Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000
      }),
    [dashboardDocs]
  )
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
  const createDocumentOptions = useMemo(
    () =>
      [
        { label: "Manual", description: "Create a new manual document", href: "/manual/new", enabled: can(Permission.CREATE_MANUAL) },
        { label: "Policy", description: "Create a new policy", href: "/policies/new", enabled: can(Permission.CREATE_POLICY) },
        { label: "Procedure", description: "Create a new procedure", href: "/procedures/new", enabled: can(Permission.CREATE_PROCEDURE) },
        { label: "Form", description: "Create a new form", href: "/forms/new", enabled: can(Permission.CREATE_FORM) },
        { label: "Certificate", description: "Create a new certificate", href: "/certificate/new", enabled: can(Permission.CREATE_CERTIFICATE) },
        { label: "Audit Schedule", description: "Create a new audit schedule item", href: "/audit-schedule/new", enabled: can(Permission.CREATE_AUDIT_SCHEDULE) },
        { label: "Improvement", description: "Create a new improvement register item", href: "/improvement-register/new", enabled: can(Permission.CREATE_IMPROVEMENT) },
        { label: "Customer Feedback", description: "Capture a new customer feedback record", href: "/customer-feedback/new", enabled: can(Permission.CREATE_CATEGORY) },
      ].filter((option) => option.enabled),
    [can]
  )
  const alertItems = useMemo(() => {
    const items: Array<{ title: string; description: string; action?: "review" | "activity" | "analytics" }> = []
    if (pendingReviewDocs.length > 0) {
      items.push({
        title: `${pendingReviewDocs.length} documents need review`,
        description: "There are documents waiting for approval or follow-up.",
        action: "review",
      })
    }
    if (archivedDocs.length > 0) {
      items.push({
        title: `${archivedDocs.length} archived documents detected`,
        description: "Archived records are present in your dashboard data.",
        action: "analytics",
      })
    }
    if (staleDocs.length > 0) {
      items.push({
        title: `${staleDocs.length} documents are older than 30 days`,
        description: "These documents may need an update or a fresh review.",
        action: "review",
      })
    }
    if (!loading && recentActivities.length === 0) {
      items.push({
        title: "No recent activity found",
        description: "No recent document activity has been recorded yet.",
        action: "activity",
      })
    }
    return items
  }, [archivedDocs.length, loading, pendingReviewDocs.length, recentActivities.length, staleDocs.length])

  const complianceScore = useMemo(() => {
    const total = dashboardDocs.length
    if (total === 0) return 0
    const approved = dashboardDocs.filter((d) => d.approved).length
    return Math.round((approved / total) * 100)
  }, [dashboardDocs])

  const moduleBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    dashboardDocs.forEach((d) => {
      if (d._module) map[d._module] = (map[d._module] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [dashboardDocs])

  const recentDocsGrid = useMemo(() => {
    return [...dashboardDocs]
      .sort((a, b) => {
        const ta = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const tb = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return tb - ta
      })
      .slice(0, 6)
  }, [dashboardDocs])

  const healthMetrics = useMemo(() => {
    const total = dashboardDocs.length
    const approved = dashboardDocs.filter((d) => d.approved).length
    const pct = total > 0 ? Math.round((approved / total) * 100) : 0
    const modules = new Set(dashboardDocs.map((d) => d._module).filter(Boolean)).size
    return { pct, modules, activityCount: recentActivities.length, pending: pendingReviewDocs.length }
  }, [dashboardDocs, recentActivities.length, pendingReviewDocs.length])

  const moduleBarColors = [
    "linear-gradient(90deg,#7c3aed,#a855f7)",
    "linear-gradient(90deg,#059669,#10b981)",
    "linear-gradient(90deg,#2563eb,#3b82f6)",
    "linear-gradient(90deg,#ea580c,#f97316)",
    "linear-gradient(90deg,#db2777,#f472b6)",
    "linear-gradient(90deg,#0891b2,#22d3ee)",
  ]

  const getDocumentHref = (doc: AnyDoc) => {
    if (!doc._id) return "/dashboard/analytics"
    if (doc._module === "manual") return `/manual/${doc._id}`
    if (doc._module) return `/${doc._module}/${doc._id}`
    return "/dashboard/analytics"
  }

  const handleOpenDocument = (doc: AnyDoc) => {
    setActiveQuickAction(null)
    router.push(getDocumentHref(doc))
  }

  const handleOpenCreateOption = (href: string) => {
    setActiveQuickAction(null)
    router.push(href)
  }

  const handleAlertAction = (action?: "review" | "activity" | "analytics") => {
    if (action === "review") {
      setActiveQuickAction("review")
      return
    }
    setActiveQuickAction(null)
    if (action === "analytics") {
      router.push("/dashboard/analytics")
      return
    }
    if (action === "activity") {
      const recentActivitySection = document.getElementById("dashboard-recent-activity")
      recentActivitySection?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

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
      const margin = 36
      const contentWidth = pageWidth - margin * 2
      const footerHeight = 26
      const sectionGap = 18
      let y = margin
      const startDate = new Date(`${exportStartDate}T00:00:00`)
      const endDate = new Date(`${exportEndDate}T23:59:59.999`)
      const token = localStorage.getItem("token")
      const analyticsQuery = new URLSearchParams({ startDate: exportStartDate, endDate: exportEndDate })
      const analyticsResponse = await fetch(`/api/analytics?${analyticsQuery.toString()}`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!analyticsResponse.ok) {
        throw new Error("Failed to fetch analytics data for PDF")
      }
      const analyticsPayload = (await analyticsResponse.json()) as DashboardAnalyticsResponse
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
      const sortedDocs = [...filteredDocs].sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return bDate - aDate
      })
      const sortedActivities = [...filteredActivities].sort((a, b) => {
        const aDate = new Date(a.dateValue || 0).getTime()
        const bDate = new Date(b.dateValue || 0).getTime()
        return bDate - aDate
      })

      const toRgb = (hex: string) => {
        const normalized = hex.replace("#", "")
        const value = normalized.length === 3
          ? normalized.split("").map((char) => char + char).join("")
          : normalized
        const num = Number.parseInt(value, 16)
        return [
          (num >> 16) & 255,
          (num >> 8) & 255,
          num & 255,
        ] as const
      }

      const palette = {
        ink: toRgb(COLORS.textPrimary),
        muted: toRgb(COLORS.textSecondary),
        lightText: toRgb(COLORS.textLight),
        border: toRgb(COLORS.border),
        panel: toRgb(COLORS.gray50),
        panelAlt: toRgb(COLORS.indigo50),
        brand: toRgb(COLORS.indigo600),
        brandDark: toRgb(COLORS.indigo800),
        brandSoft: toRgb(COLORS.indigo100),
        success: toRgb(COLORS.green600),
        successSoft: toRgb(COLORS.green100),
        warning: toRgb(COLORS.orange600),
        warningSoft: toRgb(COLORS.orange100),
        danger: toRgb(COLORS.danger),
        dangerSoft: toRgb(COLORS.pink100),
      }

      const approvedDocs = sortedDocs.filter((item) => Boolean(item.approved)).length
      const archivedDocs = sortedDocs.filter((item) => Boolean(item.archived || item.isArchived)).length
      const pendingDocs = Math.max(sortedDocs.length - approvedDocs, 0)
      const activeDocs = Math.max(sortedDocs.length - archivedDocs, 0)
      const completionRate = sortedDocs.length > 0 ? Math.round((approvedDocs / sortedDocs.length) * 100) : 0
      const contributingUsers = new Set(sortedActivities.map((item) => item.user).filter(Boolean)).size
      const activeUsersValue = stats.find((stat) => stat.title === "Active Users")?.value || "-"
      const reportGeneratedAt = new Date()
      const analyticsSummary = analyticsPayload.summary || {
        totalItems: 0,
        completed: 0,
        pending: 0,
        totalCost: 0,
        averageCost: 0,
      }
      const monthlyActivity = Array.isArray(analyticsPayload.monthlyActivity) ? analyticsPayload.monthlyActivity : []
      const achievementData = Array.isArray(analyticsPayload.achievementData) ? analyticsPayload.achievementData : []
      const costTrend = Array.isArray(analyticsPayload.costTrend) ? analyticsPayload.costTrend : []
      const groupedDocs = (() => {
        const groups = new Map<string, AnyDoc[]>()
        sortedDocs.forEach((doc) => {
          const key = doc._module || "other"
          const existing = groups.get(key) || []
          existing.push(doc)
          groups.set(key, existing)
        })

        const orderedKeys = [
          ...PDF_MODULE_ORDER.filter((key) => groups.has(key)),
          ...Array.from(groups.keys()).filter((key) => !PDF_MODULE_ORDER.includes(key as typeof PDF_MODULE_ORDER[number])),
        ]

        return orderedKeys.map((key) => ({
          key,
          label: PDF_MODULE_LABELS[key] || key,
          items: groups.get(key) || [],
        }))
      })()

      const formatDate = (value?: string, includeTime = false) => {
        if (!value) return "-"
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return "-"
        return includeTime
          ? date.toLocaleString([], {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : date.toLocaleDateString([], {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
      }

      const formatMonthYear = (value?: string) => {
        if (!value) return "Selected Date Range"
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return "Selected Date Range"
        return date.toLocaleDateString([], { month: "short", year: "numeric" })
      }

      const setFill = (rgb: readonly [number, number, number]) => doc.setFillColor(rgb[0], rgb[1], rgb[2])
      const setStroke = (rgb: readonly [number, number, number]) => doc.setDrawColor(rgb[0], rgb[1], rgb[2])
      const setText = (rgb: readonly [number, number, number]) => doc.setTextColor(rgb[0], rgb[1], rgb[2])

      const getDocumentStatus = (item: AnyDoc) => {
        if (item.archived || item.isArchived) {
          return { label: "Archived", text: palette.warning, fill: palette.warningSoft }
        }
        if (item.approved) {
          return { label: "Approved", text: palette.success, fill: palette.successSoft }
        }
        return { label: "Pending Review", text: palette.danger, fill: palette.dangerSoft }
      }

      const truncateText = (text: string, maxWidth: number, fontSize = 10, fontStyle: "normal" | "bold" = "normal") => {
        doc.setFont("helvetica", fontStyle)
        doc.setFontSize(fontSize)
        if (doc.getTextWidth(text) <= maxWidth) return text
        let output = text
        while (output.length > 0 && doc.getTextWidth(`${output}...`) > maxWidth) {
          output = output.slice(0, -1)
        }
        return output ? `${output}...` : "..."
      }

      const drawDivider = () => {
        setStroke(palette.border)
        doc.setLineWidth(1)
        doc.line(margin, y, pageWidth - margin, y)
        y += 16
      }

      const drawPageHeader = (label: string) => {
        setText(palette.brandDark)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("Business Smart Suite", margin, y)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        setText(palette.muted)
        doc.text(label, pageWidth - margin, y, { align: "right" })
        y += 12
        drawDivider()
      }

      const ensurePageSpace = (heightNeeded = 24, nextPageLabel = "Dashboard Report") => {
        if (y + heightNeeded <= pageHeight - margin - footerHeight) return
        doc.addPage()
        y = margin
        drawPageHeader(nextPageLabel)
      }

      const writeWrappedText = (
        text: string,
        size = 10,
        color: readonly [number, number, number] = palette.muted,
        width = contentWidth,
        x = margin
      ) => {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(size)
        setText(color)
        const lineHeight = size + 5
        const lines = doc.splitTextToSize(text, width)
        ensurePageSpace(lines.length * lineHeight)
        doc.text(lines, x, y)
        y += lines.length * lineHeight
      }

      const writeSectionTitle = (text: string, subtitle?: string) => {
        ensurePageSpace(48, text)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(17)
        setText(palette.ink)
        doc.text(text, margin, y)
        y += 20
        if (subtitle) {
          writeWrappedText(subtitle, 10, palette.muted)
        }
        y += 6
      }

      const metricCards = [
        {
          title: "Reports In Range",
          value: String(sortedDocs.length),
          caption: "Records updated in the selected period",
          fill: palette.brandSoft,
          text: palette.brandDark,
        },
        {
          title: "Approved Items",
          value: String(approvedDocs),
          caption: `${completionRate}% approval rate`,
          fill: palette.successSoft,
          text: palette.success,
        },
        {
          title: "Pending Review",
          value: String(pendingDocs),
          caption: "Items still awaiting sign-off",
          fill: palette.dangerSoft,
          text: palette.danger,
        },
        {
          title: "Active Users",
          value: String(activeUsersValue),
          caption: `${contributingUsers} contributors in this date range`,
          fill: palette.warningSoft,
          text: palette.warning,
        },
      ]

      const drawMetricCards = () => {
        const cardGap = 14
        const cardWidth = (contentWidth - cardGap) / 2
        const cardHeight = 74
        metricCards.forEach((card, index) => {
          const column = index % 2
          if (column === 0) {
            ensurePageSpace(cardHeight + 10, "Summary")
          }
          const row = Math.floor(index / 2)
          const x = margin + column * (cardWidth + cardGap)
          const cardY = y + row * (cardHeight + cardGap)
          setFill(card.fill)
          doc.roundedRect(x, cardY, cardWidth, cardHeight, 12, 12, "F")
          doc.setFont("helvetica", "bold")
          doc.setFontSize(11)
          setText(card.text)
          doc.text(card.title, x + 16, cardY + 20)
          doc.setFontSize(22)
          doc.text(card.value, x + 16, cardY + 46)
          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          setText(palette.muted)
          const captionLines = doc.splitTextToSize(card.caption, cardWidth - 32)
          doc.text(captionLines, x + 16, cardY + 62)
        })
        y += Math.ceil(metricCards.length / 2) * (cardHeight + cardGap)
      }

      const drawHighlightsBox = () => {
        ensurePageSpace(122, "Executive Summary")
        setFill(palette.panel)
        setStroke(palette.border)
        doc.roundedRect(margin, y, contentWidth, 112, 14, 14, "FD")
        const boxTop = y + 22
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        setText(palette.ink)
        doc.text("Executive Summary", margin + 18, boxTop)

        y += 40
        writeWrappedText(
          `This report presents ${sortedDocs.length} reports and ${sortedActivities.length} logged activities for ${dashboardScopeLabel.toLowerCase()} between ${formatDate(exportStartDate)} and ${formatDate(exportEndDate)}. It is formatted for client and management sharing, with emphasis on status visibility, activity tracking, and document readiness.`,
          10,
          palette.muted,
          contentWidth - 36,
          margin + 18
        )

        const bullets = [
          `${activeDocs} active records and ${archivedDocs} archived records are included in this reporting period.`,
          `${approvedDocs} reports are approved, while ${pendingDocs} still need attention or review.`,
          `${sortedActivities.length} dated activities were captured across ${contributingUsers || 0} contributing users.`,
        ]

        bullets.forEach((bullet) => {
          setFill(palette.brand)
          doc.circle(margin + 22, y - 3, 2.2, "F")
          writeWrappedText(bullet, 10, palette.muted, contentWidth - 52, margin + 32)
        })

        y += 10
      }

      const drawCoverHeader = () => {
        const headerHeight = 128
        setFill(palette.brandDark)
        doc.roundedRect(margin, y, contentWidth, headerHeight, 18, 18, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(24)
        setText(toRgb(COLORS.textWhite))
        doc.text("Business Smart Suite", margin + 24, y + 34)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.text("Dashboard Report", margin + 24, y + 54)
        doc.text(`${dashboardScopeLabel} | ${formatDate(exportStartDate)} - ${formatDate(exportEndDate)}`, margin + 24, y + 72)
        doc.text(`Prepared for: ${user?.name || "Unknown User"}`, margin + 24, y + 90)
        doc.text(`Generated on: ${formatDate(reportGeneratedAt.toISOString(), true)}`, margin + 24, y + 108)
        y += headerHeight + 24
      }

      const drawDocumentsTable = () => {
        writeSectionTitle("Document Register", "Detailed list of all reports/documents in the selected reporting window.")
        if (sortedDocs.length === 0) {
          writeWrappedText("No reports or documents were updated in the selected date range.")
          return
        }

        const colIndex = 28
        const colTitle = 250
        const colStatus = 110
        const colDate = contentWidth - colIndex - colTitle - colStatus
        const rowHeight = 28

        const drawHeaderRow = () => {
          ensurePageSpace(34, "Document Register")
          setFill(palette.panelAlt)
          doc.roundedRect(margin, y, contentWidth, rowHeight, 8, 8, "F")
          doc.setFont("helvetica", "bold")
          doc.setFontSize(10)
          setText(palette.brandDark)
          doc.text("#", margin + 10, y + 18)
          doc.text("Report / Document", margin + colIndex + 8, y + 18)
          doc.text("Status", margin + colIndex + colTitle + 8, y + 18)
          doc.text("Last Updated", margin + colIndex + colTitle + colStatus + 8, y + 18)
          y += rowHeight + 8
        }

        let overallIndex = 1
        groupedDocs.forEach((group, groupIndex) => {
          ensurePageSpace(30, "Document Register")
          if (groupIndex > 0) y += 6

          setFill(palette.brandSoft)
          doc.roundedRect(margin, y, contentWidth, 22, 8, 8, "F")
          doc.setFont("helvetica", "bold")
          doc.setFontSize(11)
          setText(palette.brandDark)
          doc.text(`${group.label} (${group.items.length})`, margin + 12, y + 15)
          y += 30

          drawHeaderRow()
          group.items.forEach((item, index) => {
            ensurePageSpace(rowHeight + 8, "Document Register")
            if (y + rowHeight > pageHeight - margin - footerHeight) {
              doc.addPage()
              y = margin
              drawPageHeader("Document Register")
              setFill(palette.brandSoft)
              doc.roundedRect(margin, y, contentWidth, 22, 8, 8, "F")
              doc.setFont("helvetica", "bold")
              doc.setFontSize(11)
              setText(palette.brandDark)
              doc.text(`${group.label} (${group.items.length})`, margin + 12, y + 15)
              y += 30
              drawHeaderRow()
            }

            const rowFill = index % 2 === 0 ? palette.panel : toRgb(COLORS.bgWhite)
            setFill(rowFill)
            setStroke(palette.border)
            doc.roundedRect(margin, y, contentWidth, rowHeight, 8, 8, "FD")

            const status = getDocumentStatus(item)
            const itemTitle = truncateText(item.title || "Untitled document", colTitle - 18, 10, "bold")
            doc.setFont("helvetica", "normal")
            doc.setFontSize(10)
            setText(palette.muted)
            doc.text(String(overallIndex), margin + 10, y + 18)
            doc.setFont("helvetica", "bold")
            setText(palette.ink)
            doc.text(itemTitle, margin + colIndex + 8, y + 18)

            const chipWidth = Math.min(Math.max(doc.getTextWidth(status.label) + 18, 70), colStatus - 12)
            setFill(status.fill)
            doc.roundedRect(margin + colIndex + colTitle + 8, y + 7, chipWidth, 14, 7, 7, "F")
            doc.setFont("helvetica", "bold")
            doc.setFontSize(8)
            setText(status.text)
            doc.text(status.label, margin + colIndex + colTitle + 17, y + 17)

            doc.setFont("helvetica", "normal")
            doc.setFontSize(9)
            setText(palette.muted)
            doc.text(
              truncateText(formatDate(item.updatedAt || item.createdAt), colDate - 12, 9),
              margin + colIndex + colTitle + colStatus + 8,
              y + 18
            )
            y += rowHeight + 8
            overallIndex += 1
          })
        })
      }

      const drawMiniBarChart = (
        title: string,
        subtitle: string,
        points: Array<{ name: string; value: number }>,
        color: readonly [number, number, number]
      ) => {
        const boxHeight = 190
        ensurePageSpace(boxHeight + 12, title)
        setFill(palette.panel)
        setStroke(palette.border)
        doc.roundedRect(margin, y, contentWidth, boxHeight, 12, 12, "FD")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        setText(palette.ink)
        doc.text(title, margin + 16, y + 22)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        setText(palette.muted)
        doc.text(subtitle, margin + 16, y + 38)

        const chartTop = y + 56
        const chartHeight = 92
        const chartBottom = chartTop + chartHeight
        const chartLeft = margin + 16
        const chartWidth = contentWidth - 32
        const chartRight = chartLeft + chartWidth
        const safePoints = points.length > 0 ? points : [{ name: "No Data", value: 0 }]
        const maxValue = Math.max(...safePoints.map((point) => point.value), 1)
        const barGap = 8
        const barWidth = Math.max((chartWidth - barGap * (safePoints.length - 1)) / safePoints.length, 12)

        setStroke(palette.border)
        doc.line(chartLeft, chartBottom, chartRight, chartBottom)
        doc.line(chartLeft, chartTop, chartLeft, chartBottom)

        safePoints.forEach((point, index) => {
          const barHeight = maxValue === 0 ? 0 : (point.value / maxValue) * (chartHeight - 8)
          const x = chartLeft + index * (barWidth + barGap)
          const barY = chartBottom - barHeight
          setFill(color)
          doc.roundedRect(x, barY, Math.max(barWidth - 2, 8), Math.max(barHeight, 3), 4, 4, "F")
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          setText(palette.muted)
          doc.text(truncateText(point.name, barWidth + 8, 8), x + barWidth / 2, chartBottom + 12, { align: "center" })
          doc.setFontSize(8)
          setText(palette.ink)
          doc.text(String(point.value), x + barWidth / 2, barY - 4, { align: "center" })
        })

        y += boxHeight + 12
      }

      const drawGroupedBarChart = (
        title: string,
        subtitle: string,
        points: Array<{ name: string; first: number; second: number }>,
        firstLabel: string,
        secondLabel: string,
        firstColor: readonly [number, number, number],
        secondColor: readonly [number, number, number]
      ) => {
        const boxHeight = 220
        ensurePageSpace(boxHeight + 12, title)
        setFill(palette.panel)
        setStroke(palette.border)
        doc.roundedRect(margin, y, contentWidth, boxHeight, 12, 12, "FD")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        setText(palette.ink)
        doc.text(title, margin + 16, y + 22)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        setText(palette.muted)
        doc.text(subtitle, margin + 16, y + 38)

        const chartTop = y + 58
        const chartHeight = 96
        const chartBottom = chartTop + chartHeight
        const chartLeft = margin + 16
        const chartWidth = contentWidth - 32
        const chartRight = chartLeft + chartWidth
        const safePoints = points.length > 0 ? points : [{ name: "No Data", first: 0, second: 0 }]
        const maxValue = Math.max(...safePoints.flatMap((point) => [point.first, point.second]), 1)
        const groupGap = 10
        const groupWidth = Math.max((chartWidth - groupGap * (safePoints.length - 1)) / safePoints.length, 18)
        const singleBarWidth = Math.max((groupWidth - 6) / 2, 7)

        setStroke(palette.border)
        doc.line(chartLeft, chartBottom, chartRight, chartBottom)
        doc.line(chartLeft, chartTop, chartLeft, chartBottom)

        safePoints.forEach((point, index) => {
          const groupX = chartLeft + index * (groupWidth + groupGap)
          const firstBarHeight = maxValue === 0 ? 0 : (point.first / maxValue) * (chartHeight - 10)
          const secondBarHeight = maxValue === 0 ? 0 : (point.second / maxValue) * (chartHeight - 10)
          const firstX = groupX
          const secondX = groupX + singleBarWidth + 6

          setFill(firstColor)
          doc.roundedRect(firstX, chartBottom - firstBarHeight, singleBarWidth, Math.max(firstBarHeight, 3), 3, 3, "F")
          setFill(secondColor)
          doc.roundedRect(secondX, chartBottom - secondBarHeight, singleBarWidth, Math.max(secondBarHeight, 3), 3, 3, "F")

          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          setText(palette.muted)
          doc.text(truncateText(point.name, groupWidth + 8, 8), groupX + groupWidth / 2, chartBottom + 12, { align: "center" })
        })

        const legendY = y + boxHeight - 22
        setFill(firstColor)
        doc.roundedRect(margin + 16, legendY - 7, 10, 10, 2, 2, "F")
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        setText(palette.muted)
        doc.text(firstLabel, margin + 32, legendY + 1)

        setFill(secondColor)
        doc.roundedRect(margin + 110, legendY - 7, 10, 10, 2, 2, "F")
        doc.text(secondLabel, margin + 126, legendY + 1)

        y += boxHeight + 12
      }

      const drawAnalyticsDashboard = () => {
        writeSectionTitle("Analytics Dashboard", "Same analytics view used in the analytics page for the selected date range.")

        const analyticsCards = [
          { label: "Total Items", value: String(analyticsSummary.totalItems), fill: palette.brandSoft, text: palette.brandDark },
          { label: "Completed", value: String(analyticsSummary.completed), fill: palette.successSoft, text: palette.success },
          { label: "Pending", value: String(analyticsSummary.pending), fill: palette.warningSoft, text: palette.warning },
          { label: "Average Cost", value: `£${analyticsSummary.averageCost.toFixed(2)}`, fill: palette.panelAlt, text: palette.brandDark },
        ]

        const cardGap = 12
        const cardWidth = (contentWidth - cardGap) / 2
        const cardHeight = 66
        analyticsCards.forEach((card, index) => {
          if (index % 2 === 0) ensurePageSpace(cardHeight + 12, "Analytics Dashboard")
          const col = index % 2
          const row = Math.floor(index / 2)
          const x = margin + col * (cardWidth + cardGap)
          const cardY = y + row * (cardHeight + cardGap)
          setFill(card.fill)
          doc.roundedRect(x, cardY, cardWidth, cardHeight, 10, 10, "F")
          doc.setFont("helvetica", "bold")
          doc.setFontSize(10)
          setText(card.text)
          doc.text(card.label, x + 14, cardY + 20)
          doc.setFontSize(20)
          doc.text(card.value, x + 14, cardY + 45)
        })
        y += Math.ceil(analyticsCards.length / 2) * (cardHeight + cardGap) + 4

        drawMiniBarChart(
          "Monthly Document Activity",
          "Count by month",
          monthlyActivity.map((point) => ({ name: point.name, value: point.value })),
          palette.brand
        )

        drawGroupedBarChart(
          "Areas and Achievement Rate",
          "Late versus on-time items by area, matching the analytics page.",
          achievementData.map((entry) => ({
            name: entry.name,
            first: entry.late,
            second: entry.onTime,
          })),
          "Late",
          "On Time",
          palette.danger,
          palette.brand
        )

        drawGroupedBarChart(
          "Completed vs Pending",
          "Separate graph for completion status in the selected date range.",
          [
            { name: "Status", first: analyticsSummary.completed, second: analyticsSummary.pending },
          ],
          "Completed",
          "Pending",
          palette.success,
          palette.warning
        )

        y += sectionGap
        drawMiniBarChart(
          `Cost of Quality (${formatMonthYear(exportStartDate)} - ${formatMonthYear(exportEndDate)})`,
          `Total Cost: £${analyticsSummary.totalCost.toFixed(2)} | Average Cost: £${analyticsSummary.averageCost.toFixed(2)}`,
          costTrend.map((point) => ({ name: point.name, value: point.cost })),
          palette.success
        )
      }

      const drawActivityTable = () => {
        y += sectionGap
        writeSectionTitle("Activity Log", "Recent dated actions captured within the selected reporting period.")
        if (sortedActivities.length === 0) {
          writeWrappedText("No recent activity was recorded in the selected date range.")
          return
        }

        const colDate = 96
        const colUser = 105
        const colAction = 132
        const colItem = contentWidth - colDate - colUser - colAction
        const rowHeight = 30

        const drawHeaderRow = () => {
          ensurePageSpace(36, "Activity Log")
          setFill(palette.panelAlt)
          doc.roundedRect(margin, y, contentWidth, rowHeight, 8, 8, "F")
          doc.setFont("helvetica", "bold")
          doc.setFontSize(10)
          setText(palette.brandDark)
          doc.text("Date", margin + 8, y + 19)
          doc.text("User", margin + colDate + 8, y + 19)
          doc.text("Action", margin + colDate + colUser + 8, y + 19)
          doc.text("Item", margin + colDate + colUser + colAction + 8, y + 19)
          y += rowHeight + 8
        }

        drawHeaderRow()
        sortedActivities.forEach((activity, index) => {
          ensurePageSpace(rowHeight + 8, "Activity Log")
          if (y + rowHeight > pageHeight - margin - footerHeight) {
            doc.addPage()
            y = margin
            drawPageHeader("Activity Log")
            drawHeaderRow()
          }

          const rowFill = index % 2 === 0 ? palette.panel : toRgb(COLORS.bgWhite)
          setFill(rowFill)
          setStroke(palette.border)
          doc.roundedRect(margin, y, contentWidth, rowHeight, 8, 8, "FD")

          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          setText(palette.muted)
          doc.text(truncateText(formatDate(activity.dateValue), colDate - 12, 9), margin + 8, y + 19)
          doc.text(truncateText(activity.user || "-", colUser - 12, 9), margin + colDate + 8, y + 19)

          doc.setFont("helvetica", "bold")
          setText(palette.ink)
          doc.text(truncateText(activity.action || "-", colAction - 12, 9, "bold"), margin + colDate + colUser + 8, y + 19)

          doc.setFont("helvetica", "normal")
          setText(palette.muted)
          doc.text(
            truncateText(activity.item || "-", colItem - 12, 9),
            margin + colDate + colUser + colAction + 8,
            y + 19
          )
          y += rowHeight + 8
        })
      }

      drawCoverHeader()
      writeSectionTitle("Key Metrics", "A concise overview of dashboard performance across the selected reporting period.")
      drawMetricCards()
      y += 10
      drawHighlightsBox()

      doc.addPage()
      y = margin
      drawPageHeader("Analytics Dashboard")
      drawAnalyticsDashboard()
      y += sectionGap
      drawDocumentsTable()
      drawActivityTable()

      const totalPages = doc.getNumberOfPages()
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        doc.setPage(pageNumber)
        setStroke(palette.border)
        doc.setLineWidth(1)
        doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        setText(palette.lightText)
        doc.text("Confidential management report", margin, pageHeight - 10)
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" })
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
            {/* Back to home + title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link href="/dashboard">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-gray-50"
                  style={{ borderColor: COLORS.border, color: COLORS.primary, background: COLORS.bgWhite }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </button>
              </Link>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
                  Analytics
                </p>
                <h1 className="text-2xl font-black" style={{ color: COLORS.textPrimary }}>
                  Dashboard
                </h1>
              </div>
            </div>

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

            {/* Compliance score + Module breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden border"
                style={{
                  background: "linear-gradient(135deg,#1a0533 0%,#3b0764 60%,#341746 100%)",
                  borderColor: "rgba(124,58,237,0.35)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.25)",
                }}
              >
                <div className="relative w-36 h-36 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#dashComplianceGrad)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(complianceScore / 100) * 339.3} 339.3`}
                    />
                    <defs>
                      <linearGradient id="dashComplianceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-3xl font-black">{loading ? "—" : `${complianceScore}%`}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Compliance</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-black text-white">ISO compliance score</h3>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Approved documents vs active records across all modules.
                  </p>
                  <p className="text-xs mt-3 font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {dashboardDocs.filter((d) => d.approved).length} approved · {dashboardDocs.length} total active
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl p-5 border"
                style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                    Module breakdown
                  </h3>
                  <span className="text-xs font-semibold" style={{ color: COLORS.textSecondary }}>
                    {moduleBreakdown.length} modules
                  </span>
                </div>
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {moduleBreakdown.length === 0 ? (
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      {loading ? "Loading…" : "No module data yet."}
                    </p>
                  ) : (
                    moduleBreakdown.map(([key, count], i) => {
                      const max = moduleBreakdown[0]?.[1] || 1
                      const pct = Math.round((count / max) * 100)
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span style={{ color: COLORS.textPrimary }}>{PDF_MODULE_LABELS[key] || key}</span>
                            <span style={{ color: COLORS.textSecondary }}>{count}</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: COLORS.bgGray }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background: moduleBarColors[i % moduleBarColors.length],
                              }}
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* System health */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Activity,
                  label: "Live activity",
                  value: loading ? "—" : `${healthMetrics.activityCount} events`,
                  sub: healthMetrics.activityCount > 0 ? "Recent" : "None yet",
                  gradient: "linear-gradient(135deg,#059669,#10b981)",
                },
                {
                  icon: Zap,
                  label: "Active modules",
                  value: loading ? "—" : `${healthMetrics.modules}`,
                  sub: "In use",
                  gradient: "linear-gradient(135deg,#2563eb,#3b82f6)",
                },
                {
                  icon: AlertCircle,
                  label: "Pending reviews",
                  value: loading ? "—" : `${healthMetrics.pending}`,
                  sub: healthMetrics.pending > 0 ? "Needs attention" : "All clear",
                  gradient:
                    healthMetrics.pending > 0
                      ? "linear-gradient(135deg,#ea580c,#f97316)"
                      : "linear-gradient(135deg,#64748b,#94a3b8)",
                },
                {
                  icon: ShieldCheck,
                  label: "Compliance rate",
                  value: loading ? "—" : `${healthMetrics.pct}%`,
                  sub: healthMetrics.pct >= 80 ? "Strong" : healthMetrics.pct >= 50 ? "Monitor" : "Review",
                  gradient: "linear-gradient(135deg,#7c3aed,#a855f7)",
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl p-4 text-white relative overflow-hidden"
                    style={{ background: item.gradient, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
                  >
                    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20 bg-white" />
                    <Icon className="w-5 h-5 mb-3 opacity-90 relative z-10" />
                    <p className="text-xs font-bold uppercase tracking-wide opacity-80 relative z-10">{item.label}</p>
                    <p className="text-xl font-black mt-1 relative z-10">{item.value}</p>
                    <p className="text-[11px] opacity-75 mt-0.5 relative z-10">{item.sub}</p>
                  </div>
                )
              })}
            </div>

            {/* Document status + Recent documents */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 space-y-4">
                {[
                  {
                    label: "Total documents",
                    value: dashboardDocs.length,
                    sub: "Active records",
                    gradient: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  },
                  {
                    label: "Pending review",
                    value: pendingReviewDocs.length,
                    sub: "Awaiting sign-off",
                    gradient: "linear-gradient(135deg,#ea580c,#f97316)",
                  },
                  {
                    label: "Archived",
                    value: archivedDocs.length,
                    sub: "Stored records",
                    gradient: "linear-gradient(135deg,#475569,#64748b)",
                    onClick: () => setActiveDocList("archived"),
                  },
                  {
                    label: "Stale (30+ days)",
                    value: staleDocs.length,
                    sub: "May need refresh",
                    gradient: "linear-gradient(135deg,#2563eb,#3b82f6)",
                    onClick: () => setActiveDocList("stale"),
                  },
                ].map((card) => {
                  const inner = (
                    <>
                      <div className="text-3xl font-black text-white min-w-[2.5rem] text-center">
                        {loading ? "—" : card.value}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{card.label}</div>
                        <div className="text-xs text-white opacity-60">{card.sub}</div>
                      </div>
                    </>
                  )
                  const className = `w-full text-left rounded-2xl px-5 py-4 flex items-center gap-4 transition-transform ${
                    card.onClick ? "hover:scale-[1.02] cursor-pointer" : "cursor-default"
                  }`
                  const style = {
                    background: card.gradient,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    opacity: card.onClick || card.value > 0 ? 1 : 0.85,
                  }
                  return card.onClick ? (
                    <button key={card.label} type="button" onClick={card.onClick} className={className} style={style}>
                      {inner}
                    </button>
                  ) : (
                    <div key={card.label} className={className} style={style}>
                      {inner}
                    </div>
                  )
                })}
              </div>

              <div
                className="xl:col-span-2 rounded-2xl p-6 border"
                style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.textPrimary }}>
                  Recent documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentDocsGrid.length === 0 ? (
                    <p className="text-sm col-span-2" style={{ color: COLORS.textSecondary }}>
                      {loading ? "Loading…" : "No documents yet."}
                    </p>
                  ) : (
                    recentDocsGrid.map((doc) => (
                      <button
                        key={doc._id}
                        type="button"
                        onClick={() => router.push(getDocumentHref(doc))}
                        className="text-left p-4 rounded-xl border transition-all hover:shadow-md"
                        style={{ borderColor: COLORS.border, background: COLORS.bgGrayLight }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                          >
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm truncate" style={{ color: COLORS.textPrimary }}>
                              {doc.title || "Untitled"}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
                              {PDF_MODULE_LABELS[doc._module || ""] || doc._module || "—"} ·{" "}
                              {formatTimeAgo(doc.updatedAt || doc.createdAt)}
                            </p>
                            <span
                              className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: doc.approved ? `${COLORS.green500}22` : `${COLORS.orange500}22`,
                                color: doc.approved ? COLORS.green600 : COLORS.orange700,
                              }}
                            >
                              {doc.approved ? "Approved" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div
                id="dashboard-recent-activity"
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
                </div>
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
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
                    onClick={() => setActiveQuickAction("create")}
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
                    onClick={() => setActiveQuickAction("review")}
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
                    onClick={() => setActiveQuickAction("alerts")}
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

            {activeQuickAction ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(15, 23, 42, 0.45)" }}
                onClick={() => setActiveQuickAction(null)}
              >
                <div
                  className="w-full max-w-3xl rounded-2xl border shadow-2xl"
                  style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div
                    className="flex items-center justify-between px-6 py-5 border-b"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
                        {activeQuickAction === "create"
                          ? "Create Document"
                          : activeQuickAction === "review"
                            ? "Review Tasks"
                            : "View Alerts"}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                        {activeQuickAction === "create"
                          ? "Choose where you want to create a new document."
                          : activeQuickAction === "review"
                            ? "Open pending documents that need your attention."
                            : "Review key dashboard alerts and follow-up actions."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveQuickAction(null)}
                      className="px-4 py-2 rounded-lg font-semibold"
                      style={{ background: COLORS.bgGray, color: COLORS.textPrimary }}
                    >
                      Close
                    </button>
                  </div>

                  <div className="p-6">
                    {activeQuickAction === "create" ? (
                      createDocumentOptions.length === 0 ? (
                        <div className="p-5 rounded-xl" style={{ background: COLORS.bgGray }}>
                          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                            You do not currently have permission to create documents from the dashboard.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {createDocumentOptions.map((option) => (
                            <button
                              key={option.href}
                              type="button"
                              onClick={() => handleOpenCreateOption(option.href)}
                              className="text-left p-5 rounded-xl border transition-all hover:shadow-md"
                              style={{ borderColor: COLORS.border, background: COLORS.bgGrayLight }}
                            >
                              <h4 className="text-lg font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                                {option.label}
                              </h4>
                              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                                {option.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      )
                    ) : null}

                    {activeQuickAction === "review" ? (
                      pendingReviewDocs.length === 0 ? (
                        <div className="p-5 rounded-xl" style={{ background: COLORS.bgGray }}>
                          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                            No pending review tasks were found in the current dashboard data.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                          {pendingReviewDocs.map((doc) => (
                            <button
                              key={doc._id}
                              type="button"
                              onClick={() => handleOpenDocument(doc)}
                              className="w-full text-left p-4 rounded-xl border transition-all hover:shadow-md"
                              style={{ borderColor: COLORS.border, background: COLORS.bgGrayLight }}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-base font-bold" style={{ color: COLORS.textPrimary }}>
                                    {doc.title || "Untitled Document"}
                                  </p>
                                  <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                                    {PDF_MODULE_LABELS[doc._module || ""] || "Document"} • Last updated {formatTimeAgo(doc.updatedAt || doc.createdAt)}
                                  </p>
                                </div>
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-bold"
                                  style={{ background: COLORS.orange100, color: COLORS.orange700 }}
                                >
                                  Pending
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )
                    ) : null}

                    {activeQuickAction === "alerts" ? (
                      alertItems.length === 0 ? (
                        <div className="p-5 rounded-xl" style={{ background: COLORS.bgGray }}>
                          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                            No alerts right now. Your dashboard looks healthy.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {alertItems.map((item, index) => (
                            <div
                              key={`${item.title}-${index}`}
                              className="p-5 rounded-xl border"
                              style={{ borderColor: COLORS.border, background: COLORS.bgGrayLight }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-base font-bold" style={{ color: COLORS.textPrimary }}>
                                    {item.title}
                                  </p>
                                  <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                                    {item.description}
                                  </p>
                                </div>
                                {item.action ? (
                                  <button
                                    type="button"
                                    onClick={() => handleAlertAction(item.action)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                                    style={{ background: COLORS.primary, color: COLORS.textWhite }}
                                  >
                                    Open
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {activeDocList ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(15, 23, 42, 0.5)" }}
                onClick={() => setActiveDocList(null)}
              >
                <div
                  className="w-full max-w-lg rounded-2xl border shadow-2xl max-h-[85vh] flex flex-col"
                  style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="flex items-center justify-between px-5 py-4 text-white rounded-t-2xl"
                    style={{
                      background:
                        activeDocList === "archived"
                          ? "linear-gradient(135deg,#475569,#64748b)"
                          : "linear-gradient(135deg,#2563eb,#3b82f6)",
                    }}
                  >
                    <h3 className="text-lg font-bold">
                      {activeDocList === "archived" ? "Archived documents" : "Stale documents (30+ days)"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveDocList(null)}
                      className="px-3 py-1 rounded-lg text-sm font-semibold bg-white/20 hover:bg-white/30"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1 space-y-2">
                    {(activeDocList === "archived" ? archivedDocs : staleDocs).length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: COLORS.textSecondary }}>
                        No documents in this list.
                      </p>
                    ) : (
                      (activeDocList === "archived" ? archivedDocs : staleDocs).map((doc) => (
                        <button
                          key={doc._id}
                          type="button"
                          onClick={() => {
                            setActiveDocList(null)
                            router.push(getDocumentHref(doc))
                          }}
                          className="w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm"
                          style={{ borderColor: COLORS.border, background: COLORS.bgGrayLight }}
                        >
                          <p className="font-semibold text-sm" style={{ color: COLORS.textPrimary }}>
                            {doc.title || "Untitled"}
                          </p>
                          <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                            {PDF_MODULE_LABELS[doc._module || ""] || doc._module || "—"} ·{" "}
                            {formatTimeAgo(doc.updatedAt || doc.createdAt)}
                          </p>
                          <span
                            className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background:
                                activeDocList === "archived" ? `${COLORS.gray500}22` : `${COLORS.blue500}22`,
                              color: activeDocList === "archived" ? COLORS.gray700 : COLORS.blue700,
                            }}
                          >
                            {activeDocList === "archived" ? "Archived" : "Stale"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
    </div>
  )
}
