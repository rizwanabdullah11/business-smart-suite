import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"

export const POST = withAuth(
  async (request: NextRequest, _user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Manual not found" }, { status: 404 })
      }

      const formData = await request.formData()
      const file = formData.get("file") as File | null
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      await connectToDatabase()
      const updated = await Manual.findByIdAndUpdate(
        id,
        {
          $set: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date(),
          },
        },
        { new: true }
      ).lean()

      if (!updated) {
        return NextResponse.json({ error: "Manual not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        manualId: id,
        fileName: file.name,
        fileSize: file.size,
      })
    } catch (error) {
      return NextResponse.json(
        { error: `Upload error: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.UPLOAD_MANUAL],
  }
)
