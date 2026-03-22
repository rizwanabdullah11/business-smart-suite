import type { NextRequest } from "next/server"
import mongoose from "mongoose"
import type { AuthUser } from "@/lib/server/auth"
import User from "@/lib/server/models/User"
import Category from "@/lib/server/models/Category"

function normalizeId(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function getActiveOrganizationIdFromRequest(request: NextRequest, user: AuthUser) {
  if (user.role === "organization") return normalizeId(user.id)
  if (user.role === "employee") return normalizeId(user.organizationId || null)

  const fromHeader = normalizeId(request.headers.get("x-organization-id"))
  const fromCookie = normalizeId(request.cookies.get("activeOrganizationId")?.value || null)
  return fromHeader || fromCookie
}

export function toObjectId(value?: string | null) {
  if (!value) return null
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null
}

export async function getOrganizationUserIds(organizationId: string) {
  const orgObjectId = toObjectId(organizationId)
  if (!orgObjectId) return []

  const users = await User.find({
    $or: [{ _id: orgObjectId }, { organizationId: orgObjectId }],
  })
    .select("_id")
    .lean()

  return users
    .map((u: any) => toObjectId(String(u?._id || "")))
    .filter((id): id is mongoose.Types.ObjectId => Boolean(id))
}

async function getOrganizationCategoryIds(organizationId: string) {
  const orgObjectId = toObjectId(organizationId)
  if (!orgObjectId) return { objectIds: [] as mongoose.Types.ObjectId[], stringIds: [] as string[] }

  const categories = await Category.find({
    $or: [{ organizationId: orgObjectId }, { organizationId: organizationId }],
  })
    .select("_id")
    .lean()

  const objectIds = categories
    .map((c: any) => toObjectId(String(c?._id || "")))
    .filter((id): id is mongoose.Types.ObjectId => Boolean(id))
  const stringIds = objectIds.map((id) => id.toString())

  return { objectIds, stringIds }
}

export async function buildOwnershipFilter(request: NextRequest, user: AuthUser) {
  const activeOrganizationId = getActiveOrganizationIdFromRequest(request, user)
  const activeOrganizationObjectId = toObjectId(activeOrganizationId)
  if (!activeOrganizationId || !activeOrganizationObjectId) {
    return { activeOrganizationId: null, filter: {} as Record<string, unknown> }
  }

  const orgUserIds = await getOrganizationUserIds(activeOrganizationId)
  const orgUserIdStrings = orgUserIds.map((id) => id.toString())
  const { objectIds: orgCategoryIds, stringIds: orgCategoryIdStrings } = await getOrganizationCategoryIds(activeOrganizationId)
  const filter: Record<string, unknown> = {
    $or: [
      { organizationId: activeOrganizationObjectId },
      { organizationId: activeOrganizationId },
      { createdBy: activeOrganizationObjectId },
      { createdBy: activeOrganizationId },
      { createdBy: { $in: orgUserIds } },
      { createdBy: { $in: orgUserIdStrings } },
      { category: { $in: orgCategoryIds } },
      { category: { $in: orgCategoryIdStrings } },
      { categoryId: { $in: orgCategoryIds } },
      { categoryId: { $in: orgCategoryIdStrings } },
    ],
  }

  return { activeOrganizationId, filter }
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function buildEmployeePermissionFilter(user: AuthUser) {
  if (user.role !== "employee") return {}

  const conditions: Record<string, unknown>[] = []

  const userIdObject = toObjectId(user.id)
  if (userIdObject) {
    conditions.push({ "permissionsHistory.userId": userIdObject })
    conditions.push({ "permissionsHistory.userId": user.id })
    // Tasks created by this employee (visible to org + creator)
    conditions.push({ createdBy: userIdObject })
    conditions.push({ createdBy: user.id })
    // Workflow assignees
    conditions.push({ "taskAssignees.userId": userIdObject })
    conditions.push({ "taskAssignees.userId": user.id })
  }

  if (user.name) {
    conditions.push({
      "permissionsHistory.roleOrUser": {
        $regex: escapeRegex(user.name),
        $options: "i",
      },
    })
  }

  if (user.email) {
    conditions.push({
      "permissionsHistory.roleOrUser": {
        $regex: escapeRegex(user.email),
        $options: "i",
      },
    })
  }

  if (conditions.length === 0) {
    return { _id: { $exists: false } }
  }

  return { $or: conditions }
}

export async function buildModuleAccessFilter(request: NextRequest, user: AuthUser) {
  const base = await buildOwnershipFilter(request, user)
  if (user.role !== "employee") return base

  const permissionFilter = buildEmployeePermissionFilter(user)
  const baseHasFilter = Object.keys(base.filter || {}).length > 0
  const filter =
    baseHasFilter
      ? { $and: [base.filter, permissionFilter] }
      : permissionFilter

  return {
    ...base,
    filter,
  }
}
