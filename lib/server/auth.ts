import type { NextRequest } from "next/server"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { connectToDatabase } from "./db"
import User from "./models/User"
import { normalizeRole } from "./utils/roles"
import { Role } from "../types/permissions"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  organizationId?: string
}

type TokenPayload = JwtPayload & {
  id?: string
  userId?: string
  email?: string
  role?: string
}

function roleForClient(input?: string): AuthUser["role"] {
  const normalized = normalizeRole(input)
  if (normalized === "Admin") return Role.ADMIN
  if (normalized === "Organization") return Role.ORGANIZATION
  return Role.EMPLOYEE
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const fromCookie = request.cookies.get("token")?.value
  if (fromCookie) return fromCookie

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  return authHeader.slice(7)
}

export function signAuthToken(user: { _id: string; email: string; role: string }) {
  return jwt.sign(
    {
      id: user._id,
      userId: user._id,
      email: user.email,
      role: normalizeRole(user.role),
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  )
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    const userId = decoded.id || decoded.userId
    if (!userId) return null

    await connectToDatabase()
    const user = await User.findById(userId).lean()
    if (!user) return null

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: roleForClient(user.role),
      organizationId: user.organizationId ? String(user.organizationId) : undefined,
    }
  } catch {
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const token = extractTokenFromRequest(request)
  if (!token) return null
  return getUserFromToken(token)
}
