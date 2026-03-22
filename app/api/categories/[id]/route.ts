import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import type { AuthUser } from "@/lib/server/auth"
import { connectToDatabase } from "@/lib/server/db"
import Category from "@/lib/server/models/Category"
import mongoose from "mongoose"
import Manual from "@/lib/server/models/Manual"
import { getModuleModel } from "@/lib/server/models/module-item"
import { buildModuleAccessFilter, buildOwnershipFilter, toObjectId } from "@/lib/server/organization-context"

const TYPE_ALIASES: Record<string, string> = {
  manuals: "manual",
  manual: "manual",
  policies: "policy",
  policy: "policy",
  procedures: "procedure",
  procedure: "procedure",
  forms: "form",
  form: "form",
  certificates: "certificate",
  certificate: "certificate",
  tasks: "task",
  task: "task",
}

function normalizeCategoryType(type?: string | null): string | null {
  if (!type) return null
  const key = type.trim().toLowerCase()
  return TYPE_ALIASES[key] || key
}

function categoryTypeToModule(type: string | null) {
  if (!type) return null
  if (type === "manual") return "manuals"
  if (type === "policy") return "policies"
  if (type === "procedure") return "procedures"
  if (type === "form") return "forms"
  if (type === "certificate") return "certificates"
  if (type === "task") return "tasks"
  return type
}

async function ensureEmployeeCategoryAccess(
  request: NextRequest,
  user: AuthUser,
  categoryId: mongoose.Types.ObjectId,
  requestedType: string | null
) {
  if (user.role !== "employee") return true

  const moduleSlug = categoryTypeToModule(requestedType)
  if (!moduleSlug) return false

  const { filter: moduleAccessFilter } = await buildModuleAccessFilter(request, user)
  const Model = moduleSlug === "manuals" ? Manual : getModuleModel(moduleSlug)
  const query: Record<string, unknown> = {
    $or: [{ category: categoryId }, { categoryId }],
  }
  if (Object.keys(moduleAccessFilter || {}).length > 0) {
    query.$and = [moduleAccessFilter]
  }

  const hit = await (Model as any).findOne(query).select("_id").lean()
  return Boolean(hit)
}

function typeMismatch() {
  return NextResponse.json({ error: "Category does not belong to selected module" }, { status: 403 })
}

function notFound() {
  return NextResponse.json({ error: "Category not found" }, { status: 404 })
}

export const GET = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))
      const { activeOrganizationId } = await buildOwnershipFilter(request, user)

      await connectToDatabase()
      const organizationFilter = activeOrganizationId
        ? {
            $or: [
              { organizationId: toObjectId(activeOrganizationId) },
              { organizationId: activeOrganizationId },
            ],
          }
        : {}
      const category = await Category.findOne({
        _id: new mongoose.Types.ObjectId(id),
        ...(organizationFilter as Record<string, unknown>),
      }).lean()
      if (!category) return notFound()
      if (requestedType && category.type && normalizeCategoryType(String(category.type)) !== requestedType) {
        return typeMismatch()
      }
      const allowedForEmployee = await ensureEmployeeCategoryAccess(
        request,
        user,
        new mongoose.Types.ObjectId(id),
        requestedType
      )
      if (!allowedForEmployee) return notFound()
      return NextResponse.json(category)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_CATEGORIES],
  }
)

export const PUT = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))
      const { activeOrganizationId } = await buildOwnershipFilter(request, user)

      const body = await request.json()
      await connectToDatabase()
      const organizationFilter = activeOrganizationId
        ? {
            $or: [
              { organizationId: toObjectId(activeOrganizationId) },
              { organizationId: activeOrganizationId },
            ],
          }
        : {}
      const existingCategory = await Category.findOne({
        _id: new mongoose.Types.ObjectId(id),
        ...(organizationFilter as Record<string, unknown>),
      }).lean()
      if (!existingCategory) return notFound()
      if (requestedType && existingCategory.type && normalizeCategoryType(String(existingCategory.type)) !== requestedType) {
        return typeMismatch()
      }
      const allowedForEmployee = await ensureEmployeeCategoryAccess(
        request,
        user,
        new mongoose.Types.ObjectId(id),
        requestedType
      )
      if (!allowedForEmployee) return notFound()

      const updatedCategory = await Category.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          ...(organizationFilter as Record<string, unknown>),
        },
        { $set: body },
        { new: true }
      ).lean()

      if (!updatedCategory) return notFound()
      return NextResponse.json(updatedCategory)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.EDIT_CATEGORY],
  }
)

export const DELETE = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))
      const { activeOrganizationId } = await buildOwnershipFilter(request, user)

      await connectToDatabase()
      const organizationFilter = activeOrganizationId
        ? {
            $or: [
              { organizationId: toObjectId(activeOrganizationId) },
              { organizationId: activeOrganizationId },
            ],
          }
        : {}
      const existingCategory = await Category.findOne({
        _id: new mongoose.Types.ObjectId(id),
        ...(organizationFilter as Record<string, unknown>),
      }).lean()
      if (!existingCategory) return notFound()
      if (requestedType && existingCategory.type && normalizeCategoryType(String(existingCategory.type)) !== requestedType) {
        return typeMismatch()
      }
      const allowedForEmployee = await ensureEmployeeCategoryAccess(
        request,
        user,
        new mongoose.Types.ObjectId(id),
        requestedType
      )
      if (!allowedForEmployee) return notFound()

      const deleted = await Category.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        ...(organizationFilter as Record<string, unknown>),
      }).lean()
      if (!deleted) return notFound()

      // Keep data consistent with old behavior by archiving linked manuals.
      await Manual.updateMany(
        { $or: [{ category: id }, { categoryId: id }] },
        { $set: { archived: true, isArchived: true } }
      )

      return NextResponse.json({ success: true, message: "Category deleted" })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.EDIT_CATEGORY],
  }
)
