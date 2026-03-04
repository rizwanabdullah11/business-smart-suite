import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/middleware/auth-middleware"
import { Role } from "@/lib/types/permissions"

/**
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      // For development: return mock user if no token
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          id: "1",
          name: "Demo User",
          email: "demo@example.com",
          role: Role.ADMIN,
        })
      }
      
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching current user:", error)
    
    // For development: return mock user on error
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        id: "1",
        name: "Demo User",
        email: "demo@example.com",
        role: Role.ADMIN,
      })
    }
    
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}
