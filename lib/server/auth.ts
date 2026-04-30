import type { NextRequest } from "next/server"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { connectToDatabase } from "./db"
import User from "./models/User"
import { normalizeRole } from "./utils/roles"
import { Role } from "../types/permissions"
import mongoose from "mongoose"
import { getDefaultEnabledModulesForPlan, type SubscriptionPlan } from "@/lib/platform/plans"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  organizationId?: string
  subscriptionPlan?: SubscriptionPlan
  enabledModules?: string[]
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
  if (normalized === "Auditor") return Role.AUDITOR
  return Role.EMPLOYEE
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }

  const fromCookie = request.cookies.get("token")?.value
  if (fromCookie) return fromCookie

  return null
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

export async function getUserFromToken(token: string, request?: NextRequest): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    const userId = decoded.id || decoded.userId
    if (!userId) return null

    await connectToDatabase()
    const user = await User.findById(userId).lean()
    if (!user) return null

    const clientRole = roleForClient(user.role)

    const resolveActiveOrgId = () => {
      if (!request) return null
      const fromHeader = request.headers.get("x-organization-id")
      const fromCookie = request.cookies.get("activeOrganizationId")?.value
      const raw = (fromHeader || fromCookie || "").trim()
      return raw.length > 0 ? raw : null
    }

    const resolveOrgRecord = async () => {
      // Organization's plan/modules live on the Organization user record.
      if (clientRole === Role.ORGANIZATION) return user
      if (clientRole === Role.EMPLOYEE || clientRole === Role.AUDITOR) {
        if (!user.organizationId) return null
        return User.findById(user.organizationId).lean()
      }
      // Admin: use active org scope if set.
      const activeOrgId = resolveActiveOrgId()
      if (!activeOrgId || !mongoose.Types.ObjectId.isValid(activeOrgId)) return null
      return User.findOne({ _id: new mongoose.Types.ObjectId(activeOrgId), role: "Organization" }).lean()
    }

    const orgRecord = await resolveOrgRecord()
    const subscriptionPlan = (orgRecord?.subscriptionPlan as SubscriptionPlan | undefined) || undefined
    const enabledModulesFromDb = Array.isArray(orgRecord?.enabledModules) ? (orgRecord?.enabledModules as string[]) : []
    const enabledModules =
      enabledModulesFromDb.length > 0 && subscriptionPlan
        ? enabledModulesFromDb
        : subscriptionPlan
          ? getDefaultEnabledModulesForPlan(subscriptionPlan)
          : undefined

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: clientRole,
      organizationId: user.organizationId ? String(user.organizationId) : undefined,
      subscriptionPlan,
      enabledModules,
    }
  } catch {
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const token = extractTokenFromRequest(request)
  if (!token) return null
  return getUserFromToken(token, request)
}
