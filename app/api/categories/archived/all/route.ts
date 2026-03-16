import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Category from "@/lib/server/models/Category"

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
      const requestedType = normalizeCategoryType(new URL(request.url).searchParams.get("type"))
      const query: Record<string, unknown> = {
        $or: [{ archived: true }, { isArchived: true }],
      }
      if (requestedType) {
        query.type = requestedType
      }

      const categories = await Category.find(query)
        .sort({ updatedAt: -1 })
        .lean()

      return NextResponse.json(categories)
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to fetch archived categories: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_CATEGORIES],
  }
)
