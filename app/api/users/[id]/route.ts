import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

/**
 * DELETE /api/users/[id] - Delete a user
 */
export const DELETE = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params

      const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers,
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      return NextResponse.json({ success: true, message: "User deleted successfully" })
    } catch (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json(
        { error: `Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.DELETE_USER],
  }
)

/**
 * PUT /api/users/[id] - Update a user
 */
export const PUT = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      const body = await request.json()

      const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const updatedUser = await response.json()

      return NextResponse.json(updatedUser)
    } catch (error) {
      console.error("Error updating user:", error)
      return NextResponse.json(
        { error: `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.EDIT_USER],
  }
)
