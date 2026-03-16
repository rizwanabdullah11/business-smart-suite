import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"

export const GET = withAuth(
  async (_request: NextRequest) => {
    try {
      await connectToDatabase()
      const manuals = await Manual.find({
        $or: [{ archived: true }, { isArchived: true }],
      })
        .populate("category", "_id name")
        .sort({ updatedAt: -1 })
        .lean()

      return NextResponse.json(manuals)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch archived manuals: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_MANUALS],
  }
)
