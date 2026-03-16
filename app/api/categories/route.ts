import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Category from "@/lib/server/models/Category"
import mongoose from "mongoose"

const TYPE_ALIASES: Record<string, string> = {
  manuals: "manual",
  manual: "manual",
  policies: "policy",
  policy: "policy",
  procedures: "procedure",
  procedure: "procedure",
  forms: "form",
  form: "form",
  certificates: "certificate",
  certificate: "certificate",
  tasks: "task",
  task: "task",
}

function normalizeCategoryType(type?: string | null): string | null {
  if (!type) return null
  const key = type.trim().toLowerCase()
  return TYPE_ALIASES[key] || key
}

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      await connectToDatabase()
      const { searchParams } = new URL(request.url)
      const archivedOnly = searchParams.get("archived") === "true"
      const normalizedType = normalizeCategoryType(searchParams.get("type"))

      const query: Record<string, unknown> = {}
      if (archivedOnly) {
        query.$or = [{ archived: true }, { isArchived: true }]
      }
      if (normalizedType) {
        query.type = normalizedType
      }

      const categories = await Category.find(query).sort({ createdAt: -1 }).lean()
      return NextResponse.json(categories)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_CATEGORIES],
  }
)

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      if (!body?.name) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 })
      }

      await connectToDatabase()
      const normalizedType = normalizeCategoryType(body.type) || "manual"
      const category = await Category.create({
        name: String(body.name).trim(),
        type: normalizedType,
        archived: false,
        isArchived: false,
        highlighted: false,
      })

      return NextResponse.json(category, { status: 201 })
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json(
        { error: `Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.CREATE_CATEGORY],
  }
)
