import { NextRequest, NextResponse } from "next/server"
import User from "@/lib/server/models/User"
import Manual from "@/lib/server/models/Manual"
import { connectToDatabase } from "@/lib/server/db"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { hasPermission } from "@/lib/auth"
import { getModuleModel } from "@/lib/server/models/module-item"
import { buildModuleAccessFilter, getActiveOrganizationIdFromRequest, toObjectId } from "@/lib/server/organization-context"

const DASHBOARD_MODULES = [
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

type DashboardDoc = {
  _id?: unknown
  _module?: string
  title?: string
  approved?: boolean
  archived?: boolean
  isArchived?: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

function formatTimeAgo(dateValue?: string | Date) {
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

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    await connectToDatabase()

    const { filter: ownershipFilter } = await buildModuleAccessFilter(request, user)
    const activeQuery =
      Object.keys(ownershipFilter).length > 0
        ? {
            $and: [
              { $or: [{ archived: { $exists: false } }, { archived: false }] },
              { $or: [{ isArchived: { $exists: false } }, { isArchived: false }] },
              ownershipFilter,
            ],
          }
        : {
            $and: [
              { $or: [{ archived: { $exists: false } }, { archived: false }] },
              { $or: [{ isArchived: { $exists: false } }, { isArchived: false }] },
            ],
          }

    const selectFields = "_id title approved archived isArchived createdAt updatedAt"

    const [manuals, ...moduleDocs] = await Promise.all([
      Manual.find(activeQuery).select(selectFields).sort({ createdAt: -1 }).lean(),
      ...DASHBOARD_MODULES.map((module) =>
        getModuleModel(module)
          .find(activeQuery)
          .select(selectFields)
          .sort({ createdAt: -1 })
          .lean()
          .then((rows) => rows.map((row: any) => ({ ...row, _module: module })))
      ),
    ])

    const allDocs = [
      ...(manuals as DashboardDoc[]).map((doc) => ({ ...doc, _module: "manual" })),
      ...moduleDocs.flat(),
    ] as DashboardDoc[]
    const completedCount = allDocs.filter((doc) => Boolean(doc.approved)).length
    const pendingCount = allDocs.filter((doc) => !doc.approved).length

    let userCount: number | null = null
    if (hasPermission(user, Permission.VIEW_USERS)) {
      const userQuery: Record<string, unknown> = {}
      const activeOrganizationId =
        user.role === "admin" ? getActiveOrganizationIdFromRequest(request, user) : null

      if (user.role === "organization") {
        const orgObjectId = toObjectId(user.id)
        if (orgObjectId) {
          userQuery.$or = [{ organizationId: orgObjectId }, { _id: orgObjectId }]
        }
      } else if (user.role === "admin" && activeOrganizationId) {
        const orgObjectId = toObjectId(activeOrganizationId)
        if (orgObjectId) {
          userQuery.$or = [{ organizationId: orgObjectId }, { _id: orgObjectId }]
        }
      }

      userCount = await User.countDocuments(userQuery)
    }

    const stats = [
      {
        title: "Total Documents",
        value: String(allDocs.length),
        change: "live",
        trend: "up",
        color: "#3b82f6",
        subtitle: "current total",
      },
      {
        title: "Active Users",
        value: userCount === null ? "-" : String(userCount),
        change: "live",
        trend: "up",
        color: "#10b981",
        subtitle: userCount === null ? "permission required" : "users in system",
      },
      {
        title: "Pending Reviews",
        value: String(pendingCount),
        change: "live",
        trend: "down",
        color: "#f59e0b",
        subtitle: "not completed yet",
      },
      {
        title: "Completed Tasks",
        value: String(completedCount),
        change: "live",
        trend: "up",
        color: "#22c55e",
        subtitle: "approved/completed",
      },
    ]

    const recentActivities = allDocs
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
          dateValue: String(doc.updatedAt || doc.createdAt || ""),
          sortTime: updatedAt || createdAt,
        }
      })
      .sort((a, b) => b.sortTime - a.sortTime)
      .map(({ sortTime, ...rest }) => rest)

    return NextResponse.json({
      stats,
      recentActivities,
      docs: allDocs.map((doc) => ({
        _id: String(doc._id || ""),
        _module: doc._module || "",
        title: doc.title || "",
        approved: Boolean(doc.approved),
        archived: Boolean(doc.archived),
        isArchived: Boolean(doc.isArchived),
        createdAt: doc.createdAt ? String(doc.createdAt) : undefined,
        updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}, { requiredPermissions: [Permission.VIEW_DASHBOARD] })
