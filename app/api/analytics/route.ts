import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"
import { getModuleModel } from "@/lib/server/models/module-item"
import { buildOwnershipFilter } from "@/lib/server/organization-context"

const MODULES = [
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
] as const

type AnalyticsDoc = {
  _id: string
  _module: string
  title?: string
  source?: string
  status?: string
  approved?: boolean
  date?: unknown
  issueDate?: unknown
  createdAt?: unknown
  cost?: number | string
  category?: { name?: string } | string
}

function parseFlexibleDate(raw: unknown): Date | null {
  if (!raw) return null
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw

  if (typeof raw === "string") {
    const value = raw.trim()
    if (!value) return null

    const direct = new Date(value)
    if (!Number.isNaN(direct.getTime())) return direct

    const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (slash) {
      const a = Number(slash[1])
      const b = Number(slash[2])
      const y = Number(slash[3])
      const day = a > 12 ? a : b
      const month = a > 12 ? b : a
      const parsed = new Date(y, month - 1, day)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }
  }

  return null
}

function getDateValue(row: AnalyticsDoc) {
  return parseFlexibleDate(row.date || row.issueDate || row.createdAt)
}

function monthShort(date: Date) {
  return date.toLocaleString("en", { month: "short" })
}

function buildMonthlyActivity(rows: AnalyticsDoc[], startDate: string, endDate: string) {
  const result: { name: string; value: number }[] = []
  const monthMap = new Map<string, number>()
  const cursor = new Date(startDate)
  cursor.setDate(1)
  const end = new Date(endDate)
  end.setDate(1)

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`
    monthMap.set(key, 0)
    result.push({ name: monthShort(cursor), value: 0 })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  rows.forEach((row) => {
    const d = getDateValue(row)
    if (!d) return
    const key = `${d.getFullYear()}-${d.getMonth()}`
    monthMap.set(key, (monthMap.get(key) || 0) + 1)
  })

  return result.map((entry, i) => {
    const d = new Date(startDate)
    d.setDate(1)
    d.setMonth(d.getMonth() + i)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    return { ...entry, value: monthMap.get(key) || 0 }
  })
}

function buildAchievement(rows: AnalyticsDoc[]) {
  const group = new Map<string, { name: string; late: number; onTime: number }>()

  rows.forEach((row) => {
    const categoryName = typeof row.category === "string" ? row.category : row.category?.name
    const area = row.source || categoryName || row._module || "Unspecified"
    const status = String(row.status || "").toLowerCase()
    const onTime = Boolean(row.approved) || ["closed", "completed", "done", "approved"].some((k) => status.includes(k))
    const entry = group.get(area) || { name: area, late: 0, onTime: 0 }
    if (onTime) entry.onTime += 1
    else entry.late += 1
    group.set(area, entry)
  })

  return Array.from(group.values()).slice(0, 12)
}

function buildCostTrend(rows: AnalyticsDoc[]) {
  const totals = new Map<string, number>()
  const months: { key: string; name: string }[] = []
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 11)

  for (let i = 0; i < 12; i++) {
    const key = `${d.getFullYear()}-${d.getMonth()}`
    totals.set(key, 0)
    months.push({ key, name: monthShort(d) })
    d.setMonth(d.getMonth() + 1)
  }

  rows.forEach((row) => {
    const date = getDateValue(row)
    if (!date) return
    const key = `${date.getFullYear()}-${date.getMonth()}`
    if (!totals.has(key)) return
    const raw = typeof row.cost === "number" ? row.cost : Number(row.cost || 0)
    const value = Number.isFinite(raw) ? raw : 0
    totals.set(key, (totals.get(key) || 0) + value)
  })

  return months.map((m) => ({ name: m.name, cost: Number((totals.get(m.key) || 0).toFixed(2)) }))
}

export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      await connectToDatabase()
      const { searchParams } = new URL(request.url)
      const startDate = searchParams.get("startDate") || (() => {
        const d = new Date()
        d.setMonth(d.getMonth() - 5)
        return d.toISOString().split("T")[0]
      })()
      const endDate = searchParams.get("endDate") || new Date().toISOString().split("T")[0]

      const activeFilter = {
        $and: [
          { $or: [{ archived: { $exists: false } }, { archived: false }] },
          { $or: [{ isArchived: { $exists: false } }, { isArchived: false }] },
        ],
      }
      const { filter: ownershipFilter } = await buildOwnershipFilter(request, user)
      const mergedFilter = Object.keys(ownershipFilter).length > 0
        ? { $and: [activeFilter, ownershipFilter] }
        : activeFilter

      const [manualRows, ...moduleRows] = await Promise.all([
        Manual.find(mergedFilter)
          .select("title source status approved date issueDate createdAt cost category")
          .populate("category", "name")
          .lean(),
        ...MODULES.map((module) => {
          const Model = getModuleModel(module)
          return Model.find(mergedFilter)
            .select("title source status approved date issueDate createdAt cost category")
            .populate("category", "name")
            .lean()
            .then((rows) => rows.map((r: any) => ({ ...r, _module: module })))
        }),
      ])

      const allRows: AnalyticsDoc[] = [
        ...(manualRows as any[]).map((r) => ({ ...r, _module: "manuals" })),
        ...moduleRows.flat(),
      ]

      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      let scoped = allRows.filter((row) => {
        const d = getDateValue(row)
        if (!d) return false
        return d >= start && d <= end
      })

      if (scoped.length === 0 && allRows.length > 0) {
        scoped = allRows.filter((row) => Boolean(getDateValue(row)))
      }

      const monthlyActivity = buildMonthlyActivity(scoped, startDate, endDate)
      const achievementData = buildAchievement(scoped)
      const costTrend = buildCostTrend(scoped)
      const totalCost = costTrend.reduce((sum, row) => sum + row.cost, 0)
      const totalItems = scoped.length
      const completed = scoped.filter((row) => {
        const status = String(row.status || "").toLowerCase()
        return Boolean(row.approved) || ["closed", "completed", "done", "approved"].some((k) => status.includes(k))
      }).length

      const pending = Math.max(totalItems - completed, 0)
      const moduleCounts = Array.from(
        scoped.reduce((map, row) => {
          map.set(row._module, (map.get(row._module) || 0) + 1)
          return map
        }, new Map<string, number>())
      ).map(([module, count]) => ({ module, count }))

      return NextResponse.json({
        summary: {
          totalItems,
          completed,
          pending,
          totalCost: Number(totalCost.toFixed(2)),
          averageCost: totalItems > 0 ? Number((totalCost / totalItems).toFixed(2)) : 0,
        },
        monthlyActivity,
        achievementData,
        costTrend,
        moduleCounts,
        range: { startDate, endDate },
      })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to build analytics: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.VIEW_ANALYTICS] }
)
