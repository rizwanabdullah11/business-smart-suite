import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/server/db"
import User from "@/lib/server/models/User"
import { normalizeRole, ROLE } from "@/lib/server/utils/roles"

export const GET = withAuth(
  async (_request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      await connectToDatabase()
      const targetUser = await User.findById(id).select("-password").lean()
      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (user.role === "employee") {
        return NextResponse.json(
          { error: "Forbidden", message: "Employees cannot access user management" },
          { status: 403 }
        )
      }

      if (user.role === "organization") {
        const sameOrg = String(targetUser.organizationId || "") === user.id
        const isSelf = String(targetUser._id) === user.id
        if (!sameOrg && !isSelf) {
          return NextResponse.json(
            { error: "Forbidden", message: "You can only view your own employees" },
            { status: 403 }
          )
        }
      }

      return NextResponse.json(targetUser)
    } catch (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json(
        { error: "Failed to fetch user", message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_USERS],
  }
)

/**
 * DELETE /api/users/[id] - Delete a user
 */
export const DELETE = withAuth(
  async (_request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const { id } = params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      await connectToDatabase()
      const targetUser = await User.findById(id)
      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (user.role === "employee") {
        return NextResponse.json(
          { error: "Forbidden", message: "Employees cannot delete users" },
          { status: 403 }
        )
      }

      if (user.role === "organization") {
        const sameOrg = String(targetUser.organizationId || "") === user.id
        const isSelf = String(targetUser._id) === user.id
        if (!sameOrg || isSelf) {
          return NextResponse.json(
            { error: "Forbidden", message: "Organizations can only delete their own employees" },
            { status: 403 }
          )
        }
      }

      await User.findByIdAndDelete(id)
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const body = await request.json()
      await connectToDatabase()

      const targetUser = await User.findById(id)
      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (user.role === "employee") {
        return NextResponse.json(
          { error: "Forbidden", message: "Employees cannot edit users" },
          { status: 403 }
        )
      }

      if (user.role === "organization") {
        const sameOrg = String(targetUser.organizationId || "") === user.id
        if (!sameOrg) {
          return NextResponse.json(
            { error: "Forbidden", message: "You can only edit your own employees" },
            { status: 403 }
          )
        }

        delete body.role
        delete body.organizationId
      }

      delete body.password

      if (body.role) {
        body.role = normalizeRole(body.role)
      }

      if (body.organizationId) {
        if (!mongoose.Types.ObjectId.isValid(body.organizationId)) {
          return NextResponse.json(
            { error: "Invalid organizationId" },
            { status: 400 }
          )
        }
        if (user.role !== "admin") {
          return NextResponse.json(
            { error: "Forbidden", message: "Only admin can change organization assignment" },
            { status: 403 }
          )
        }
        body.organizationId = new mongoose.Types.ObjectId(body.organizationId)
      }

      if (body.role === ROLE.ORGANIZATION) {
        body.organizationName = body.organizationName || body.name || targetUser.name
        body.organizationEmail = body.organizationEmail || body.email || targetUser.email
      }

      Object.assign(targetUser, body)
      await targetUser.save()

      return NextResponse.json(targetUser.toJSON())
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
