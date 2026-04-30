import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission, Role } from "@/lib/types/permissions"
import User from "@/lib/server/models/User"
import { connectToDatabase } from "@/lib/server/db"
import { PLATFORM_MODULES, getDefaultEnabledModulesForPlan, type SubscriptionPlan, type PlatformModuleKey } from "@/lib/platform/plans"
import { getActiveOrganizationIdFromRequest } from "@/lib/server/organization-context"

function parsePlan(input: unknown): SubscriptionPlan | null {
  const raw = String(input || "").trim().toLowerCase()
  if (raw === "starter" || raw === "growth" || raw === "enterprise") return raw
  return null
}

export const GET = withAuth(
  async (request: NextRequest, user) => {
    await connectToDatabase()

    const activeOrganizationId =
      user.role === "organization"
        ? user.id
        : user.role === "admin"
          ? getActiveOrganizationIdFromRequest(request, user)
          : user.organizationId || null

    if (!activeOrganizationId || !mongoose.Types.ObjectId.isValid(activeOrganizationId)) {
      return NextResponse.json(
        { error: "Bad request", message: "Active organization is required to view plan settings" },
        { status: 400 }
      )
    }

    const org = await User.findOne({
      _id: new mongoose.Types.ObjectId(activeOrganizationId),
      role: "Organization",
    })
      .select("_id subscriptionPlan enabledModules name email")
      .lean()

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    const plan = (org.subscriptionPlan as SubscriptionPlan) || "starter"
    const enabledModules = Array.isArray(org.enabledModules) && org.enabledModules.length > 0
      ? (org.enabledModules as string[])
      : getDefaultEnabledModulesForPlan(plan)

    return NextResponse.json({
      organization: { id: String(org._id), name: org.name, email: org.email },
      plan,
      enabledModules,
      modules: PLATFORM_MODULES.map((m) => ({
        key: m.key,
        label: m.label,
        availableIn: m.availableIn,
      })),
    })
  },
  { requiredPermissions: [Permission.VIEW_ORGANIZATION] }
)

export const PUT = withAuth(
  async (request: NextRequest, user) => {
    if (user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectToDatabase()
    const body = await request.json().catch(() => ({}))
    const plan = parsePlan(body?.plan) || "starter"

    const activeOrganizationId = getActiveOrganizationIdFromRequest(request, user)
    if (!activeOrganizationId || !mongoose.Types.ObjectId.isValid(activeOrganizationId)) {
      return NextResponse.json(
        { error: "Bad request", message: "Active organization is required to update plan settings" },
        { status: 400 }
      )
    }

    const allowedKeys = new Set<PlatformModuleKey>(PLATFORM_MODULES.map((m) => m.key))
    const incoming = Array.isArray(body?.enabledModules) ? body.enabledModules : null
    const enabledModules: PlatformModuleKey[] =
      incoming && incoming.length > 0
        ? incoming
            .map((v: unknown) => String(v || "").trim())
            .filter((k: string): k is PlatformModuleKey => allowedKeys.has(k as PlatformModuleKey))
        : getDefaultEnabledModulesForPlan(plan)

    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(activeOrganizationId), role: "Organization" },
      { $set: { subscriptionPlan: plan, enabledModules } }
    )

    return NextResponse.json({ success: true, plan, enabledModules })
  },
  { requiredPermissions: [Permission.MANAGE_ORGANIZATION_SETTINGS] }
)

