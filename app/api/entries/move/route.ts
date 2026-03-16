import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { entryId, currentSectionId, newSectionId, newCategoryId } = body

      if (!entryId || !newSectionId || !newCategoryId) {
        return NextResponse.json(
          { error: "Missing required fields: entryId, newSectionId, newCategoryId" },
          { status: 400 }
        )
      }

      if (!mongoose.Types.ObjectId.isValid(entryId) || !mongoose.Types.ObjectId.isValid(newCategoryId)) {
        return NextResponse.json({ error: "Invalid entryId or newCategoryId" }, { status: 400 })
      }

      await connectToDatabase()
      const updated = await Manual.findByIdAndUpdate(
        entryId,
        {
          $set: {
            category: new mongoose.Types.ObjectId(newCategoryId),
            categoryId: new mongoose.Types.ObjectId(newCategoryId),
          },
        },
        { new: true }
      ).lean()

      if (!updated) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: `Entry moved successfully from ${currentSectionId} to ${newSectionId}`,
        entryId,
        newSectionId,
        newCategoryId,
      })
    } catch (error) {
      return NextResponse.json(
        {
          error: `Failed to move entry: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.EDIT_MANUAL],
  }
)
