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
      const margin = 36
      const contentWidth = pageWidth - margin * 2
      const footerHeight = 26
      const sectionGap = 18
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

      const formatDateKey = (value: Date | string) => {
        const date = typeof value === "string" ? new Date(value) : value
        if (Number.isNaN(date.getTime())) return ""
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
      }

      const dateWiseAnalytics = (() => {
        const docsByDate = new Map<string, AnyDoc[]>()
        const activitiesByDate = new Map<string, ActivityItem[]>()

        sortedDocs.forEach((item) => {
          const rawDate = item.updatedAt || item.createdAt
          const key = rawDate ? formatDateKey(rawDate) : ""
          if (!key) return
          const existing = docsByDate.get(key) || []
          existing.push(item)
          docsByDate.set(key, existing)
        })

        sortedActivities.forEach((item) => {
          const key = item.dateValue ? formatDateKey(item.dateValue) : ""
          if (!key) return
          const existing = activitiesByDate.get(key) || []
          existing.push(item)
          activitiesByDate.set(key, existing)
        })

        const rows: Array<{
          key: string
          label: string
          reports: number
          approved: number
          pending: number
          activities: number
        }> = []

        const cursor = new Date(startDate)
        while (cursor <= endDate) {
          const key = formatDateKey(cursor)
          const docsForDay = docsByDate.get(key) || []
          const activitiesForDay = activitiesByDate.get(key) || []
          rows.push({
            key,
            label: formatDate(cursor.toISOString()),
            reports: docsForDay.length,
            approved: docsForDay.filter((item) => Boolean(item.approved)).length,
            pending: docsForDay.filter((item) => !item.approved).length,
            activities: activitiesForDay.length,
          })
          cursor.setDate(cursor.getDate() + 1)
        }

        return rows
      })()

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

        drawHeaderRow()
        sortedDocs.forEach((item, index) => {
          ensurePageSpace(rowHeight + 8, "Document Register")
          if (y + rowHeight > pageHeight - margin - footerHeight) {
            doc.addPage()
            y = margin
            drawPageHeader("Document Register")
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
          doc.text(String(index + 1), margin + 10, y + 18)
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
        })
      }

      const drawAnalyticsTable = () => {
        writeSectionTitle("Analytics", "Date-wise dashboard analytics for the selected reporting period.")
        if (dateWiseAnalytics.length === 0) {
          writeWrappedText("No analytics data is available for the selected date range.")
          return
        }

        const colDate = 108
        const colReports = 82
        const colApproved = 82
        const colPending = 82
        const colActivities = contentWidth - colDate - colReports - colApproved - colPending
        const rowHeight = 28

        const drawHeaderRow = () => {
          ensurePageSpace(34, "Analytics")
          setFill(palette.panelAlt)
          doc.roundedRect(margin, y, contentWidth, rowHeight, 8, 8, "F")
          doc.setFont("helvetica", "bold")
          doc.setFontSize(10)
          setText(palette.brandDark)
          doc.text("Date", margin + 8, y + 18)
          doc.text("Reports", margin + colDate + 8, y + 18)
          doc.text("Approved", margin + colDate + colReports + 8, y + 18)
          doc.text("Pending", margin + colDate + colReports + colApproved + 8, y + 18)
          doc.text("Activities", margin + colDate + colReports + colApproved + colPending + 8, y + 18)
          y += rowHeight + 8
        }

        drawHeaderRow()
        dateWiseAnalytics.forEach((entry, index) => {
          ensurePageSpace(rowHeight + 8, "Analytics")
          if (y + rowHeight > pageHeight - margin - footerHeight) {
            doc.addPage()
            y = margin
            drawPageHeader("Analytics")
            drawHeaderRow()
          }

          const rowFill = index % 2 === 0 ? palette.panel : toRgb(COLORS.bgWhite)
          setFill(rowFill)
          setStroke(palette.border)
          doc.roundedRect(margin, y, contentWidth, rowHeight, 8, 8, "FD")

          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          setText(palette.ink)
          doc.text(entry.label, margin + 8, y + 18)
          doc.text(String(entry.reports), margin + colDate + 8, y + 18)
          doc.text(String(entry.approved), margin + colDate + colReports + 8, y + 18)
          doc.text(String(entry.pending), margin + colDate + colReports + colApproved + 8, y + 18)
          doc.text(String(entry.activities), margin + colDate + colReports + colApproved + colPending + 8, y + 18)
          y += rowHeight + 8
        })
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
      drawPageHeader("Analytics")
      drawAnalyticsTable()
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
