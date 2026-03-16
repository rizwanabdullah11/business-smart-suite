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

export const POST = withAuth(
  async (request: NextRequest, _user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))

      await connectToDatabase()
      const existingCategory = await Category.findById(id).lean()
      if (!existingCategory) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
      if (requestedType && existingCategory.type && normalizeCategoryType(String(existingCategory.type)) !== requestedType) {
        return NextResponse.json({ error: "Category does not belong to selected module" }, { status: 403 })
      }

      const updated = await Category.findByIdAndUpdate(
        id,
        { $set: { archived: false, isArchived: false } },
        { new: true }
      ).lean()

      if (!updated) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, category: updated })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to unarchive category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.EDIT_CATEGORY],
  }
)
