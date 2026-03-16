import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Category from "@/lib/server/models/Category"
import Manual from "@/lib/server/models/Manual"

type ManualView = {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  highlighted: boolean
  approved: boolean
}

type CategoryView = {
  id: string
  title: string
  archived: boolean
  highlighted: boolean
  manuals: ManualView[]
}

export const GET = withAuth(
  async (_request: NextRequest) => {
    try {
      await connectToDatabase()
      const [categories, manuals] = await Promise.all([
        Category.find({}).lean(),
        Manual.find({}).populate("category", "_id name").lean(),
      ])

      const mergedCategories: CategoryView[] = categories.map((cat) => ({
        id: String(cat._id),
        title: String(cat.name || ""),
        archived: Boolean(cat.archived || cat.isArchived),
        highlighted: Boolean(cat.highlighted),
        manuals: manuals
          .filter((m) => {
            const catId = String(cat._id)
            const mCat = m.category && typeof m.category === "object" ? String((m.category as { _id?: unknown })._id || "") : ""
            const mCatId = String(m.categoryId || "")
            return mCat === catId || mCatId === catId
          })
          .map((m) => ({
            id: String(m._id),
            title: String(m.title || ""),
            version: String(m.version || "v1.0"),
            issueDate: String(m.issueDate || ""),
            location: String(m.location || ""),
            highlighted: Boolean(m.highlighted),
            approved: Boolean(m.approved),
          })),
      }))

      return NextResponse.json({
        categories: mergedCategories.filter((cat) => !cat.archived),
        archivedCategories: mergedCategories.filter((cat) => cat.archived),
      })
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to refresh manuals: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_MANUALS],
  }
)
