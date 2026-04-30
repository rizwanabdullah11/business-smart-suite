import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import User from "@/lib/server/models/User"
import { ROLE } from "@/lib/server/utils/roles"
import { getActiveOrganizationIdFromRequest, toObjectId } from "@/lib/server/organization-context"
import { MODULE_CATALOG, PLAN_DEFAULT_MODULES, type ModuleKey, type SubscriptionPlan, isModuleInPlan } from "@/lib/modules/catalog"

type ModulesConfigResponse = {
  organizationId: string
  plan: SubscriptionPlan
  enabledModules: ModuleKey[]
  availableModules: ModuleKey[]
}

function normalizePlan(input?: string | null): SubscriptionPlan {
  const raw = String(input || "").trim().toLowerCase()
  if (raw === "enterprise") return "enterprise"
  if (raw === "growth") return "growth"
  return "starter"
}

function normalizeEnabledModules(list: unknown): ModuleKey[] {
  if (!Array.isArray(list)) return []
  const allowed = new Set(MODULE_CATALOG.map((m) => m.key))
  return Array.from(new Set(list.map((v) => String(v)).filter((v) => allowed.has(v as ModuleKey)))) as ModuleKey[]
}

async function resolveOrganizationId(request: NextRequest, user: { role: string; id: string; organizationId?: string }) {
  if (user.role === "organization") return user.id
  if (user.role === "employee" || user.role === "auditor") return user.organizationId || null
  const active = getActiveOrganizationIdFromRequest(request, user as any)
  return active || null
}

export const GET = withAuth(
  async (request: NextRequest, user) => {
    await connectToDatabase()

    const organizationId = await resolveOrganizationId(request, user)
    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return NextResponse.json(
        { error: "Bad request", message: "An active organization scope is required" },
        { status: 400 }
      )
    }

    const orgObjectId = new mongoose.Types.ObjectId(organizationId)
    const org = await User.findOne({ _id: orgObjectId, role: ROLE.ORGANIZATION }).select("plan enabledModules").lean()
    if (!org) {
      return NextResponse.json({ error: "Not found", message: "Organization not found" }, { status: 404 })
    }

    const plan = normalizePlan((org as any)?.plan)
    const availableModules = PLAN_DEFAULT_MODULES[plan]

    let enabledModules = normalizeEnabledModules((org as any)?.enabledModules)
    if (enabledModules.length === 0) {
      // First-time default: enable everything in plan.
      enabledModules = [...availableModules]
      await User.updateOne({ _id: orgObjectId }, { $set: { plan, enabledModules } })
    } else {
      // Enforce that enabled modules must exist in current plan.
      enabledModules = enabledModules.filter((m) => isModuleInPlan(m, plan))
    }

    const payload: ModulesConfigResponse = {
      organizationId,
      plan,
      enabledModules,
      availableModules,
    }

    return NextResponse.json(payload)
  },
  {
    requiredPermissions: [Permission.VIEW_DASHBOARD],
  }
)

export const PUT = withAuth(
  async (request: NextRequest, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden", message: "Only admin can manage module activation" }, { status: 403 })
    }

    await connectToDatabase()
    const body = await request.json().catch(() => ({}))
    const organizationId = String(body?.organizationId || "")
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return NextResponse.json({ error: "Bad request", message: "organizationId is required" }, { status: 400 })
    }

    const plan = normalizePlan(body?.plan)
    const requestedEnabled = normalizeEnabledModules(body?.enabledModules)
    const availableModules = PLAN_DEFAULT_MODULES[plan]
    const enabledModules = requestedEnabled.filter((m) => isModuleInPlan(m, plan))

    const orgObjectId = new mongoose.Types.ObjectId(organizationId)
    const org = await User.findOne({ _id: orgObjectId, role: ROLE.ORGANIZATION }).select("_id").lean()
    if (!org) {
      return NextResponse.json({ error: "Not found", message: "Organization not found" }, { status: 404 })
    }

    await User.updateOne({ _id: orgObjectId }, { $set: { plan, enabledModules } })

    const payload: ModulesConfigResponse = {
      organizationId,
      plan,
      enabledModules,
      availableModules,
    }

    return NextResponse.json(payload)
  },
  {
    requiredPermissions: [Permission.MANAGE_ROLES],
  }
)

