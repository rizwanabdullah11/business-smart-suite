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

        const response = await fetch(`${API_URL}/users${queryParams}`, { headers })

        if (response.ok) {
          let users = await response.json()
          
          // Filter for Organization role users
          let organizations = users.filter((u: any) => 
            u.role && u.role.toLowerCase() === "organization"
          )

          // Additional filtering for Organization role
          if (user.role === "organization" && user.id) {
            organizations = organizations.filter((org: any) => org._id === user.id)
          }

          if (organizations.length > 0) {
            return NextResponse.json(organizations)
          }
        }
      } catch (error) {
        console.log("Method 1 failed, trying alternative")
      }

      // Method 2: Try dedicated /organizations endpoint
      try {
        const response = await fetch(`${API_URL}/organizations`, { headers })
        
        if (response.ok) {
          let organizations = await response.json()
          
          // Filter for current organization if needed
          if (user.role === "organization" && user.id) {
            organizations = organizations.filter((org: any) => org._id === user.id)
          }
          
          if (organizations.length > 0) {
            return NextResponse.json(organizations)
          }
        }
      } catch (error) {
        console.log("Method 2 failed, using fallback")
      }

      // Method 3: Fallback - return current user if they're an organization
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
      
      // For admin with no organizations found, return empty array
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
