import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

/**
 * GET /api/users - Get users list (dynamic based on role)
 * 
 * DYNAMIC APPROACH: Uses existing backend endpoints
 * - If backend has /users endpoint: Use it
 * - If not: Fetch from /auth/dashboard or /auth/me and return current user
 * 
 * This allows the system to work with ANY backend configuration
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

      // Build query parameters based on user role
      let queryParams = ""
      
      if (user.role === "organization" && user.id) {
        queryParams = `?organizationId=${user.id}`
      }

      // Try Method 1: Backend /users endpoint
      try {
        const response = await fetch(`${API_URL}/users${queryParams}`, { headers })

        if (response.ok) {
          let users = await response.json()

          // Additional frontend filtering as fallback
          if (user.role === "organization" && user.id) {
            users = users.filter((u: any) => 
              u.organizationId === user.id || u._id === user.id
            )
          }

          // Enrich users with organization names
          const enrichedUsers = users.map((u: any) => {
            if (u.organizationId) {
              const org = users.find((orgUser: any) => 
                orgUser._id === u.organizationId && 
                orgUser.role?.toLowerCase() === "organization"
              )
              return {
                ...u,
                organizationName: org?.name || u.organizationName || "Unknown Organization"
              }
            }
            return u
          })

          return NextResponse.json(enrichedUsers)
        }
      } catch (error) {
        console.log("Backend /users endpoint not available, trying alternative methods")
      }

      // Method 2: Try /auth/dashboard endpoint
      try {
        const dashboardResponse = await fetch(`${API_URL}/auth/dashboard`, { headers })
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          
          // Check if dashboard returns users list
          if (dashboardData.users && Array.isArray(dashboardData.users)) {
            return NextResponse.json(dashboardData.users)
          }
          
          // If dashboard returns single user, wrap in array
          if (dashboardData.user) {
            return NextResponse.json([dashboardData.user])
          }
        }
      } catch (error) {
        console.log("Dashboard endpoint not available")
      }

      // Method 3: Fallback - return current user only
      console.log("Using fallback: returning current user only")
      const fallbackData = [
        {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
          organizationId: user.organizationId,
          createdAt: new Date().toISOString(),
        }
      ]
      
      return NextResponse.json(fallbackData)
    } catch (error) {
      console.error("Error fetching users:", error)
      
      // Return current user as absolute fallback
      const fallbackData = [
        {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
          organizationId: user.organizationId,
          createdAt: new Date().toISOString(),
        }
      ]
      
      return NextResponse.json(fallbackData)
    }
  },
  {
    requiredPermissions: [Permission.VIEW_USERS],
  }
)

/**
 * POST /api/users - Create new user
 * Admin: Can create Organization or Employee
 * Organization: Can create Employee (within their organization)
 */
export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

      const body = await request.json()

      // Validation
      if (!body.name || !body.email || !body.password || !body.role) {
        return NextResponse.json(
          { error: "Name, email, password, and role are required" },
          { status: 400 }
        )
      }

      // Role validation based on current user
      if (user.role === "organization") {
        // Organizations can only create Employees
        if (body.role !== "Employee") {
          return NextResponse.json(
            { error: "Organizations can only create Employee users" },
            { status: 403 }
          )
        }
        // Auto-assign to their organization (use the organization user's ID)
        body.organizationId = user.id
      }

      if (user.role === "admin") {
        if (body.role === "Organization") {
          // Admin creating an Organization - no organizationId needed
          delete body.organizationId
        } else if (body.role === "Employee" && !body.organizationId) {
          // Admin creating Employee without organization - that's ok
          // Employee can be unassigned
        }
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      console.log("Creating user with data:", { ...body, password: "***" })

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Backend error response:", errorText)
        
        let errorMessage = "Failed to create user"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.error || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        )
      }

      const newUser = await response.json()

      return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
      console.error("Error creating user:", error)
      return NextResponse.json(
        { error: `Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.CREATE_USER],
  }
)
