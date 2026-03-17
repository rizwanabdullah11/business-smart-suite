import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/server/db"
import User from "@/lib/server/models/User"
import { getUserFromRequest } from "@/lib/server/auth"
import { normalizeRole, ROLE } from "@/lib/server/utils/roles"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, organizationName, organizationEmail } = body
    const requestedRole = normalizeRole(body.role)

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Bad request", message: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const currentUser = await getUserFromRequest(request)
    const existingUser = await User.findOne({ email: String(email).toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "Bad request", message: "User with this email already exists" },
        { status: 400 }
      )
    }

    const userData: Record<string, unknown> = {
      name: String(name),
      email: String(email).toLowerCase(),
      password: await bcrypt.hash(String(password), 10),
      role: requestedRole,
    }

    if (currentUser) {
      if (currentUser.role === "employee") {
        return NextResponse.json(
          { error: "Forbidden", message: "Employees cannot create users" },
          { status: 403 }
        )
      }

      if (currentUser.role === "organization" && requestedRole !== ROLE.EMPLOYEE) {
        return NextResponse.json(
          { error: "Forbidden", message: "Organizations can only create Employee users" },
          { status: 403 }
        )
      }

      if (currentUser.role === "organization") {
        userData.organizationId = new mongoose.Types.ObjectId(currentUser.id)
        userData.role = ROLE.EMPLOYEE
      } else if (requestedRole === ROLE.EMPLOYEE && body.organizationId) {
        if (!mongoose.Types.ObjectId.isValid(body.organizationId)) {
          return NextResponse.json(
            { error: "Bad request", message: "Invalid organizationId" },
            { status: 400 }
          )
        }
        userData.organizationId = new mongoose.Types.ObjectId(body.organizationId)
      } else if (requestedRole === ROLE.EMPLOYEE) {
        return NextResponse.json(
          { error: "Bad request", message: "organizationId is required for Employee/User role" },
          { status: 400 }
        )
      }

      if (requestedRole === ROLE.ORGANIZATION && currentUser.role === "admin") {
        userData.organizationName = organizationName || name
        userData.organizationEmail = organizationEmail || email
      }
    } else {
      // Public signup: allow admin and employee/user roles.
      if (requestedRole === ROLE.ADMIN) {
        userData.role = ROLE.ADMIN
      } else if (requestedRole !== ROLE.EMPLOYEE) {
        return NextResponse.json(
          { error: "Forbidden", message: "Public signup only supports Employee/User role" },
          { status: 403 }
        )
      }

      if (requestedRole === ROLE.EMPLOYEE) {
        if (!body.organizationId || !mongoose.Types.ObjectId.isValid(body.organizationId)) {
          return NextResponse.json(
            { error: "Bad request", message: "organizationId is required for public signup" },
            { status: 400 }
          )
        }

        const org = await User.findOne({ _id: body.organizationId, role: ROLE.ORGANIZATION }).select("_id")
        if (!org) {
          return NextResponse.json(
            { error: "Bad request", message: "Invalid organizationId" },
            { status: 400 }
          )
        }

        userData.organizationId = new mongoose.Types.ObjectId(body.organizationId)
        userData.role = ROLE.EMPLOYEE
      }
    }

    const createdUser = await User.create(userData)
    return NextResponse.json(createdUser.toJSON(), { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
