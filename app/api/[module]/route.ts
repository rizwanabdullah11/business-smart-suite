import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel, isSupportedModule } from "@/lib/server/models/module-item"

function unsupportedModule(module: string) {
  return NextResponse.json({ error: `Unsupported module: ${module}` }, { status: 404 })
}

export const GET = withAuth(
  async (request: NextRequest, _user, { params }: { params: { module: string } }) => {
    try {
      const module = params.module
      if (!isSupportedModule(module)) return unsupportedModule(module)

      await connectToDatabase()
      const Model = getModuleModel(module)
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

      const query = andConditions.length ? { $and: andConditions } : {}
      const rows = await Model.find(query)
        .populate("category", "_id name archived isArchived")
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
      const categoryId = body.category || body.categoryId
      const categoryObjectId =
        categoryId && mongoose.Types.ObjectId.isValid(categoryId)
          ? new mongoose.Types.ObjectId(categoryId)
          : undefined

      const created = await Model.create({
        title: String(body.title).trim(),
        version: body.version || "v1.0",
        location: body.location || "N/A",
        issueDate: body.issueDate || new Date().toISOString().split("T")[0],
        expiryDate: body.expiryDate || null,
        category: categoryObjectId,
        categoryId: categoryObjectId,
        highlighted: Boolean(body.highlighted),
        approved: Boolean(body.approved),
        paused: Boolean(body.paused),
        archived: false,
        isArchived: false,
        createdBy: user.id,
      })

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
