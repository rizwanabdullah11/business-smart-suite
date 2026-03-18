import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel, isSupportedModule } from "@/lib/server/models/module-item"

function unsupportedModule(module: string) {
  return NextResponse.json({ error: `Unsupported module: ${module}` }, { status: 404 })
}

function notFound() {
  return NextResponse.json({ error: "Entry not found" }, { status: 404 })
}

export const GET = withAuth(
  async (_request: NextRequest, _user, { params }: { params: { module: string; id: string } }) => {
    try {
      const { module, id } = params
      if (!isSupportedModule(module)) return unsupportedModule(module)
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()

      await connectToDatabase()
      const Model = getModuleModel(module)
      const row = await Model.findById(id).populate("category", "_id name").lean()
      if (!row) return notFound()
      return NextResponse.json(row)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch entry: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.VIEW_CATEGORIES] }
)

export const PUT = withAuth(
  async (request: NextRequest, _user, { params }: { params: { module: string; id: string } }) => {
    try {
      const { module, id } = params
      if (!isSupportedModule(module)) return unsupportedModule(module)
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()

      const body = await request.json()
      await connectToDatabase()
      const Model = getModuleModel(module)

      const payload = { ...body } as Record<string, unknown>
      const categoryId = payload.category || payload.categoryId
      if (categoryId && typeof categoryId === "string" && mongoose.Types.ObjectId.isValid(categoryId)) {
        payload.category = new mongoose.Types.ObjectId(categoryId)
        payload.categoryId = new mongoose.Types.ObjectId(categoryId)
      }

      const updated = await Model.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true }
      )
        .populate("category", "_id name")
        .lean()

      if (!updated) return notFound()
      return NextResponse.json(updated)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to update entry: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.EDIT_CATEGORY] }
)

export const DELETE = withAuth(
  async (_request: NextRequest, _user, { params }: { params: { module: string; id: string } }) => {
    try {
      const { module, id } = params
      if (!isSupportedModule(module)) return unsupportedModule(module)
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()

      await connectToDatabase()
      const Model = getModuleModel(module)
      const deleted = await Model.findByIdAndDelete(id).lean()
      if (!deleted) return notFound()
      return NextResponse.json({ success: true, message: "Entry deleted" })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to delete entry: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.EDIT_CATEGORY] }
)
