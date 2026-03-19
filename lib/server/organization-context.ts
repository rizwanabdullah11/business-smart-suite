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
