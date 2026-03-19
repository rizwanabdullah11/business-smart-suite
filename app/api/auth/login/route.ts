import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/server/db"
import User from "@/lib/server/models/User"
import { signAuthToken } from "@/lib/server/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const normalizedEmail = String(email || "").trim().toLowerCase()
    const rawPassword = String(password || "")

    if (!normalizedEmail || !rawPassword) {
      return NextResponse.json(
        { error: "Bad request", message: "Email and password are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const isMatch = await bcrypt.compare(rawPassword, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = signAuthToken({
      _id: String(user._id),
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
      token,
      user: user.toJSON(),
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
