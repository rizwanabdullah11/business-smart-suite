import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import User from "@/lib/server/models/User"
import { normalizeRole, ROLE } from "@/lib/server/utils/roles"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

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
      if (user.role === "employee") {
        return NextResponse.json(
          { error: "Forbidden", message: "Employees cannot access user management" },
          { status: 403 }
        )
      }

      await connectToDatabase()
      const { searchParams } = new URL(request.url)
      const organizationId = searchParams.get("organizationId")
      const role = searchParams.get("role")
      const userIdFilter = searchParams.get("_id")

      const query: Record<string, unknown> = {}
      if (user.role === "organization") {
        query.$or = [
          { organizationId: new mongoose.Types.ObjectId(user.id) },
          { _id: new mongoose.Types.ObjectId(user.id) },
        ]
      }

      if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
        if (user.role === "organization" && organizationId !== user.id) {
          return NextResponse.json(
            { error: "Forbidden", message: "Cannot query another organization" },
            { status: 403 }
          )
        }
        query.organizationId = new mongoose.Types.ObjectId(organizationId)
      }

      if (role) {
        query.role = normalizeRole(role)
      }

      if (userIdFilter && mongoose.Types.ObjectId.isValid(userIdFilter)) {
        if (user.role === "organization" && userIdFilter !== user.id) {
          return NextResponse.json(
            { error: "Forbidden", message: "Cannot query another organization user directly" },
            { status: 403 }
          )
        }
        query._id = new mongoose.Types.ObjectId(userIdFilter)
      }

      const users = await User.find(query).select("-password").sort({ createdAt: -1 }).lean()
      return NextResponse.json(users)
    } catch (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json(
        { error: "Failed to fetch users", message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      )
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
      const body = await request.json()
      await connectToDatabase()

      // Validation
      if (!body.name || !body.email || !body.password || !body.role) {
        return NextResponse.json(
          { error: "Name, email, password, and role are required" },
          { status: 400 }
        )
      }

      const requestedRole = normalizeRole(body.role)

      if (user.role === "organization") {
        if (requestedRole !== ROLE.EMPLOYEE) {
          return NextResponse.json(
            { error: "Organizations can only create Employee users" },
            { status: 403 }
          )
        }
        body.organizationId = user.id
      }

      const exists = await User.findOne({ email: String(body.email).toLowerCase() }).select("_id")
      if (exists) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }

      const payload: Record<string, unknown> = {
        name: String(body.name),
        email: String(body.email).toLowerCase(),
        password: await bcrypt.hash(String(body.password), 10),
        role: requestedRole,
      }

      if (requestedRole === ROLE.EMPLOYEE) {
        if (body.organizationId) {
          if (!mongoose.Types.ObjectId.isValid(body.organizationId)) {
            return NextResponse.json(
              { error: "Invalid organizationId" },
              { status: 400 }
            )
          }
          payload.organizationId = new mongoose.Types.ObjectId(body.organizationId)
        } else if (user.role === "organization") {
          payload.organizationId = new mongoose.Types.ObjectId(user.id)
        } else {
          return NextResponse.json(
            { error: "organizationId is required for Employee/User role" },
            { status: 400 }
          )
        }
      }

      if (requestedRole === ROLE.ORGANIZATION) {
        payload.organizationName = body.organizationName || body.name
        payload.organizationEmail = body.organizationEmail || body.email
      }

      const created = await User.create(payload)
      return NextResponse.json(created.toJSON(), { status: 201 })
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
