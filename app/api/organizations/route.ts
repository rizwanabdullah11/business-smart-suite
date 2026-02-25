import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission, Role } from "@/lib/types/permissions"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

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
      const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      // Method 1: Try /users endpoint with role filter
      try {
        let queryParams = "?role=Organization"
        
        if (user.role === "organization" && user.id) {
          queryParams += `&_id=${user.id}`
        }

        console.log("🔍 Trying Method 1: /users endpoint with role filter")
        const response = await fetch(`${API_URL}/users${queryParams}`, { headers })

        if (response.ok) {
          let users = await response.json()
          console.log("✅ Method 1 success: Got", users.length, "users")
          
          // Filter for Organization role users
          let organizations = users.filter((u: any) => 
            u.role && u.role.toLowerCase() === "organization"
          )

          // Additional filtering for Organization role
          if (user.role === "organization" && user.id) {
            organizations = organizations.filter((org: any) => org._id === user.id)
          }

          if (organizations.length > 0) {
            console.log("✅ Returning", organizations.length, "organizations from Method 1")
            return NextResponse.json(organizations)
          }
        } else {
          console.log("⚠️ Method 1 failed with status:", response.status)
        }
      } catch (error) {
        console.log("❌ Method 1 failed:", error instanceof Error ? error.message : "Unknown error")
        console.log("🔄 Trying Method 2...")
      }

      // Method 2: Try dedicated /organizations endpoint
      try {
        console.log("🔍 Trying Method 2: /organizations endpoint")
        const response = await fetch(`${API_URL}/organizations`, { headers })
        
        if (response.ok) {
          let organizations = await response.json()
          console.log("✅ Method 2 success: Got", organizations.length, "organizations")
          
          // Filter for current organization if needed
          if (user.role === "organization" && user.id) {
            organizations = organizations.filter((org: any) => org._id === user.id)
          }
          
          if (organizations.length > 0) {
            console.log("✅ Returning", organizations.length, "organizations from Method 2")
            return NextResponse.json(organizations)
          }
        } else {
          console.log("⚠️ Method 2 failed with status:", response.status)
        }
      } catch (error) {
        console.log("❌ Method 2 failed:", error instanceof Error ? error.message : "Unknown error")
        console.log("🔄 Using fallback...")
      }

      // Method 3: Fallback - return current user if they're an organization
      if (user.role === "organization") {
        console.log("✅ Fallback: Returning current user as organization")
        return NextResponse.json([
          {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: "Organization",
            createdAt: new Date().toISOString(),
          }
        ])
      }
      
      // For admin with no organizations found, return empty array
      console.log("⚠️ No organizations found - Backend may not be running or no organizations exist")
      console.log("💡 To fix: Start your backend server or create an organization user")
      return NextResponse.json([])
    } catch (error) {
      console.error("Error fetching organizations:", error)
      
      // Return current user if they're an organization
      if (user.role === "organization") {
        return NextResponse.json([
          {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: "Organization",
            createdAt: new Date().toISOString(),
          }
        ])
      }
      
      return NextResponse.json([])
    }
  },
  {
    requiredPermissions: [Permission.VIEW_USERS],
  }
)
