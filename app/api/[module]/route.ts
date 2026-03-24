import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel, isSupportedModule } from "@/lib/server/models/module-item"
import { notifyExpiredCertificates } from "@/lib/server/certificate-expiry-notifier"
import { buildModuleAccessFilter, buildOwnershipFilter, toObjectId } from "@/lib/server/organization-context"

function unsupportedModule(module: string) {
  return NextResponse.json({ error: `Unsupported module: ${module}` }, { status: 404 })
}

export const GET = withAuth(
  async (request: NextRequest, user, { params }: { params: { module: string } }) => {
    try {
      const module = params.module
      if (!isSupportedModule(module)) return unsupportedModule(module)

      await connectToDatabase()
      const Model = getModuleModel(module)
      const { filter: ownershipFilter } = await buildModuleAccessFilter(request, user)
      const { searchParams } = new URL(request.url)
      const categoryFilter = searchParams.get("category")
      const archivedParam = searchParams.get("archived")

      const andConditions: Record<string, unknown>[] = []
      if (archivedParam === "true") {
        andConditions.push({ $or: [{ archived: true }, { isArchived: true }] })
      } else if (archivedParam !== "all") {
        andConditions.push(
          { $or: [{ archived: { $exists: false } }, { archived: false }] },
          { $or: [{ isArchived: { $exists: false } }, { isArchived: false }] }
        )
      }

      if (categoryFilter && mongoose.Types.ObjectId.isValid(categoryFilter)) {
        andConditions.push({
          $or: [
            { category: new mongoose.Types.ObjectId(categoryFilter) },
            { categoryId: new mongoose.Types.ObjectId(categoryFilter) },
          ],
        })
      }

      if (Object.keys(ownershipFilter).length > 0) {
        andConditions.push(ownershipFilter)
      }

      const query = andConditions.length ? { $and: andConditions } : {}
      const rows = await Model.find(query)
        .select("-fileData")
        .sort({ createdAt: -1 })
        .lean()

      return NextResponse.json(rows)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch module entries: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.VIEW_CATEGORIES] }
)

export const POST = withAuth(
  async (request: NextRequest, user, { params }: { params: { module: string } }) => {
    try {
      const module = params.module
      if (!isSupportedModule(module)) return unsupportedModule(module)

      const body = await request.json()
      if (!body?.title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 })
      }

      await connectToDatabase()
      const Model = getModuleModel(module)
      const { activeOrganizationId } = await buildOwnershipFilter(request, user)
      const categoryId = body.category || body.categoryId
      const categoryObjectId =
        categoryId && mongoose.Types.ObjectId.isValid(categoryId)
          ? new mongoose.Types.ObjectId(categoryId)
          : undefined

      const rest = { ...(body || {}) }
      delete rest._id
      delete rest.id
      delete rest.category
      delete rest.categoryId
      delete rest.createdAt
      delete rest.updatedAt

      const created = await Model.create({
        ...rest,
        title: String(body.title).trim(),
        category: categoryObjectId,
        categoryId: categoryObjectId,
        organizationId: toObjectId(activeOrganizationId) || activeOrganizationId || undefined,
        highlighted: Boolean(body.highlighted ?? false),
        approved: Boolean(body.approved ?? false),
        paused: Boolean(body.paused ?? false),
        archived: false,
        isArchived: false,
        createdBy: user.id,
      })

      if (module === "certificates") {
        await notifyExpiredCertificates(true)
      }

      return NextResponse.json(created, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to create module entry: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.CREATE_CATEGORY] }
)
