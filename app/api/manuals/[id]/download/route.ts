import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"
import mongoose from "mongoose"

export const GET = withAuth(
  async (_request: NextRequest, _user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Manual not found" }, { status: 404 })
      }

      await connectToDatabase()
      const manual = await Manual.findById(id).lean()
      if (!manual) {
        return NextResponse.json({ error: "Manual not found" }, { status: 404 })
      }

      // No binary document store is configured yet.
      return NextResponse.json(
        { error: "No downloadable document attached to this manual yet" },
        { status: 404 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to download manual: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_MANUALS],
  }
)
