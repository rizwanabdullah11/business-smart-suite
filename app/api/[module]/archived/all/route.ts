import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel, isSupportedModule } from "@/lib/server/models/module-item"
import { buildModuleAccessFilter } from "@/lib/server/organization-context"

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
      const rows = await Model.find({
        $and: [
          { $or: [{ archived: true }, { isArchived: true }] },
          ...(Object.keys(ownershipFilter).length > 0 ? [ownershipFilter] : []),
        ],
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
