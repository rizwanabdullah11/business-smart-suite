import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import User from "@/lib/server/models/User"
import { ROLE } from "@/lib/server/utils/roles"
import mongoose from "mongoose"

/**
 * GET /api/organizations - Get organizations list (dynamic based on role)
 * 
 * DYNAMIC APPROACH: Tries multiple methods to get organization data
 * - Method 1: Backend /users?role=Organization endpoint
 * - Method 2: Backend /organizations endpoint (if exists)
 * - Method 3: Return current user if they're an organization
 */
export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      if (user.role === "employee") {
        return NextResponse.json(
          { error: "Forbidden", message: "Employees cannot access organizations" },
          { status: 403 }
        )
      }

      await connectToDatabase()
      const query: Record<string, unknown> = { role: ROLE.ORGANIZATION }

      if (user.role === "organization") {
        query._id = new mongoose.Types.ObjectId(user.id)
      }

      const organizations = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .lean()

      return NextResponse.json(organizations)
    } catch (error) {
      console.error("Error fetching organizations:", error)
      return NextResponse.json(
        { error: "Failed to fetch organizations", message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_USERS],
  }
)
