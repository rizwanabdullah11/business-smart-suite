import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"
import mongoose from "mongoose"

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      await connectToDatabase()
      const { searchParams } = new URL(request.url)
      const categoryFilter = searchParams.get("category")
      const archivedParam = searchParams.get("archived")

      const andConditions: Record<string, unknown>[] = []
      if (archivedParam === "true") {
        andConditions.push({ $or: [{ archived: true }, { isArchived: true }] })
      } else if (archivedParam !== "all") {
        andConditions.push(
          { $or: [{ archived: { $exists: false } }, { archived: false }] },
          { $or: [{ isArchived: { $exists: false } }, { isArchived: false }] }
        )
      }

      if (categoryFilter && mongoose.Types.ObjectId.isValid(categoryFilter)) {
        andConditions.push({
          $or: [
          { category: new mongoose.Types.ObjectId(categoryFilter) },
          { categoryId: new mongoose.Types.ObjectId(categoryFilter) },
          ],
        })
      }

      const query = andConditions.length > 0 ? { $and: andConditions } : {}

      const manuals = await Manual.find(query)
        .populate("category", "_id name archived isArchived")
        .sort({ createdAt: -1 })
        .lean()

      return NextResponse.json(manuals)
    } catch (error) {
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

export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      if (!body?.title) {
        return NextResponse.json({ error: "Manual title is required" }, { status: 400 })
      }

      await connectToDatabase()
      const categoryId = body.category || body.categoryId
      const categoryObjectId =
        categoryId && mongoose.Types.ObjectId.isValid(categoryId)
          ? new mongoose.Types.ObjectId(categoryId)
          : undefined

      const manual = await Manual.create({
        title: String(body.title).trim(),
        version: body.version || "v1.0",
        location: body.location || "QMS",
        issueDate: body.issueDate || new Date().toISOString().split("T")[0],
        category: categoryObjectId,
        categoryId: categoryObjectId,
        highlighted: Boolean(body.highlighted),
        approved: Boolean(body.approved),
        paused: Boolean(body.paused),
        archived: false,
        isArchived: false,
        createdBy: user.id,
      })

      const created = await Manual.findById(manual._id).populate("category", "_id name").lean()
      return NextResponse.json(created, { status: 201 })
    } catch (error) {
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
