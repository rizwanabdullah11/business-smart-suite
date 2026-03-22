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
      const { searchParams } = new URL(request.url)
      const archivedOnly = searchParams.get("archived") === "true"
      const normalizedType = normalizeCategoryType(searchParams.get("type"))

      const andConditions: Record<string, unknown>[] = []
      if (archivedOnly) {
        andConditions.push({ $or: [{ archived: true }, { isArchived: true }] })
      } else {
        andConditions.push(
          { $or: [{ archived: { $exists: false } }, { archived: false }] },
          { $or: [{ isArchived: { $exists: false } }, { isArchived: false }] }
        )
      }
      if (normalizedType) {
        andConditions.push({ type: normalizedType })
      }
      const { activeOrganizationId } = await buildOwnershipFilter(request, user)
      const { filter: moduleAccessFilter } = await buildModuleAccessFilter(request, user)
      if (activeOrganizationId) {
        const orgObjectId = toObjectId(activeOrganizationId)
        const moduleSlug = categoryTypeToModule(normalizedType)
        if (moduleSlug) {
          const Model = moduleSlug === "manuals" ? Manual : getModuleModel(moduleSlug)
          const docsQuery: Record<string, unknown> = {
            $or: [
              { category: { $exists: true, $ne: null } },
              { categoryId: { $exists: true, $ne: null } },
            ],
          }
          if (Object.keys(moduleAccessFilter || {}).length > 0) {
            docsQuery.$and = [moduleAccessFilter]
          }

          const docs = await (Model as any).find(docsQuery)
            .select("category categoryId")
            .lean()

          const legacyCategoryIdStrings: string[] = Array.from(
            new Set(
              docs
                .flatMap((doc: any) => [toCategoryRefId(doc?.category), toCategoryRefId(doc?.categoryId)])
                .filter((id: string | null): id is string => Boolean(id && mongoose.Types.ObjectId.isValid(id)))
            )
          )

          const legacyCategoryIds = legacyCategoryIdStrings.map((id) => new mongoose.Types.ObjectId(id))

          if (orgObjectId && legacyCategoryIds.length > 0) {
            await Category.updateMany(
              {
                _id: { $in: legacyCategoryIds },
                $or: [{ organizationId: null }, { organizationId: { $exists: false } }],
              },
              { $set: { organizationId: orgObjectId } }
            )
          }

          // Employee should only see categories that contain explicitly assigned tasks.
          if (user.role === "employee") {
            andConditions.push({ _id: { $in: legacyCategoryIds } })
          }
        }

        andConditions.push({
          $or: [
          { organizationId: orgObjectId },
          { organizationId: activeOrganizationId },
        ]})
      }

      if (user.role === "employee" && !categoryTypeToModule(normalizedType)) {
        return NextResponse.json([])
      }

      const query = andConditions.length > 0 ? { $and: andConditions } : {}
      const categories = await Category.find(query).sort({ createdAt: -1 }).lean()
      return NextResponse.json(categories)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_CATEGORIES],
  }
)

export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      if (!body?.name) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 })
      }

      await connectToDatabase()
      const normalizedType = normalizeCategoryType(body.type) || "manual"
      const { activeOrganizationId } = await buildOwnershipFilter(request, user)
      const category = await Category.create({
        name: String(body.name).trim(),
        type: normalizedType,
        organizationId: toObjectId(activeOrganizationId) || activeOrganizationId || undefined,
        archived: false,
        isArchived: false,
        highlighted: false,
      })

      return NextResponse.json(category, { status: 201 })
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json(
        { error: `Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.CREATE_CATEGORY],
  }
)
