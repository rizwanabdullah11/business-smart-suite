import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"

/**
 * Example: Protected GET endpoint - requires VIEW_MANUALS permission
 */
export const GET = withAuth(
  async (_request: NextRequest, user) => {
    try {
      await connectToDatabase()
      const manuals = await Manual.find({
        $and: [
          { $or: [{ archived: { $exists: false } }, { archived: false }] },
          { $or: [{ isArchived: { $exists: false } }, { isArchived: false }] },
        ],
      })
        .populate("category", "_id name")
        .sort({ createdAt: -1 })
        .lean()

      return NextResponse.json({
        manuals,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Error fetching manuals:", error)
      return NextResponse.json(
        { error: `Failed to fetch manuals: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_MANUALS],
  }
)

/**
 * Example: Protected POST endpoint - requires CREATE_MANUAL permission
 */
export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      await connectToDatabase()
      const manual = await Manual.create({
        ...body,
        createdBy: user.id,
      })

      return NextResponse.json(manual, { status: 201 })
    } catch (error) {
      console.error("Error creating manual:", error)
      return NextResponse.json(
        { error: `Failed to create manual: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.CREATE_MANUAL],
  }
)

/**
 * Example: Protected DELETE endpoint - requires DELETE_MANUAL permission
 * Only ADMIN role can delete
 */
export const DELETE = withAuth(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")

      if (!id) {
        return NextResponse.json({ error: "Manual ID is required" }, { status: 400 })
      }

      await connectToDatabase()
      await Manual.findByIdAndDelete(id)

      return NextResponse.json({ success: true, message: "Manual deleted successfully" })
    } catch (error) {
      console.error("Error deleting manual:", error)
      return NextResponse.json(
        { error: `Failed to delete manual: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.DELETE_MANUAL],
  }
)
