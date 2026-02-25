import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Example: Protected GET endpoint - requires VIEW_MANUALS permission
 */
export const GET = withAuth(
  async (request: NextRequest, user) => {
    try {
      const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/manuals`, { headers })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const manuals = await response.json()

      return NextResponse.json({
        manuals,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Error fetching manuals:", error)
      return NextResponse.json(
        { error: `Failed to fetch manuals: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_MANUALS],
  }
)

/**
 * Example: Protected POST endpoint - requires CREATE_MANUAL permission
 */
export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

      const body = await request.json()

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/manuals`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...body,
          createdBy: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const manual = await response.json()

      return NextResponse.json(manual, { status: 201 })
    } catch (error) {
      console.error("Error creating manual:", error)
      return NextResponse.json(
        { error: `Failed to create manual: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.CREATE_MANUAL],
  }
)

/**
 * Example: Protected DELETE endpoint - requires DELETE_MANUAL permission
 * Only ADMIN role can delete
 */
export const DELETE = withAuth(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")

      if (!id) {
        return NextResponse.json({ error: "Manual ID is required" }, { status: 400 })
      }

      const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/manuals/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      return NextResponse.json({ success: true, message: "Manual deleted successfully" })
    } catch (error) {
      console.error("Error deleting manual:", error)
      return NextResponse.json(
        { error: `Failed to delete manual: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.DELETE_MANUAL],
  }
)
