import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"
import mongoose from "mongoose"
import { buildOwnershipFilter } from "@/lib/server/organization-context"

export const POST = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Manual not found" }, { status: 404 })
      }
      await connectToDatabase()
      const { filter: ownershipFilter } = await buildOwnershipFilter(request, user)
      const manual = await Manual.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          ...(ownershipFilter || {}),
        },
        { $set: { archived: false, isArchived: false } },
        { new: true }
      ).lean()

      if (!manual) {
        return NextResponse.json({ error: "Manual not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, manual })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to unarchive manual: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.EDIT_MANUAL],
  }
)
