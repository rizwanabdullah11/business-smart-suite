import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Category from "@/lib/server/models/Category"
import mongoose from "mongoose"
import Manual from "@/lib/server/models/Manual"

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

function typeMismatch() {
  return NextResponse.json({ error: "Category does not belong to selected module" }, { status: 403 })
}

function notFound() {
  return NextResponse.json({ error: "Category not found" }, { status: 404 })
}

export const GET = withAuth(
  async (request: NextRequest, _user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))

      await connectToDatabase()
      const category = await Category.findById(id).lean()
      if (!category) return notFound()
      if (requestedType && category.type && normalizeCategoryType(String(category.type)) !== requestedType) {
        return typeMismatch()
      }
      return NextResponse.json(category)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_CATEGORIES],
  }
)

export const PUT = withAuth(
  async (request: NextRequest, _user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))

      const body = await request.json()
      await connectToDatabase()
      const existingCategory = await Category.findById(id).lean()
      if (!existingCategory) return notFound()
      if (requestedType && existingCategory.type && normalizeCategoryType(String(existingCategory.type)) !== requestedType) {
        return typeMismatch()
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true }
      ).lean()

      if (!updatedCategory) return notFound()
      return NextResponse.json(updatedCategory)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.EDIT_CATEGORY],
  }
)

export const DELETE = withAuth(
  async (request: NextRequest, _user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) return notFound()
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))

      await connectToDatabase()
      const existingCategory = await Category.findById(id).lean()
      if (!existingCategory) return notFound()
      if (requestedType && existingCategory.type && normalizeCategoryType(String(existingCategory.type)) !== requestedType) {
        return typeMismatch()
      }

      const deleted = await Category.findByIdAndDelete(id).lean()
      if (!deleted) return notFound()

      // Keep data consistent with old behavior by archiving linked manuals.
      await Manual.updateMany(
        { $or: [{ category: id }, { categoryId: id }] },
        { $set: { archived: true, isArchived: true } }
      )

      return NextResponse.json({ success: true, message: "Category deleted" })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.DELETE_CATEGORY],
  }
)
