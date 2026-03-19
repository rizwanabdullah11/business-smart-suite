import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"
import mongoose from "mongoose"
import { buildOwnershipFilter } from "@/lib/server/organization-context"

function notFound() {
  return NextResponse.json({ error: "Manual not found" }, { status: 404 })
}

export const GET = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      await connectToDatabase()
      const { filter: ownershipFilter } = await buildOwnershipFilter(request, user)

      const manual = await Manual.findOne({
        _id: new mongoose.Types.ObjectId(id),
        ...(ownershipFilter || {}),
      })
        .populate("category", "_id name")
        .lean()
      if (!manual) return notFound()
      return NextResponse.json(manual)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch manual: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_MANUALS],
  }
)

export const PUT = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      const body = await request.json()

      await connectToDatabase()
      const { filter: ownershipFilter } = await buildOwnershipFilter(request, user)
      const payload = { ...body } as Record<string, unknown>

      const categoryId = payload.category || payload.categoryId
      if (categoryId && typeof categoryId === "string" && mongoose.Types.ObjectId.isValid(categoryId)) {
        payload.category = new mongoose.Types.ObjectId(categoryId)
        payload.categoryId = new mongoose.Types.ObjectId(categoryId)
      }

      const updatedManual = await Manual.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          ...(ownershipFilter || {}),
        },
        { $set: payload },
        { new: true }
      )
        .populate("category", "_id name")
        .lean()

      if (!updatedManual) return notFound()
      return NextResponse.json(updatedManual)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to update manual: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.EDIT_MANUAL],
  }
)

export const DELETE = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      await connectToDatabase()
      const { filter: ownershipFilter } = await buildOwnershipFilter(request, user)

      const deleted = await Manual.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        ...(ownershipFilter || {}),
      }).lean()
      if (!deleted) return notFound()

      return NextResponse.json({ success: true, message: "Manual deleted" })
    } catch (error) {
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
