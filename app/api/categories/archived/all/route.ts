import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Category from "@/lib/server/models/Category"
import Manual from "@/lib/server/models/Manual"
import { getModuleModel } from "@/lib/server/models/module-item"
import mongoose from "mongoose"
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

function toCategoryRefId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id?: unknown })._id || "")
  }
  return null
}

export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      await connectToDatabase()
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))
      const andConditions: Record<string, unknown>[] = [{ $or: [{ archived: true }, { isArchived: true }] }]
      if (requestedType) {
        andConditions.push({ type: requestedType })
      }

      const { activeOrganizationId } = await buildOwnershipFilter(request, user)
      const orgObjectId = toObjectId(activeOrganizationId)
      if (activeOrganizationId) {
        andConditions.push({
          $or: [{ organizationId: orgObjectId }, { organizationId: activeOrganizationId }],
        })
      }

      const moduleSlug = categoryTypeToModule(requestedType)
      if (user.role === "employee") {
        if (!moduleSlug) return NextResponse.json([])

        const { filter: moduleAccessFilter } = await buildModuleAccessFilter(request, user)
        const Model = moduleSlug === "manuals" ? Manual : getModuleModel(moduleSlug)
        const docsQuery: Record<string, unknown> = {
          $or: [{ category: { $exists: true, $ne: null } }, { categoryId: { $exists: true, $ne: null } }],
        }
        if (Object.keys(moduleAccessFilter || {}).length > 0) {
          docsQuery.$and = [moduleAccessFilter]
        }

        const docs = await (Model as any).find(docsQuery).select("category categoryId").lean()
        const categoryIdStrings: string[] = Array.from(
          new Set(
            docs
              .flatMap((doc: any) => [toCategoryRefId(doc?.category), toCategoryRefId(doc?.categoryId)])
              .filter((id: string | null): id is string => Boolean(id && mongoose.Types.ObjectId.isValid(id)))
          )
        )
        const categoryIds = categoryIdStrings.map((id) => new mongoose.Types.ObjectId(id))

        andConditions.push({ _id: { $in: categoryIds } })
      }

      const query = andConditions.length > 0 ? { $and: andConditions } : {}
      const categories = await Category.find(query)
        .sort({ updatedAt: -1 })
        .lean()

      return NextResponse.json(categories)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch archived categories: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_CATEGORIES],
  }
)
