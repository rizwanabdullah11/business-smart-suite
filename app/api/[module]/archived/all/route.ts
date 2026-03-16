import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel, isSupportedModule } from "@/lib/server/models/module-item"

function unsupportedModule(module: string) {
  return NextResponse.json({ error: `Unsupported module: ${module}` }, { status: 404 })
}

export const GET = withAuth(
  async (_request: NextRequest, _user, { params }: { params: { module: string } }) => {
    try {
      const module = params.module
      if (!isSupportedModule(module)) return unsupportedModule(module)

      await connectToDatabase()
      const Model = getModuleModel(module)
      const rows = await Model.find({
        $or: [{ archived: true }, { isArchived: true }],
      })
        .populate("category", "_id name")
        .sort({ updatedAt: -1 })
        .lean()

      return NextResponse.json(rows)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch archived entries: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.VIEW_CATEGORIES] }
)
