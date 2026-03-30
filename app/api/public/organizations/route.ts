import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/server/db"
import User from "@/lib/server/models/User"
import { ROLE } from "@/lib/server/utils/roles"

/**
 * GET /api/public/organizations
 * Public endpoint — returns only organization names for the login page.
 * No authentication required; no sensitive data exposed.
 */
export async function GET() {
  try {
    await connectToDatabase()

    const organizations = await User.find({ role: ROLE.ORGANIZATION, isActive: true })
      .select("name")
      .sort({ name: 1 })
      .lean()

    return NextResponse.json(
      organizations.map((o) => ({ id: String(o._id), name: o.name }))
    )
  } catch (error) {
    console.error("Public organizations error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
