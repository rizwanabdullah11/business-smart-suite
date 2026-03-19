import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"
import mongoose from "mongoose"
import { buildOwnershipFilter, toObjectId } from "@/lib/server/organization-context"

function extractCategoryId(input: unknown): string | null {
  if (!input) return null
  if (typeof input === "string") return input
  if (typeof input === "object" && input !== null && "_id" in input) {
    const nested = (input as { _id?: unknown })._id
    return typeof nested === "string" ? nested : null
  }
  return null
}

export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      await connectToDatabase()
      const { searchParams } = new URL(request.url)
      const categoryFilter = searchParams.get("category")
      const archivedParam = searchParams.get("archived")
      const { filter: ownershipFilter } = await buildOwnershipFilter(request, user)

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
        const categoryObjectId = new mongoose.Types.ObjectId(categoryFilter)
        andConditions.push({
          $or: [
            { category: categoryObjectId },
            { categoryId: categoryObjectId },
            { category: categoryFilter },
            { categoryId: categoryFilter },
          ],
        })
      }

      if (Object.keys(ownershipFilter).length > 0) {
        andConditions.push(ownershipFilter)
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
      const { activeOrganizationId } = await buildOwnershipFilter(request, user)
      const rawCategoryId = extractCategoryId(body.category) || extractCategoryId(body.categoryId)

      const manual = await Manual.create({
        title: String(body.title).trim(),
        version: body.version || "v1.0",
        location: body.location || "QMS",
        issueDate: body.issueDate || new Date().toISOString().split("T")[0],
        category: rawCategoryId || body.category || body.categoryId || null,
        categoryId: rawCategoryId || body.categoryId || body.category || null,
        highlighted: Boolean(body.highlighted),
        approved: Boolean(body.approved),
        paused: Boolean(body.paused),
        organizationId: toObjectId(activeOrganizationId) || activeOrganizationId || undefined,
        archived: false,
        isArchived: false,
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
