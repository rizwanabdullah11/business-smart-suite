"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ClipboardCheck, Loader2 } from "lucide-react"
import { COLORS } from "@/constant/colors"

type PickerUser = { _id?: string; name?: string | null; email?: string | null }

type WorkflowPermissions = {
  canAssign: boolean
  canRespond: boolean
  canAuditorReportIssues: boolean
  canAuditorComplete: boolean
}

type WorkflowPayload = {
  audit: Record<string, unknown>
  pickers: { auditors: PickerUser[]; employees: PickerUser[] }
  permissions: WorkflowPermissions
  meta: { phase: string }
}

type HistoryEntry = {
  at?: string
  byName?: string | null
  byRole?: string | null
  action?: string
  message?: string
  outcome?: string
  iteration?: number
}

function formatDateTime(value?: string | Date | null) {
  if (value == null) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

function phaseLabel(phase: string): { title: string; description: string; tone: "gray" | "blue" | "amber" | "green" } {
  switch (phase) {
    case "completed":
      return {
        title: "Completed",
        description: "The auditor has signed off this audit.",
        tone: "green",
      }
    case "awaiting_remediation":
      return {
        title: "Remediation",
        description: "The auditor reported issues; the organization or assignee must respond.",
        tone: "amber",
      }
    case "awaiting_auditor":
      return {
        title: "Awaiting auditor",
        description: "The audit is assigned; the auditor can record findings or close the audit.",
        tone: "blue",
      }
    default:
      return {
        title: "Draft",
        description: "Assign an auditor from your organization to start the workflow.",
        tone: "gray",
      }
  }
}

function toneStyle(tone: ReturnType<typeof phaseLabel>["tone"]) {
  switch (tone) {
    case "green":
      return { bg: "#dcfce7", border: "#86efac", color: "#166534" }
    case "amber":
      return { bg: "#fef3c7", border: "#fcd34d", color: "#92400e" }
    case "blue":
      return { bg: "#dbeafe", border: "#93c5fd", color: "#1e40af" }
    default:
      return { bg: COLORS.bgGray, border: COLORS.border, color: COLORS.textPrimary }
  }
}

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function AuditWorkflowPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""

  const [data, setData] = useState<WorkflowPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [formMsg, setFormMsg] = useState<string | null>(null)

  const [assignAuditor, setAssignAuditor] = useState("")
  const [assignResponsible, setAssignResponsible] = useState("")
  const [assignNote, setAssignNote] = useState("")

  const [remediationMessage, setRemediationMessage] = useState("")
  const [issuesMessage, setIssuesMessage] = useState("")
  const [completeMessage, setCompleteMessage] = useState("")

  const refresh = useCallback(async () => {
    if (!id) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/audit-schedule/${id}/workflow`, { headers: { ...authHeaders() } })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json && json.error) || `Request failed (${res.status})`)
      setData(json as WorkflowPayload)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Failed to load workflow")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const history = useMemo(() => {
    const raw = data?.audit?.auditWorkflowHistory
    const list = Array.isArray(raw) ? (raw as HistoryEntry[]) : []
    return [...list].sort((a, b) => {
      const ta = new Date(a.at ?? 0).getTime()
      const tb = new Date(b.at ?? 0).getTime()
      return tb - ta
    })
  }, [data])

  const phase = data?.meta?.phase ?? "draft"
  const banner = phaseLabel(phase)
  const styles = toneStyle(banner.tone)
  const perms = data?.permissions

  const postAction = async (body: Record<string, unknown>) => {
    setFormMsg(null)
    setSubmitting(body.action as string)
    try {
      const res = await fetch(`/api/audit-schedule/${id}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json && json.error) || `Request failed (${res.status})`)
      setData(json as WorkflowPayload)
      setRemediationMessage("")
      setIssuesMessage("")
      setCompleteMessage("")
      setAssignNote("")
      setFormMsg("Saved.")
    } catch (e) {
      setFormMsg(e instanceof Error ? e.message : "Action failed")
    } finally {
      setSubmitting(null)
    }
  }

  const title = String(data?.audit?.title ?? "Audit workflow")

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/audit-schedule"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all"
            style={{
              background: COLORS.bgWhite,
              color: COLORS.textPrimary,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to schedule
          </Link>
          <Link
            href={`/audit-schedule/${id}`}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blue-700 underline-offset-4 hover:underline"
            style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
          >
            Audit detail
          </Link>
        </div>

        <div className="mb-6 flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: styles.bg, color: styles.color }}
          >
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              {title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
              Assignment, findings, remediation, and history for this audit.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border bg-white p-8" style={{ borderColor: COLORS.border }}>
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span style={{ color: COLORS.textSecondary }}>Loading workflow…</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">{error}</div>
        ) : data ? (
          <div className="space-y-6">
            <section
              className="rounded-2xl border p-5"
              style={{ background: styles.bg, borderColor: styles.border }}
            >
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: styles.color }}>
                Current phase
              </p>
              <h2 className="mt-1 text-xl font-bold" style={{ color: styles.color }}>
                {banner.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: COLORS.textPrimary }}>
                {banner.description}
              </p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt style={{ color: COLORS.textSecondary }}>Assigned auditor</dt>
                  <dd className="font-medium" style={{ color: COLORS.textPrimary }}>
                    {(data.audit?.assignedAuditorName as string) ||
                      String(data.audit?.assignedAuditorUserId ?? "—")}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: COLORS.textSecondary }}>Responsible / assignee</dt>
                  <dd className="font-medium" style={{ color: COLORS.textPrimary }}>
                    {(data.audit?.assignedResponsibleName as string) ||
                      String(data.audit?.assignedResponsibleUserId ?? "—")}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: COLORS.textSecondary }}>Iteration</dt>
                  <dd className="font-medium" style={{ color: COLORS.textPrimary }}>
                    {typeof data.audit?.auditIterationCount === "number"
                      ? data.audit.auditIterationCount
                      : Number(data.audit?.auditIterationCount ?? 0)}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: COLORS.textSecondary }}>Last outcome</dt>
                  <dd className="font-medium capitalize" style={{ color: COLORS.textPrimary }}>
                    {String(data.audit?.auditLastOutcome || "—").replace(/_/g, " ") || "—"}
                  </dd>
                </div>
              </dl>
            </section>

            {formMsg ? (
              <div
                className="rounded-lg border px-4 py-2 text-sm"
                style={{
                  background: COLORS.bgWhite,
                  borderColor: COLORS.border,
                  color: formMsg.startsWith("Saved") ? "#166534" : "#991b1b",
                }}
              >
                {formMsg}
              </div>
            ) : null}

            {perms?.canAssign ? (
              <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
                <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                  Assign auditor
                </h3>
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
                  Choose auditor (required). You may designate an employee responsible for remediation.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    <span style={{ color: COLORS.textPrimary }}>Auditor</span>
                    <select
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: COLORS.border }}
                      value={assignAuditor}
                      onChange={(e) => setAssignAuditor(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {(data.pickers?.auditors ?? []).map((u) => (
                        <option key={String(u._id)} value={String(u._id)}>
                          {u.name || u.email || String(u._id)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    <span style={{ color: COLORS.textPrimary }}>Responsible employee (optional)</span>
                    <select
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: COLORS.border }}
                      value={assignResponsible}
                      onChange={(e) => setAssignResponsible(e.target.value)}
                    >
                      <option value="">None</option>
                      {(data.pickers?.employees ?? []).map((u) => (
                        <option key={String(u._id)} value={String(u._id)}>
                          {u.name || u.email || String(u._id)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-4 block text-sm font-medium">
                  <span style={{ color: COLORS.textPrimary }}>Note (optional)</span>
                  <textarea
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: COLORS.border }}
                    rows={2}
                    value={assignNote}
                    onChange={(e) => setAssignNote(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  disabled={!assignAuditor || submitting === "assign"}
                  onClick={() =>
                    void postAction({
                      action: "assign",
                      assignedAuditorUserId: assignAuditor,
                      assignedResponsibleUserId: assignResponsible || undefined,
                      note: assignNote || undefined,
                    })
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50"
                  style={{ background: COLORS.primary }}
                >
                  {submitting === "assign" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save assignment
                </button>
              </section>
            ) : null}

            {perms?.canRespond ? (
              <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
                <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                  Submit remediation
                </h3>
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
                  Describe corrective actions taken. This sends the audit back to the auditor.
                </p>
                <textarea
                  className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: COLORS.border }}
                  rows={4}
                  value={remediationMessage}
                  onChange={(e) => setRemediationMessage(e.target.value)}
                  placeholder="What was remediated?"
                />
                <button
                  type="button"
                  disabled={!remediationMessage.trim() || submitting === "remediate"}
                  onClick={() => void postAction({ action: "remediate", message: remediationMessage.trim() })}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50"
                  style={{ background: "#b45309" }}
                >
                  {submitting === "remediate" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit remediation
                </button>
              </section>
            ) : null}

            {perms?.canAuditorReportIssues ? (
              <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
                <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                  Report issues
                </h3>
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
                  Record non-conformities or required follow-up. The organization will remediate and you can re-audit.
                </p>
                <textarea
                  className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: COLORS.border }}
                  rows={4}
                  value={issuesMessage}
                  onChange={(e) => setIssuesMessage(e.target.value)}
                  placeholder="Describe findings…"
                />
                <button
                  type="button"
                  disabled={!issuesMessage.trim() || submitting === "auditor_issues"}
                  onClick={() => void postAction({ action: "auditor_issues", message: issuesMessage.trim() })}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50"
                  style={{ background: "#92400e" }}
                >
                  {submitting === "auditor_issues" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Log issues &amp; request remediation
                </button>
              </section>
            ) : null}

            {perms?.canAuditorComplete ? (
              <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
                <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                  Complete audit
                </h3>
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
                  Close the audit when satisfied. This marks the audit as completed and approved.
                </p>
                <textarea
                  className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: COLORS.border }}
                  rows={4}
                  value={completeMessage}
                  onChange={(e) => setCompleteMessage(e.target.value)}
                  placeholder="Closure summary…"
                />
                <button
                  type="button"
                  disabled={!completeMessage.trim() || submitting === "auditor_complete"}
                  onClick={() => void postAction({ action: "auditor_complete", message: completeMessage.trim() })}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50"
                  style={{ background: "#15803d" }}
                >
                  {submitting === "auditor_complete" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Complete audit
                </button>
              </section>
            ) : null}

            <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
              <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                Workflow history
              </h3>
              {history.length === 0 ? (
                <p className="mt-3 text-sm" style={{ color: COLORS.textSecondary }}>
                  No events yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {history.map((entry, i) => (
                    <li
                      key={`${entry.at}-${i}`}
                      className="border-l-2 pl-4"
                      style={{ borderColor: COLORS.primary }}
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {formatDateTime(entry.at)}
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-800">
                          {entry.action ?? "event"}
                        </span>
                        {entry.iteration != null ? (
                          <span className="text-xs text-gray-500">iter {entry.iteration}</span>
                        ) : null}
                        {entry.outcome ? (
                          <span className="text-xs font-medium capitalize text-gray-700">
                            {entry.outcome.replace(/_/g, " ")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm" style={{ color: COLORS.textPrimary }}>
                        {entry.byName || "User"}
                        {entry.byRole ? <span className="text-gray-500"> ({entry.byRole})</span> : null}
                      </p>
                      {entry.message ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{entry.message}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}
