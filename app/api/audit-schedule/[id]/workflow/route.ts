import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission, Role } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel } from "@/lib/server/models/module-item"
import type { AuthUser } from "@/lib/server/auth"
import { buildModuleAccessFilter, getActiveOrganizationIdFromRequest } from "@/lib/server/organization-context"
import { isModuleEnabledForUser } from "@/lib/server/module-access"
import User from "@/lib/server/models/User"

export const runtime = "nodejs"

type WorkflowEntry = {
  at: Date
  byUserId?: mongoose.Types.ObjectId | string | null
  byName?: string | null
  byRole?: string | null
  action: string
  message?: string
  outcome?: "pass" | "issues_found" | ""
  iteration?: number
}

const MODULE = "audit-schedule"

function s(v: unknown): string {
  return v == null ? "" : String(v).trim()
}

function sanitizeHistory(raw: unknown): WorkflowEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({
    ...(item || {}),
    at: item?.at instanceof Date ? item.at : item?.at ? new Date(item.at as string | number | Date) : new Date(),
  })) as WorkflowEntry[]
}

function resolveOrgScopedUserLookup(user: AuthUser, request: NextRequest) {
  if (user.role === Role.ADMIN) return getActiveOrganizationIdFromRequest(request, user)
  if (user.role === Role.ORGANIZATION) return user.id
  return null
}

async function fetchAuditorsForOrg(orgScoped: string | null) {
  if (!orgScoped || !mongoose.Types.ObjectId.isValid(orgScoped)) return []
  return User.find({
    organizationId: new mongoose.Types.ObjectId(orgScoped),
    role: { $regex: /^Auditor$/i },
  })
    .select("_id name email role")
    .sort({ name: 1 })
    .lean()
}

async function fetchEmployeesForOrg(orgScoped: string | null) {
  if (!orgScoped || !mongoose.Types.ObjectId.isValid(orgScoped)) return []
  return User.find({
    organizationId: new mongoose.Types.ObjectId(orgScoped),
    role: { $regex: /^Employee$/i },
  })
    .select("_id name email role")
    .sort({ name: 1 })
    .lean()
}

async function attachUserNames(lean: Record<string, unknown>): Promise<void> {
  const ids = new Set<string>()
  const pushMaybe = (v: unknown) => {
    const x = s(v)
    if (mongoose.Types.ObjectId.isValid(x)) ids.add(x)
  }

  pushMaybe(lean.createdBy)
  pushMaybe(lean.assignedAuditorUserId)
  pushMaybe(lean.assignedResponsibleUserId)
  sanitizeHistory(lean.auditWorkflowHistory).forEach((e) => pushMaybe(e.byUserId))

  if (!ids.size) return

  const rows = await User.find({ _id: { $in: Array.from(ids).map((id) => new mongoose.Types.ObjectId(id)) } })
    .select("name email role")
    .lean()

  const map = new Map<string, string | null>()
  rows.forEach((u) => {
    map.set(String(u._id), u.name != null ? String(u.name) : null)
  })

  lean.assignedAuditorName = map.get(s(lean.assignedAuditorUserId)) ?? null
  lean.assignedResponsibleName = map.get(s(lean.assignedResponsibleUserId)) ?? null
  lean.auditWorkflowHistory = sanitizeHistory(lean.auditWorkflowHistory).map((e) => ({
    ...e,
    byName: e.byName ?? map.get(s(e.byUserId)) ?? null,
  }))
}

function docLean(doc: mongoose.Document): Record<string, unknown> {
  return doc.toObject() as unknown as Record<string, unknown>
}

async function findAuditAccessible(
  request: NextRequest,
  user: AuthUser,
  auditId: string
): Promise<{ doc: mongoose.Document; lean: Record<string, unknown> } | null> {
  if (!mongoose.Types.ObjectId.isValid(auditId)) return null

  await connectToDatabase()
  const Model = getModuleModel(MODULE)
  const { filter: ownershipFilter } = await buildModuleAccessFilter(request, user)

  const baseId = new mongoose.Types.ObjectId(auditId)

  const row =
    ownershipFilter && Object.keys(ownershipFilter).length > 0
      ? await Model.findOne({ _id: baseId, ...ownershipFilter })
      : null

  if (row) return { doc: row, lean: docLean(row) }

  if (user.role === Role.AUDITOR) {
    const oid = user.organizationId
    if (!oid || !mongoose.Types.ObjectId.isValid(oid)) return null

    const assigned = await Model.findOne({
      _id: baseId,
      assignedAuditorUserId: new mongoose.Types.ObjectId(user.id),
      $or: [{ organizationId: new mongoose.Types.ObjectId(oid) }, { organizationId: oid }],
    })
    if (assigned) return { doc: assigned, lean: docLean(assigned) }

    const assignedStr = await Model.findOne({
      _id: baseId,
      assignedAuditorUserId: user.id,
    })
    if (assignedStr) return { doc: assignedStr, lean: docLean(assignedStr) }
  }

  return null
}

type PublicStatus = "draft" | "awaiting_auditor" | "awaiting_remediation" | "completed"

function effectiveWorkflowStatus(lean: Record<string, unknown>): PublicStatus {
  const st = s(lean.auditWorkflowStatus).toLowerCase()
  if (st === "completed") return "completed"
  if (st === "awaiting_remediation") return "awaiting_remediation"
  if (st === "awaiting_auditor") return "awaiting_auditor"
  if (st === "draft") return "draft"
  if (lean.assignedAuditorUserId) return "awaiting_auditor"
  return "draft"
}

async function hydratePayload(
  lean: Record<string, unknown>,
  request: NextRequest,
  user: AuthUser,
  auditorsPick: unknown[]
) {
  await attachUserNames(lean)
  const orgForPicker = resolveOrgScopedUserLookup(user, request)
  const employeesPick =
    user.role === Role.ADMIN || user.role === Role.ORGANIZATION
      ? await fetchEmployeesForOrg(orgForPicker)
      : []

  const phase = effectiveWorkflowStatus(lean)
  const isAssignedAuditor = user.role === Role.AUDITOR && s(lean.assignedAuditorUserId) === user.id
  const auditorOrAdminForActions =
    phase === "awaiting_auditor" && (user.role === Role.ADMIN || isAssignedAuditor)

  const canOrgOrAdmin = user.role === Role.ADMIN || user.role === Role.ORGANIZATION

  const canRespond =
    phase === "awaiting_remediation" &&
    (canOrgOrAdmin ||
      (user.role === Role.EMPLOYEE && s(lean.assignedResponsibleUserId) === user.id))

  return {
    audit: lean,
    pickers: { auditors: auditorsPick, employees: employeesPick },
    permissions: {
      canAssign: canOrgOrAdmin && phase !== "completed",
      canRespond,
      canAuditorReportIssues: auditorOrAdminForActions,
      canAuditorComplete: auditorOrAdminForActions,
    },
    meta: { phase },
  }
}

export const GET = withAuth(
  async (request: NextRequest, user, ctx: { params?: Promise<{ id?: string }> | { id?: string } }) => {
    try {
      if (!isModuleEnabledForUser(user, MODULE)) {
        return NextResponse.json({ error: "Module is not enabled for your plan" }, { status: 403 })
      }

      const params = await Promise.resolve(ctx.params)
      const id = s(params?.id)
      const doc = await findAuditAccessible(request, user, id)
      if (!doc) return NextResponse.json({ error: "Audit not found" }, { status: 404 })

      const lean = { ...doc.lean }
      const orgScoped = resolveOrgScopedUserLookup(user, request)
      const auditorsPick =
        user.role === Role.ADMIN || user.role === Role.ORGANIZATION
          ? await fetchAuditorsForOrg(orgScoped)
          : []

      return NextResponse.json(await hydratePayload(lean, request, user, auditorsPick))
    } catch (e) {
      return NextResponse.json(
        { error: `Failed to load audit workflow: ${e instanceof Error ? e.message : "unknown"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.VIEW_AUDIT_SCHEDULE] }
)

export const POST = withAuth(
  async (request: NextRequest, user, ctx: { params?: Promise<{ id?: string }> | { id?: string } }) => {
    try {
      if (!isModuleEnabledForUser(user, MODULE)) {
        return NextResponse.json({ error: "Module is not enabled for your plan" }, { status: 403 })
      }

      const params = await Promise.resolve(ctx.params)
      const auditId = s(params?.id)
      const found = await findAuditAccessible(request, user, auditId)
      if (!found) return NextResponse.json({ error: "Audit not found" }, { status: 404 })

      const body = await request.json().catch(() => ({}))
      const action = s(body?.action).toLowerCase()
      if (!action) return NextResponse.json({ error: "`action` is required" }, { status: 400 })

      const lean = docLean(found.doc)
      lean.auditWorkflowHistory = sanitizeHistory(lean.auditWorkflowHistory)

      const iteration = typeof lean.auditIterationCount === "number" ? lean.auditIterationCount : 0

      const push = (entry: Omit<WorkflowEntry, "at"> & { at?: Date }) => {
        const hist = sanitizeHistory(lean.auditWorkflowHistory)
        hist.push({ ...entry, at: entry.at ?? new Date() })
        lean.auditWorkflowHistory = hist
      }

      const phase = effectiveWorkflowStatus(lean)

      const saveAndReturn = async () => {
        found.doc.set(lean)
        await found.doc.save()
        const fresh = docLean(found.doc)
        const orgScoped = resolveOrgScopedUserLookup(user, request)
        const auditorsPick =
          user.role === Role.ADMIN || user.role === Role.ORGANIZATION
            ? await fetchAuditorsForOrg(orgScoped)
            : []
        return NextResponse.json(await hydratePayload(fresh, request, user, auditorsPick))
      }

      if (action === "assign") {
        if (!(user.role === Role.ADMIN || user.role === Role.ORGANIZATION)) {
          return NextResponse.json({ error: "Only your organization can assign this audit." }, { status: 403 })
        }
        if (phase === "completed") return NextResponse.json({ error: "Audit already completed" }, { status: 400 })

        const auditorUserId = s(body?.assignedAuditorUserId || body?.auditorUserId)
        const responsibleUserId = s(body?.assignedResponsibleUserId || body?.responsibleUserId)

        if (!auditorUserId || !mongoose.Types.ObjectId.isValid(auditorUserId)) {
          return NextResponse.json({ error: "assignedAuditorUserId is required" }, { status: 400 })
        }

        let responsibleOid: mongoose.Types.ObjectId | undefined
        if (responsibleUserId) {
          if (!mongoose.Types.ObjectId.isValid(responsibleUserId)) {
            return NextResponse.json({ error: "Invalid assignedResponsibleUserId" }, { status: 400 })
          }
          responsibleOid = new mongoose.Types.ObjectId(responsibleUserId)
        }

        push({
          action: "assign",
          message: s(body?.note),
          byUserId: new mongoose.Types.ObjectId(user.id),
          byRole: user.role,
          iteration,
        })

        lean.assignedAuditorUserId = new mongoose.Types.ObjectId(auditorUserId)
        if (responsibleOid) lean.assignedResponsibleUserId = responsibleOid
        lean.taskAssignees = responsibleOid ? [{ userId: responsibleOid }] : []
        lean.auditWorkflowStatus = "awaiting_auditor"
        lean.status = "Assigned"
        return saveAndReturn()
      }

      if (action === "remediate") {
        if (phase !== "awaiting_remediation") {
          return NextResponse.json({ error: "Remediation is not required right now." }, { status: 400 })
        }

        const canResp =
          user.role === Role.ADMIN ||
          user.role === Role.ORGANIZATION ||
          (user.role === Role.EMPLOYEE && s(lean.assignedResponsibleUserId) === user.id)

        if (!canResp) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const msg = s(body?.message)
        if (!msg) return NextResponse.json({ error: "message is required" }, { status: 400 })

        push({
          action: "remediation",
          message: msg,
          byUserId: new mongoose.Types.ObjectId(user.id),
          byRole: user.role,
          iteration,
        })

        lean.auditWorkflowStatus = "awaiting_auditor"
        lean.status = "In Progress"
        return saveAndReturn()
      }

      if (action === "auditor_issues") {
        if (!(user.role === Role.AUDITOR || user.role === Role.ADMIN)) {
          return NextResponse.json({ error: "Only auditors can report issues." }, { status: 403 })
        }
        if (user.role === Role.AUDITOR && s(lean.assignedAuditorUserId) !== user.id) {
          return NextResponse.json({ error: "You are not the assigned auditor." }, { status: 403 })
        }
        if (phase !== "awaiting_auditor") {
          return NextResponse.json({ error: "This audit is not awaiting auditor input." }, { status: 400 })
        }

        const msg = s(body?.message)
        if (!msg) return NextResponse.json({ error: "message is required" }, { status: 400 })

        const nextIter = iteration + 1
        lean.auditIterationCount = nextIter

        push({
          action: "auditor_issues",
          message: msg,
          outcome: "issues_found",
          byUserId: new mongoose.Types.ObjectId(user.id),
          byRole: user.role,
          iteration: nextIter,
        })

        lean.auditWorkflowStatus = "awaiting_remediation"
        lean.auditLastOutcome = "issues_found"
        lean.status = "In Progress"
        return saveAndReturn()
      }

      if (action === "auditor_complete") {
        if (!(user.role === Role.AUDITOR || user.role === Role.ADMIN)) {
          return NextResponse.json({ error: "Only auditors can complete this audit." }, { status: 403 })
        }
        if (user.role === Role.AUDITOR && s(lean.assignedAuditorUserId) !== user.id) {
          return NextResponse.json({ error: "You are not the assigned auditor." }, { status: 403 })
        }
        if (phase !== "awaiting_auditor") {
          return NextResponse.json({ error: "This audit is not awaiting auditor completion." }, { status: 400 })
        }

        const msg = s(body?.message)
        if (!msg) return NextResponse.json({ error: "message is required" }, { status: 400 })

        push({
          action: "auditor_complete",
          message: msg,
          outcome: "pass",
          byUserId: new mongoose.Types.ObjectId(user.id),
          byRole: user.role,
          iteration,
        })

        lean.auditWorkflowStatus = "completed"
        lean.auditLastOutcome = "pass"
        lean.status = "Completed"
        lean.approved = true
        return saveAndReturn()
      }

      return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 })
    } catch (e) {
      return NextResponse.json(
        { error: `Failed workflow action: ${e instanceof Error ? e.message : "unknown"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.VIEW_AUDIT_SCHEDULE] }
)
