"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useAuth } from "@/contexts/auth-context"

const FULL_TABS = ["Details", "Document", "Version history", "Reviews", "Permissions", "Audits"] as const
const EMPLOYEE_TABS = ["Details", "Document", "Version history", "Reviews", "Audits"] as const

/** Tinted panels for dynamic detail rows (cycles for variety) */
const DETAIL_FIELD_PANEL_STYLES = [
  {
    shell: "border-violet-200/80 bg-gradient-to-br from-violet-50 via-fuchsia-50/50 to-white",
    label: "text-violet-800",
    value: "text-slate-900",
  },
  {
    shell: "border-sky-200/75 bg-gradient-to-br from-sky-50 via-cyan-50/40 to-white",
    label: "text-sky-800",
    value: "text-slate-900",
  },
  {
    shell: "border-amber-200/70 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white",
    label: "text-amber-900",
    value: "text-slate-900",
  },
  {
    shell: "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white",
    label: "text-emerald-900",
    value: "text-slate-900",
  },
] as const

function detailPanelStyle(idx: number) {
  return DETAIL_FIELD_PANEL_STYLES[idx % DETAIL_FIELD_PANEL_STYLES.length]
}

function toTitle(moduleSlug: string) {
  if (!moduleSlug) return "Task"
  return moduleSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase())
}

function formatDate(value?: string) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function formatDateTime(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

function humanizeWorkflowStatus(value: unknown) {
  const s = String(value ?? "").trim()
  if (!s) return "—"
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function parseJsonArray<T = Record<string, unknown>>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }
  return []
}

function workflowStatusStyle(status: string): CSSProperties {
  const s = status.toLowerCase()
  if (s.includes("complete") || s.includes("approved")) {
    return { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }
  }
  if (s.includes("reject")) {
    return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }
  }
  if (s.includes("progress")) {
    return { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" }
  }
  if (s.includes("review") || s.includes("pending")) {
    return { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }
  }
  if (s.includes("assign")) {
    return { background: "#e0e7ff", color: "#3730a3", border: "1px solid #a5b4fc" }
  }
  return {
    background: COLORS.bgGray,
    color: COLORS.textPrimary,
    border: `1px solid ${COLORS.border}`,
  }
}

function accessLevelStyle(level: string): CSSProperties {
  const s = level.toLowerCase()
  if (s.includes("admin")) {
    return { background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" }
  }
  if (s.includes("approve")) {
    return { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }
  }
  if (s.includes("write")) {
    return { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #93c5fd" }
  }
  return { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }
}

function auditTypeStyle(type: string): CSSProperties {
  const s = type.toLowerCase()
  if (s.includes("external")) {
    return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }
  }
  if (s.includes("compliance")) {
    return { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }
  }
  if (s.includes("surveillance")) {
    return { background: "#e0e7ff", color: "#3730a3", border: "1px solid #a5b4fc" }
  }
  return { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" }
}

function getReviewRealtimeState(nextReviewDate?: string | null) {
  if (!nextReviewDate) {
    return {
      label: "Completed",
      style: { background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" } satisfies CSSProperties,
    }
  }

  const now = new Date()
  const due = new Date(nextReviewDate)
  if (Number.isNaN(due.getTime())) {
    return {
      label: "Scheduled",
      style: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" } satisfies CSSProperties,
    }
  }

  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) {
    return {
      label: "Overdue",
      style: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" } satisfies CSSProperties,
    }
  }
  if (diffDays === 0) {
    return {
      label: "Due today",
      style: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" } satisfies CSSProperties,
    }
  }
  if (diffDays <= 14) {
    return {
      label: "Upcoming",
      style: { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" } satisfies CSSProperties,
    }
  }
  return {
    label: "Scheduled",
    style: { background: "#e0f2fe", color: "#075985", border: "1px solid #7dd3fc" } satisfies CSSProperties,
  }
}

/** Turn schema keys into readable labels (Issue date, not issueDate). */
function humanizeFieldKey(key: string): string {
  const fixed: Record<string, string> = {
    issueDate: "Issue date",
    expiryDate: "Expiry date",
    createdAt: "Created",
    updatedAt: "Last updated",
    categoryId: "Category ID",
    organizationId: "Organization",
  }
  if (fixed[key]) return fixed[key]
  const spaced = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")
  const trimmed = spaced.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const DETAIL_FIELD_PRIORITY = [
  "title",
  "name",
  "version",
  "location",
  "source",
  "status",
  "issueDate",
  "date",
  "expiryDate",
  "description",
  "cost",
]

function sortDetailEntries(entries: [string, unknown][]): [string, unknown][] {
  return [...entries].sort((a, b) => {
    const ia = DETAIL_FIELD_PRIORITY.indexOf(a[0])
    const ib = DETAIL_FIELD_PRIORITY.indexOf(b[0])
    const pa = ia === -1 ? 1000 : ia
    const pb = ib === -1 ? 1000 : ib
    if (pa !== pb) return pa - pb
    return a[0].localeCompare(b[0])
  })
}

function isWideDetailKey(key: string) {
  const k = key.toLowerCase()
  return k.includes("description") || k.includes("notes") || k.includes("content") || k.includes("remark") || k.includes("summary")
}

function formatDetailFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }
  const s = String(value).trim()
  if (!s) return "—"
  const lower = key.toLowerCase()
  if (lower.includes("date") || lower === "duedate") {
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) {
      return s.length > 12 ? d.toLocaleString() : d.toLocaleDateString()
    }
  }
  return s
}

function parseVersionNumber(input: unknown) {
  const text = String(input || "").trim().toLowerCase()
  const match = text.match(/v?\s*(\d+)/)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function UniversalTaskDetailPage() {
  const params = useParams<{ module: string; id: string }>()
  const searchParams = useSearchParams()
  const { isEmployee, user, isAuditor, isAdmin, isOrganization } = useAuth()
  const moduleSlug = params?.module || ""
  const id = params?.id || ""
  const backPath = searchParams.get("back") || `/${moduleSlug}`

  const visibleTabs = useMemo(() => (isEmployee ? [...EMPLOYEE_TABS] : [...FULL_TABS]), [isEmployee])

  const [activeTab, setActiveTab] = useState<(typeof FULL_TABS)[number]>("Details")
  const [item, setItem] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [savingReview, setSavingReview] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [savingVersion, setSavingVersion] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [savingPermission, setSavingPermission] = useState(false)
  const [employeeUsers, setEmployeeUsers] = useState<Array<{ id: string; name: string; role: string; email: string }>>([])
  const [selectedPermissionUserId, setSelectedPermissionUserId] = useState("")
  const [permissionUsersLoading, setPermissionUsersLoading] = useState(false)
  const [auditorPickerUsers, setAuditorPickerUsers] = useState<
    Array<{ id: string; name: string; role: string; email: string }>
  >([])
  const [auditorPickerLoading, setAuditorPickerLoading] = useState(false)
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [savingAudit, setSavingAudit] = useState(false)
  const [currentUserName, setCurrentUserName] = useState("Current User")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [reviewForm, setReviewForm] = useState({
    reviewerName: "",
    reviewDate: "",
    nextReviewDate: "",
    reviewDetails: "",
  })
  const [versionForm, setVersionForm] = useState({
    version: "",
    effectiveDate: "",
    changeSummary: "",
  })
  const [permissionForm, setPermissionForm] = useState({
    roleOrUser: "",
    accessLevel: "Read",
    permissionDetails: "",
    effectiveDate: "",
  })
  const [auditForm, setAuditForm] = useState({
    auditType: "Internal",
    auditDate: "",
    auditor: "",
    auditorUserId: "",
    status: "Open",
    findings: "",
  })

  const endpoint = useMemo(
    () => (moduleSlug === "manuals" ? `/api/manuals/${id}` : `/api/${moduleSlug}/${id}`),
    [moduleSlug, id]
  )

  const updateItem = async (payload: Record<string, unknown>) => {
    const token = localStorage.getItem("token")
    const response = await fetch(endpoint, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.error || "Failed to update task")
    }
    setItem(data)
    return data
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user")
      if (raw) {
        const parsed = JSON.parse(raw)
        const name = String(parsed?.name || "").trim()
        if (name) setCurrentUserName(name)
      }
    } catch (err) {
      console.warn("Could not read user from localStorage:", err)
    }
  }, [])

  useEffect(() => {
    if (!isEmployee) return
    setActiveTab((t) =>
      EMPLOYEE_TABS.includes(t as (typeof EMPLOYEE_TABS)[number]) ? t : "Details"
    )
  }, [isEmployee])

  useEffect(() => {
    const loadItem = async () => {
      if (!moduleSlug || !id) return
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")

        const response = await fetch(endpoint, {
          credentials: "include",
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error((data as { error?: string })?.error || "Failed to load task")
        }
        setItem(data as Record<string, unknown>)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task")
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [moduleSlug, id, endpoint])

  const title = useMemo(
    () => String(item?.title || item?.name || `${toTitle(moduleSlug)} Task`),
    [item, moduleSlug]
  )

  const detailEntries = useMemo(() => {
    if (!item) return []
    const hidden = new Set([
      "_id",
      "__v",
      "createdAt",
      "updatedAt",
      "category",
      "categoryId",
      "createdBy",
      "archived",
      "isArchived",
      "approved",
      "highlighted",
      "paused",
      "fileData",
      "reviews",
      "versionHistory",
      "permissionsHistory",
      "audits",
      "taskAssignees",
      "workflowHistory",
      "workflowStatus",
      "status",
      "title",
      "name",
      "organizationId",
      "expiryNotificationSentAt",
      "expiryNotificationRecipients",
    ])
    const raw = Object.entries(item).filter(
      ([key, value]) => !hidden.has(key) && value !== undefined && value !== null && value !== ""
    ) as [string, unknown][]
    return sortDetailEntries(raw)
  }, [item])

  const taskAssigneesList = useMemo(() => parseJsonArray(item?.taskAssignees), [item])

  const categoryLabel = useMemo(() => {
    if (!item) return ""
    const categoryName = item?.category?.name
    if (categoryName) return String(categoryName)
    const rawCategory =
      item?.category?._id ||
      item?.categoryId ||
      (typeof item?.category === "string" ? item.category : "")
    return rawCategory ? String(rawCategory) : ""
  }, [item])

  const reviews = useMemo(() => {
    if (!Array.isArray(item?.reviews)) return []
    return item.reviews
  }, [item])

  const permissionsHistory = useMemo(() => {
    if (!Array.isArray(item?.permissionsHistory)) return []
    return [...item.permissionsHistory].sort((a: any, b: any) => {
      const aTime = new Date(a?.effectiveDate || a?.createdAt || 0).getTime()
      const bTime = new Date(b?.effectiveDate || b?.createdAt || 0).getTime()
      return bTime - aTime
    })
  }, [item])

  const rawAudits = useMemo(
    () => (Array.isArray(item?.audits) ? item.audits : []),
    [item]
  )

  const assignedPeople = useMemo(() => {
    const merged = new Map<
      string,
      {
        userId?: string
        name: string
        email?: string
        dueDate?: string
        assignedAt?: string
        accessLevel?: string
      }
    >()

    taskAssigneesList.forEach((entry: Record<string, unknown>, idx: number) => {
      const userId = String(entry.userId || "").trim()
      const email = String(entry.email || "").trim()
      const name = String(entry.name || email || `Assignee ${idx + 1}`).trim()
      const key = (userId || email || name).toLowerCase()
      if (!key) return

      merged.set(key, {
        userId: userId || undefined,
        name,
        email: email || undefined,
        dueDate: entry.dueDate ? String(entry.dueDate) : undefined,
        assignedAt: entry.assignedAt ? String(entry.assignedAt) : undefined,
      })
    })

    permissionsHistory.forEach((entry: any, idx: number) => {
      const userId = String(entry?.userId || "").trim()
      const email = String(entry?.userEmail || "").trim()
      const name = String(entry?.roleOrUser || email || `Assignee ${idx + 1}`).trim()
      const key = (userId || email || name).toLowerCase()
      if (!key) return

      const existing = merged.get(key)
      merged.set(key, {
        userId: existing?.userId || userId || undefined,
        name: existing?.name || name,
        email: existing?.email || email || undefined,
        dueDate: existing?.dueDate,
        assignedAt: existing?.assignedAt || entry?.effectiveDate || entry?.createdAt || undefined,
        accessLevel: existing?.accessLevel || (entry?.accessLevel ? String(entry.accessLevel) : undefined),
      })
    })

    rawAudits.forEach((entry: Record<string, unknown>, idx: number) => {
      const rawId = entry?.auditorUserId
      let userId = ""
      if (rawId != null && typeof rawId !== "object") userId = String(rawId).trim()
      else if (rawId && typeof rawId === "object") {
        const oid = (rawId as { toString?: () => string }).toString?.()
        if (oid) userId = oid.trim()
      }
      const emailRaw = String(entry.auditorEmail || "").trim()
      const displayName = String(entry.auditor || "").trim()
      if (!userId && !emailRaw && !displayName) return

      const emailKey = emailRaw.toLowerCase()
      const key = (userId || emailKey || displayName.toLowerCase() || `audit-${idx}`).toLowerCase()

      const auditType = entry.auditType ? String(entry.auditType) : ""
      const auditStatus =
        entry.status != null && String(entry.status).trim() !== "" ? String(entry.status) : ""
      const auditDate = entry.auditDate ? String(entry.auditDate) : undefined
      const createdAt = entry.createdAt ? String(entry.createdAt) : undefined
      const auditLabel =
        [auditType && `${auditType} audit`, auditStatus].filter(Boolean).join(" · ") || "Auditor"

      const existing = merged.get(key)
      const prevLevel = existing?.accessLevel
      const parts = prevLevel ? prevLevel.split(" · ") : []
      if (auditLabel && !parts.includes(auditLabel)) parts.push(auditLabel)
      const accessLevel = parts.length ? parts.join(" · ") : undefined

      merged.set(key, {
        userId: existing?.userId || userId || undefined,
        name: existing?.name || displayName || emailRaw || `Auditor ${idx + 1}`,
        email: existing?.email || emailRaw || undefined,
        dueDate: existing?.dueDate || auditDate,
        assignedAt: existing?.assignedAt || createdAt,
        accessLevel,
      })
    })

    return Array.from(merged.values())
  }, [permissionsHistory, taskAssigneesList, rawAudits])

  const auditsSortedDesc = useMemo(() => {
    if (!Array.isArray(item?.audits)) return []
    return [...item.audits].sort((a: any, b: any) => {
      const aTime = new Date(a?.auditDate || a?.createdAt || 0).getTime()
      const bTime = new Date(b?.auditDate || b?.createdAt || 0).getTime()
      return bTime - aTime
    })
  }, [item])

  /** Organization, employees (incl. read-only viewers), and admins see all document audits; assigned auditors see only their rows. */
  const audits = useMemo(() => {
    if (!isAuditor || isAdmin) return auditsSortedDesc

    const uid = user?.id != null ? String(user.id).trim() : ""
    const myEmail = String(user?.email || "").trim().toLowerCase()
    const myName = String(user?.name || "").trim().toLowerCase()

    return auditsSortedDesc.filter((a: Record<string, unknown>) => {
      const rawId = a?.auditorUserId
      let aid = rawId != null ? String(rawId).trim() : ""
      if (rawId && typeof rawId === "object") {
        const oid = (rawId as { toString?: () => string }).toString?.()
        if (oid) aid = oid
      }
      if (uid && aid && uid === aid) return true

      const email = String(a?.auditorEmail || "").trim().toLowerCase()
      if (myEmail && email && email === myEmail) return true

      const name = String(a?.auditor || "").trim().toLowerCase()
      if (myName && name && name === myName) return true

      return false
    })
  }, [auditsSortedDesc, isAuditor, isAdmin, user?.id, user?.email, user?.name])

  const reviewSummary = useMemo(() => {
    const overdue = reviews.filter((review: any) => getReviewRealtimeState(review?.nextReviewDate).label === "Overdue").length
    const upcoming = reviews.filter((review: any) => {
      const state = getReviewRealtimeState(review?.nextReviewDate).label
      return state === "Upcoming" || state === "Due today"
    }).length
    return {
      total: reviews.length,
      overdue,
      upcoming,
    }
  }, [reviews])

  const permissionSummary = useMemo(() => {
    const elevated = permissionsHistory.filter((entry: any) => {
      const level = String(entry?.accessLevel || "").toLowerCase()
      return level === "write" || level === "approve" || level === "admin"
    }).length
    return {
      total: permissionsHistory.length,
      elevated,
      latest: permissionsHistory[0]?.effectiveDate || permissionsHistory[0]?.createdAt || null,
    }
  }, [permissionsHistory])

  const auditSummary = useMemo(() => {
    const open = audits.filter((audit: any) => String(audit?.status || "").toLowerCase() === "open").length
    const inProgress = audits.filter((audit: any) => String(audit?.status || "").toLowerCase() === "in progress").length
    return {
      total: audits.length,
      open,
      inProgress,
    }
  }, [audits])

  const versionHistory = useMemo(() => {
    const existingRaw = Array.isArray(item?.versionHistory) ? item.versionHistory : []
    const existing = [...existingRaw]
    const hasExisting = existing.length > 0

    if (!hasExisting) {
      existing.push({
        version: item?.version || "v1.0",
        effectiveDate: item?.issueDate || item?.createdAt || new Date().toISOString(),
        changeSummary: "Initial version created.",
        updatedBy: currentUserName,
        createdAt: item?.createdAt || new Date().toISOString(),
      })
    }

    // Backfill missing numbered versions (v1..vN) for old records
    // where history was not tracked before this feature existed.
    const currentVersionNumber = parseVersionNumber(item?.version)
    if (currentVersionNumber && currentVersionNumber > 1) {
      const existingNumbers = new Set(
        existing
          .map((entry: any) => parseVersionNumber(entry?.version))
          .filter((n: number | null): n is number => n !== null)
      )

      for (let i = 1; i <= currentVersionNumber; i += 1) {
        if (!existingNumbers.has(i)) {
          existing.push({
            version: `v${i}`,
            effectiveDate: item?.issueDate || item?.createdAt || new Date().toISOString(),
            changeSummary:
              i === 1
                ? "Initial version (auto-restored from legacy record)."
                : "Historical version (auto-restored from legacy record).",
            updatedBy: currentUserName,
            createdAt: item?.createdAt || new Date().toISOString(),
            autoGenerated: true,
          })
        }
      }
    }

    return existing
  }, [item, currentUserName])

  const defaultVersionEntry = useMemo(
    () => [
      {
        version: item?.version || "v1.0",
        effectiveDate: item?.issueDate || item?.createdAt || new Date().toISOString(),
        changeSummary: "Initial version created.",
        updatedBy: currentUserName,
        createdAt: item?.createdAt || new Date().toISOString(),
      },
    ],
    [item, currentUserName]
  )

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ""))
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(file)
      })

      await updateItem({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileData,
        uploadedAt: new Date().toISOString(),
        versionHistory: [
          ...(Array.isArray(item?.versionHistory) ? item.versionHistory : []),
          {
            version: item?.version || "v1.0",
            effectiveDate: new Date().toISOString(),
            changeSummary: `Document uploaded: ${file.name}`,
            fileName: file.name,
            updatedBy: currentUserName,
            createdAt: new Date().toISOString(),
          },
        ],
      })
      alert("Document uploaded successfully")
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Failed to upload document")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDownloadFile = async () => {
    if (item?.fileData && item?.fileName) {
      const link = document.createElement("a")
      link.href = String(item.fileData)
      link.download = String(item.fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
    alert("No uploaded document available for download.")
  }

  const handleSaveReview = async () => {
    if (!reviewForm.reviewerName.trim() || !reviewForm.reviewDate) {
      alert("Reviewer Name and Review Date are required")
      return
    }
    setSavingReview(true)
    try {
      const nextReviews = [
        ...(Array.isArray(item?.reviews) ? item.reviews : []),
        {
          reviewerName: reviewForm.reviewerName.trim(),
          reviewDate: reviewForm.reviewDate,
          nextReviewDate: reviewForm.nextReviewDate || null,
          reviewDetails: reviewForm.reviewDetails.trim(),
          createdAt: new Date().toISOString(),
        },
      ]

      await updateItem({ reviews: nextReviews })
      setShowReviewModal(false)
      setReviewForm({
        reviewerName: "",
        reviewDate: "",
        nextReviewDate: "",
        reviewDetails: "",
      })
    } catch (err) {
      console.error("Save review failed:", err)
      alert("Failed to save review")
    } finally {
      setSavingReview(false)
    }
  }

  const handleSaveVersion = async () => {
    if (!versionForm.version.trim()) {
      alert("Version is required")
      return
    }

    const now = new Date().toISOString()
    setSavingVersion(true)
    try {
      const nextHistory = [
        ...(Array.isArray(item?.versionHistory) && item.versionHistory.length > 0 ? item.versionHistory : defaultVersionEntry),
        {
          version: versionForm.version.trim(),
          effectiveDate: versionForm.effectiveDate || now,
          changeSummary: versionForm.changeSummary.trim() || "Version updated.",
          updatedBy: currentUserName,
          createdAt: now,
        },
      ]

      await updateItem({
        version: versionForm.version.trim(),
        issueDate: versionForm.effectiveDate || item?.issueDate || now,
        versionHistory: nextHistory,
      })

      setShowVersionModal(false)
      setVersionForm({
        version: "",
        effectiveDate: "",
        changeSummary: "",
      })
    } catch (err) {
      console.error("Save version failed:", err)
      alert("Failed to save version")
    } finally {
      setSavingVersion(false)
    }
  }

  const handleSavePermission = async () => {
    if (!permissionForm.roleOrUser.trim()) {
      alert("Employee is required")
      return
    }
    const now = new Date().toISOString()
    const selectedUser = employeeUsers.find((u) => u.id === selectedPermissionUserId)
    setSavingPermission(true)
    try {
      const nextPermissions = [
        ...(Array.isArray(item?.permissionsHistory) ? item.permissionsHistory : []),
        {
          roleOrUser: permissionForm.roleOrUser.trim(),
          userId: selectedPermissionUserId || undefined,
          userEmail: selectedUser?.email || undefined,
          accessLevel: permissionForm.accessLevel,
          permissionDetails: permissionForm.permissionDetails.trim(),
          effectiveDate: permissionForm.effectiveDate || now,
          updatedBy: currentUserName,
          createdAt: now,
        },
      ]
      await updateItem({ permissionsHistory: nextPermissions })
      setShowPermissionModal(false)
      setPermissionForm({
        roleOrUser: "",
        accessLevel: "Read",
        permissionDetails: "",
        effectiveDate: "",
      })
      setSelectedPermissionUserId("")
    } catch (err) {
      console.error("Save permission failed:", err)
      alert("Failed to save permission")
    } finally {
      setSavingPermission(false)
    }
  }

  const loadPermissionUsers = async () => {
    try {
      setPermissionUsersLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users?role=employee", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error("Failed to load users")
      const data = await response.json()
      const normalized = (Array.isArray(data) ? data : [])
        .map((u: any) => ({
          id: String(u?._id || u?.id || ""),
          name: String(u?.name || "Unknown User"),
          role: String(u?.role || "Employee"),
          email: String(u?.email || ""),
        }))
        .filter((u: { id: string }) => Boolean(u.id))
      setEmployeeUsers(normalized.filter((u) => String(u.role).toLowerCase() === "employee"))
    } catch (err) {
      console.error("Failed to load permission users:", err)
      setEmployeeUsers([])
    } finally {
      setPermissionUsersLoading(false)
    }
  }

  const loadAuditorsForAuditModal = async () => {
    try {
      setAuditorPickerLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users?role=auditor", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error("Failed to load auditors")
      const data = await response.json()
      const normalized = (Array.isArray(data) ? data : [])
        .map((u: any) => ({
          id: String(u?._id || u?.id || ""),
          name: String(u?.name || "Unknown User"),
          role: String(u?.role || "Auditor"),
          email: String(u?.email || ""),
        }))
        .filter((u: { id: string }) => Boolean(u.id))
      setAuditorPickerUsers(normalized.filter((u) => String(u.role).toLowerCase() === "auditor"))
    } catch (err) {
      console.error("Failed to load auditors:", err)
      setAuditorPickerUsers([])
    } finally {
      setAuditorPickerLoading(false)
    }
  }

  useEffect(() => {
    if (!showPermissionModal) return
    loadPermissionUsers()
  }, [showPermissionModal])

  useEffect(() => {
    if (!showAuditModal) return
    void loadAuditorsForAuditModal()
  }, [showAuditModal])

  const handleSaveAudit = async () => {
    if (!auditForm.auditorUserId.trim() || !auditForm.auditDate) {
      alert("Please select an auditor (from your organization) and an audit date.")
      return
    }
    const selectedAuditor = auditorPickerUsers.find((u) => u.id === auditForm.auditorUserId.trim())
    const now = new Date().toISOString()
    setSavingAudit(true)
    try {
      const nextAudits = [
        ...(Array.isArray(item?.audits) ? item.audits : []),
        {
          auditType: auditForm.auditType,
          auditDate: auditForm.auditDate,
          auditor: String(selectedAuditor?.name || auditForm.auditor || "").trim(),
          auditorUserId: auditForm.auditorUserId.trim(),
          auditorEmail: selectedAuditor?.email?.trim() || undefined,
          status: auditForm.status,
          findings: auditForm.findings.trim(),
          updatedBy: currentUserName,
          createdAt: now,
        },
      ]
      await updateItem({ audits: nextAudits })
      setShowAuditModal(false)
      setAuditForm({
        auditType: "Internal",
        auditDate: "",
        auditor: "",
        auditorUserId: "",
        status: "Open",
        findings: "",
      })
    } catch (err) {
      console.error("Save audit failed:", err)
      alert("Failed to save audit")
    } finally {
      setSavingAudit(false)
    }
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-[#eef1f7] to-slate-200/90"
      >
        <div className="ui-card-main flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/95 px-12 py-10 shadow-xl backdrop-blur-sm">
          <div
            className="h-11 w-11 animate-spin rounded-full border-[3px] border-violet-100 border-t-violet-600"
            aria-hidden
          />
          <p className="text-[0.9375rem] font-semibold tracking-tight text-slate-600">Loading record…</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-[#eef1f7] to-slate-200/90 px-5 py-10">
        <div className="ui-page-shell">
          <div className="ui-card-main rounded-3xl border border-red-100 bg-white px-8 py-12 text-center shadow-lg">
            <p className="ui-section-title mb-2 text-red-900">Something went wrong</p>
            <p className="text-[0.9375rem] leading-relaxed text-slate-600">{error || "Task not found"}</p>
            <Link
              href={backPath}
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
              style={{ background: COLORS.primaryGradient }}
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const modulePretty = toTitle(moduleSlug)

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100 via-[#eef1f7] to-slate-200/90 pb-14"
      style={{ fontFamily: "var(--font-app-sans), ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="ui-task-detail-shell">
        <div className="mb-5">
          <Link
            href={backPath}
            aria-label={`Back to ${toTitle(backPath.replace("/", ""))}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-violet-700 transition hover:bg-white/90 hover:text-violet-900 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>

        <article
          className="ui-card-main w-full overflow-hidden rounded-3xl border-x-0 border-t-0 border-b border-slate-200/75 bg-white/95 pb-px shadow-2xl backdrop-blur-[2px]"
          style={{ boxShadow: "0 24px 56px -26px rgba(15, 23, 42, 0.22)" }}
        >
          <header className="relative border-b border-slate-200/70 px-4 py-9 sm:px-6 sm:py-10">
            <div className="pointer-events-none absolute inset-0 opacity-95 bg-[linear-gradient(125deg,#faf5ff_0%,#f8fafc_38%,#eff6ff_100%)]" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-12 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex flex-wrap items-center gap-3">
                <span
                  className="rounded-full border border-violet-200/70 bg-white/90 px-3.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-violet-800 shadow-sm"
                >
                  {modulePretty.replace(/s$/, "")}
                </span>
                <span className="text-[0.8125rem] font-semibold tracking-tight text-violet-600">
                  Controlled document overview
                </span>
              </div>
              <h1 className="ui-display-title max-w-[min(52rem,100%)] bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-700 bg-clip-text text-transparent">
                {title}
              </h1>
              <div
                className="mt-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-violet-200/90 bg-gradient-to-r from-violet-50 via-indigo-50/90 to-fuchsia-50/80 px-5 py-3 text-[0.8125rem] font-medium leading-snug text-violet-950 shadow-sm"
              >
                {isEmployee ? (
                  <>
                    <span className="font-semibold text-violet-900">{user?.name || currentUserName}</span>
                    {categoryLabel ? <span className="text-violet-400">·</span> : null}
                    {categoryLabel ? <span className="text-indigo-900">{categoryLabel}</span> : null}
                    <span className="text-violet-400">·</span>
                    <span className="text-fuchsia-950/90">{modulePretty.replace(/s$/, "")} record</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-violet-900">Open session —</span>
                    <span className="text-violet-800/90">{new Date().toLocaleString()}</span>
                    <span className="text-violet-400">·</span>
                    <span className="font-medium text-indigo-900">{currentUserName}</span>
                  </>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/70 bg-gradient-to-b from-slate-50 to-slate-50/40 px-3 py-3 sm:gap-3 sm:px-6">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold tracking-tight transition ${
                  activeTab === tab ? "ui-tab-pill-active text-violet-900" : "ui-tab-pill-idle rounded-xl bg-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDownloadFile}
              className="ml-auto inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-violet-800 shadow-sm transition hover:bg-violet-50"
              style={{ borderColor: "#ddd6fe", background: "rgba(255,255,255,0.9)" }}
            >
              <Download className="h-4 w-4" aria-hidden /> Download
            </button>
          </div>

          <div className="px-4 py-8 sm:px-6 sm:py-10">
            {activeTab === "Details" && (
            <div className="grid grid-cols-1 gap-8 text-slate-900 md:grid-cols-2 md:gap-x-12 md:gap-y-8">
              {!isEmployee && categoryLabel ? (
                <div className="min-w-0 rounded-2xl border border-violet-200/85 bg-gradient-to-br from-violet-100/90 via-fuchsia-50/50 to-indigo-50/80 p-5 shadow-sm">
                  <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-violet-700">Category</p>
                  <div className={`text-base font-semibold ${detailPanelStyle(0).value}`}>{categoryLabel}</div>
                </div>
              ) : null}

              {!isEmployee &&
              item?.workflowStatus !== undefined &&
              item?.workflowStatus !== null &&
              String(item.workflowStatus).trim() !== "" ? (
                <div className="min-w-0 rounded-2xl border border-fuchsia-200/70 bg-gradient-to-br from-fuchsia-50/90 to-white p-5 shadow-sm">
                  <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-fuchsia-800">Workflow status</p>
                  <div className="inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-semibold" style={workflowStatusStyle(String(item.workflowStatus))}>
                    {humanizeWorkflowStatus(item.workflowStatus)}
                  </div>
                </div>
              ) : null}

              {!isEmployee &&
              item?.status !== undefined &&
              item?.status !== null &&
              String(item.status).trim() !== "" ? (
                <div className="min-w-0 rounded-2xl border border-sky-200/75 bg-gradient-to-br from-sky-50/95 to-cyan-50/40 p-5 shadow-sm">
                  <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-sky-800">Status</p>
                  <div className="inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-semibold" style={workflowStatusStyle(String(item.status))}>
                    {humanizeWorkflowStatus(item.status)}
                  </div>
                </div>
              ) : null}

              {!isEmployee && assignedPeople.length > 0 ? (
                <div className="md:col-span-2">
                  <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-emerald-800">Assigned ({assignedPeople.length})</p>
                  <div className="mb-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-100/85 via-teal-50/90 to-cyan-50/50 px-5 py-4 shadow-sm">
                    <p className="text-sm font-semibold text-emerald-950">
                      {assignedPeople.length} {assignedPeople.length === 1 ? "person" : "people"} assigned
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-emerald-900/90">
                      {assignedPeople
                        .map((a: Record<string, unknown>) => String(a.name || a.email || "Assignee"))
                        .join(", ")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {assignedPeople.map((a: Record<string, unknown>, idx: number) => (
                      <div
                        key={`${String(a.userId ?? idx)}-${idx}`}
                        className={`min-w-0 rounded-2xl border p-5 shadow-sm ${
                          idx % 2 === 0
                            ? "border-sky-200/75 bg-gradient-to-br from-sky-50 to-blue-50/80"
                            : "border-rose-200/70 bg-gradient-to-br from-rose-50 to-orange-50/70"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">
                          {String(a.name || a.email || "Assignee")}
                        </p>
                        {a.email ? (
                          <p className="mt-0.5 text-sm text-slate-800">{String(a.email)}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                          {a.dueDate ? <span>Due: {formatDate(String(a.dueDate))}</span> : null}
                          {a.assignedAt ? <span>Assigned: {formatDateTime(String(a.assignedAt))}</span> : null}
                          {a.accessLevel ? <span>Access: {String(a.accessLevel)}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {detailEntries.map(([key, value], idx) => {
                const pane = detailPanelStyle(idx)
                return (
                  <div
                    key={key}
                    className={`min-w-0 rounded-2xl border p-5 shadow-sm ${pane.shell} ${isWideDetailKey(key) ? "md:col-span-2" : ""}`}
                  >
                    <p className={`mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] ${pane.label}`}>{humanizeFieldKey(key)}</p>
                    <div className={`whitespace-pre-wrap break-words text-[0.9375rem] font-medium leading-relaxed ${pane.value}`}>
                      {formatDetailFieldValue(key, value)}
                    </div>
                  </div>
                )
              })}
            </div>
            )}

          {activeTab === "Document" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.primary, color: COLORS.textWhite, opacity: uploading ? 0.7 : 1 }}
                >
                  {uploading ? "Uploading..." : "Add Document From Computer"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleUploadFile}
                />
              </div>

              {item?.fileName ? (
                <div className="p-4 rounded-lg border" style={{ borderColor: COLORS.border }}>
                  <p style={{ color: COLORS.textPrimary }}><strong>File:</strong> {String(item.fileName)}</p>
                  <p style={{ color: COLORS.textSecondary }}><strong>Type:</strong> {String(item.fileType || "-")}</p>
                  <p style={{ color: COLORS.textSecondary }}><strong>Size:</strong> {item.fileSize ? `${Math.round(Number(item.fileSize) / 1024)} KB` : "-"}</p>
                </div>
              ) : (
                <p style={{ color: COLORS.textSecondary }}>No document uploaded yet.</p>
              )}
            </div>
          )}

          {activeTab === "Version history" && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setVersionForm({
                    version: String(item?.version || ""),
                    effectiveDate: String(item?.issueDate || "").slice(0, 10),
                    changeSummary: "",
                  })
                  setShowVersionModal(true)
                }}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: COLORS.blue900, color: COLORS.textWhite }}
              >
                Add Version
              </button>

              <div className="space-y-3">
                {[...versionHistory]
                  .sort((a: any, b: any) => {
                    const aVersion = parseVersionNumber(a?.version)
                    const bVersion = parseVersionNumber(b?.version)
                    if (aVersion !== null && bVersion !== null && aVersion !== bVersion) {
                      return bVersion - aVersion
                    }
                    const aTime = new Date(a?.effectiveDate || a?.createdAt || 0).getTime()
                    const bTime = new Date(b?.effectiveDate || b?.createdAt || 0).getTime()
                    return bTime - aTime
                  })
                  .map((entry: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: COLORS.border }}>
                    <p style={{ color: COLORS.textPrimary }}><strong>Version:</strong> {entry.version || "-"}</p>
                    <p style={{ color: COLORS.textSecondary }}><strong>Effective Date:</strong> {formatDate(entry.effectiveDate || entry.createdAt)}</p>
                    <p style={{ color: COLORS.textSecondary }}><strong>Summary:</strong> {entry.changeSummary || "-"}</p>
                    <p style={{ color: COLORS.textSecondary }}><strong>Updated By:</strong> {entry.updatedBy || "Current User"}</p>
                    {entry.fileName && (
                      <p style={{ color: COLORS.textSecondary }}><strong>File:</strong> {entry.fileName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: COLORS.bgGray }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Total reviews</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>{reviewSummary.total}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: "#fef2f2" }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Overdue</p>
                  <p className="text-2xl font-semibold" style={{ color: "#991b1b" }}>{reviewSummary.overdue}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: "#eff6ff" }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Upcoming</p>
                  <p className="text-2xl font-semibold" style={{ color: "#1d4ed8" }}>{reviewSummary.upcoming}</p>
                </div>
              </div>

              {!isEmployee ? (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.blue900, color: COLORS.textWhite }}
                >
                  Add Review
                </button>
              ) : null}

              {reviews.length === 0 ? (
                <div className="py-10 text-center" style={{ color: COLORS.textSecondary }}>
                  No reviews available for this document.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border" style={{ borderColor: COLORS.border, background: COLORS.bgWhite }}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: COLORS.textPrimary }}>{review.reviewerName || "Reviewer"}</p>
                          <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                            Reviewed on {formatDate(review.reviewDate)}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={getReviewRealtimeState(review.nextReviewDate).style}>
                          {getReviewRealtimeState(review.nextReviewDate).label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="rounded-lg border px-3 py-2" style={{ borderColor: COLORS.border }}>
                          <p className="text-xs uppercase" style={{ color: COLORS.textSecondary }}>Next review</p>
                          <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                            {review.nextReviewDate ? formatDate(review.nextReviewDate) : "Not scheduled"}
                          </p>
                        </div>
                        <div className="rounded-lg border px-3 py-2" style={{ borderColor: COLORS.border }}>
                          <p className="text-xs uppercase" style={{ color: COLORS.textSecondary }}>Created</p>
                          <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                            {formatDateTime(review.createdAt || review.reviewDate)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mt-4" style={{ color: COLORS.textSecondary }}>
                        {review.reviewDetails || "No review notes added."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Permissions" && !isEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: COLORS.bgGray }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Total permissions</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>{permissionSummary.total}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: "#eff6ff" }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Write or above</p>
                  <p className="text-2xl font-semibold" style={{ color: "#1d4ed8" }}>{permissionSummary.elevated}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: "#f9fafb" }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Latest effective date</p>
                  <p className="text-base font-semibold" style={{ color: COLORS.textPrimary }}>
                    {permissionSummary.latest ? formatDate(permissionSummary.latest) : "N/A"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPermissionModal(true)}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: COLORS.blue900, color: COLORS.textWhite }}
              >
                Add Permission
              </button>

              {permissionsHistory.length === 0 ? (
                <div className="py-10 text-center" style={{ color: COLORS.textSecondary }}>
                  No permissions records available for this document.
                </div>
              ) : (
                <div className="space-y-3">
                  {permissionsHistory.map((entry: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border" style={{ borderColor: COLORS.border, background: COLORS.bgWhite }}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: COLORS.textPrimary }}>{entry.roleOrUser || "-"}</p>
                          <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                            Effective {formatDate(entry.effectiveDate || entry.createdAt)}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={accessLevelStyle(String(entry.accessLevel || "Read"))}>
                          {entry.accessLevel || "Read"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="rounded-lg border px-3 py-2" style={{ borderColor: COLORS.border }}>
                          <p className="text-xs uppercase" style={{ color: COLORS.textSecondary }}>Updated by</p>
                          <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                            {entry.updatedBy || "Current User"}
                          </p>
                        </div>
                        <div className="rounded-lg border px-3 py-2" style={{ borderColor: COLORS.border }}>
                          <p className="text-xs uppercase" style={{ color: COLORS.textSecondary }}>Employee email</p>
                          <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                            {entry.userEmail || "Not linked"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mt-4" style={{ color: COLORS.textSecondary }}>
                        {entry.permissionDetails || "No permission notes added."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Audits" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: COLORS.bgGray }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Total audits</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>{auditSummary.total}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: "#fef2f2" }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>Open</p>
                  <p className="text-2xl font-semibold" style={{ color: "#991b1b" }}>{auditSummary.open}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: "#eff6ff" }}>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>In progress</p>
                  <p className="text-2xl font-semibold" style={{ color: "#1d4ed8" }}>{auditSummary.inProgress}</p>
                </div>
              </div>

              {(isOrganization || isAdmin) ? (
                <button
                  onClick={() => setShowAuditModal(true)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.blue900, color: COLORS.textWhite }}
                >
                  Add Audit
                </button>
              ) : null}

              {audits.length === 0 ? (
                <div className="py-10 text-center" style={{ color: COLORS.textSecondary }}>
                  {isAuditor && !isAdmin
                    ? "No audits on this document are assigned to you yet. Your organization assigns auditors when they add an audit."
                    : "No audits available for this document."}
                </div>
              ) : (
                <div className="space-y-3">
                  {audits.map((audit: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border" style={{ borderColor: COLORS.border, background: COLORS.bgWhite }}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: COLORS.textPrimary }}>{audit.auditor || "Auditor not set"}</p>
                          <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                            Audit date {formatDate(audit.auditDate || audit.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={auditTypeStyle(String(audit.auditType || "Internal"))}>
                            {audit.auditType || "Internal"}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={workflowStatusStyle(String(audit.status || "Open"))}>
                            {audit.status || "Open"}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="rounded-lg border px-3 py-2" style={{ borderColor: COLORS.border }}>
                          <p className="text-xs uppercase" style={{ color: COLORS.textSecondary }}>Updated by</p>
                          <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                            {audit.updatedBy || "Current User"}
                          </p>
                        </div>
                        <div className="rounded-lg border px-3 py-2" style={{ borderColor: COLORS.border }}>
                          <p className="text-xs uppercase" style={{ color: COLORS.textSecondary }}>Created</p>
                          <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                            {formatDateTime(audit.createdAt || audit.auditDate)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mt-4" style={{ color: COLORS.textSecondary }}>
                        {audit.findings || "No findings recorded."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab !== "Details" && activeTab !== "Document" && activeTab !== "Version history" && activeTab !== "Reviews" && activeTab !== "Permissions" && activeTab !== "Audits" && (
            <div className="py-10 text-center" style={{ color: COLORS.textSecondary }}>
              {activeTab} tab is ready.
            </div>
          )}
          </div>

        </article>

        {showReviewModal && !isEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="w-full max-w-xl rounded-2xl p-6" style={{ background: COLORS.bgWhite }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-semibold" style={{ color: COLORS.textPrimary }}>Add Review</h3>
                <button onClick={() => setShowReviewModal(false)} style={{ color: COLORS.textSecondary }}>X</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Reviewer Name</label>
                  <input
                    type="text"
                    value={reviewForm.reviewerName}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewerName: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Review Date</label>
                  <input
                    type="date"
                    value={reviewForm.reviewDate}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Next Review Date (Optional)</label>
                  <input
                    type="date"
                    value={reviewForm.nextReviewDate}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, nextReviewDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Review Details</label>
                  <textarea
                    value={reviewForm.reviewDetails}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewDetails: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>

                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: COLORS.bgGray }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                        {reviewForm.reviewerName.trim() || "Reviewer preview"}
                      </p>
                      <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                        Review date: {reviewForm.reviewDate ? formatDate(reviewForm.reviewDate) : "Not selected"}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={getReviewRealtimeState(reviewForm.nextReviewDate || null).style}>
                      {getReviewRealtimeState(reviewForm.nextReviewDate || null).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReview}
                  disabled={savingReview}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.blue900, color: COLORS.textWhite, opacity: savingReview ? 0.7 : 1 }}
                >
                  {savingReview ? "Saving..." : "Add Review"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showVersionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="w-full max-w-xl rounded-2xl p-6" style={{ background: COLORS.bgWhite }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-semibold" style={{ color: COLORS.textPrimary }}>Add Version</h3>
                <button onClick={() => setShowVersionModal(false)} style={{ color: COLORS.textSecondary }}>X</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Version</label>
                  <input
                    type="text"
                    value={versionForm.version}
                    onChange={(e) => setVersionForm((prev) => ({ ...prev, version: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Effective Date</label>
                  <input
                    type="date"
                    value={versionForm.effectiveDate}
                    onChange={(e) => setVersionForm((prev) => ({ ...prev, effectiveDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Change Summary</label>
                  <textarea
                    value={versionForm.changeSummary}
                    onChange={(e) => setVersionForm((prev) => ({ ...prev, changeSummary: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVersion}
                  disabled={savingVersion}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.blue900, color: COLORS.textWhite, opacity: savingVersion ? 0.7 : 1 }}
                >
                  {savingVersion ? "Saving..." : "Add Version"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPermissionModal && !isEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="w-full max-w-xl rounded-2xl p-6" style={{ background: COLORS.bgWhite }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-semibold" style={{ color: COLORS.textPrimary }}>Add Permission</h3>
                <button
                  onClick={() => {
                    setShowPermissionModal(false)
                    setSelectedPermissionUserId("")
                  }}
                  style={{ color: COLORS.textSecondary }}
                >
                  X
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Employee</label>
                  <select
                    value={selectedPermissionUserId}
                    onChange={(e) => {
                      const userId = e.target.value
                      setSelectedPermissionUserId(userId)
                      const selected = employeeUsers.find((u) => u.id === userId)
                      setPermissionForm((prev) => ({
                        ...prev,
                        roleOrUser: selected ? `${selected.name} (${selected.role})` : "",
                      }))
                    }}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  >
                    <option value="">
                      {permissionUsersLoading ? "Loading employees..." : "Select employee"}
                    </option>
                    {employeeUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} - {u.role} ({u.email})
                      </option>
                    ))}
                  </select>
                  {!permissionUsersLoading && employeeUsers.length === 0 ? (
                    <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                      No employees found for this organization.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Access Level</label>
                  <select
                    value={permissionForm.accessLevel}
                    onChange={(e) => setPermissionForm((prev) => ({ ...prev, accessLevel: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  >
                    <option value="Read">Read</option>
                    <option value="Write">Write</option>
                    <option value="Approve">Approve</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Effective Date</label>
                  <input
                    type="date"
                    value={permissionForm.effectiveDate}
                    onChange={(e) => setPermissionForm((prev) => ({ ...prev, effectiveDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Permission Details</label>
                  <textarea
                    value={permissionForm.permissionDetails}
                    onChange={(e) => setPermissionForm((prev) => ({ ...prev, permissionDetails: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>

                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: COLORS.bgGray }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                        {permissionForm.roleOrUser || "Permission preview"}
                      </p>
                      <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                        Effective: {permissionForm.effectiveDate ? formatDate(permissionForm.effectiveDate) : "Not selected"}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={accessLevelStyle(permissionForm.accessLevel)}>
                      {permissionForm.accessLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowPermissionModal(false)
                    setSelectedPermissionUserId("")
                  }}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermission}
                  disabled={savingPermission}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.blue900, color: COLORS.textWhite, opacity: savingPermission ? 0.7 : 1 }}
                >
                  {savingPermission ? "Saving..." : "Add Permission"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAuditModal && (isOrganization || isAdmin) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="w-full max-w-xl rounded-2xl p-6" style={{ background: COLORS.bgWhite }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-semibold" style={{ color: COLORS.textPrimary }}>Add Audit</h3>
                <button onClick={() => setShowAuditModal(false)} style={{ color: COLORS.textSecondary }}>X</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Audit Type</label>
                  <select
                    value={auditForm.auditType}
                    onChange={(e) => setAuditForm((prev) => ({ ...prev, auditType: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  >
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Surveillance">Surveillance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Audit Date</label>
                  <input
                    type="date"
                    value={auditForm.auditDate}
                    onChange={(e) => setAuditForm((prev) => ({ ...prev, auditDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Auditor</label>
                  <select
                    value={auditForm.auditorUserId}
                    onChange={(e) => {
                      const nextId = e.target.value
                      const u = auditorPickerUsers.find((x) => x.id === nextId)
                      setAuditForm((prev) => ({
                        ...prev,
                        auditorUserId: nextId,
                        auditor: u?.name ?? "",
                      }))
                    }}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  >
                    <option value="">
                      {auditorPickerLoading ? "Loading auditors..." : "Select organization auditor"}
                    </option>
                    {auditorPickerUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                  {!auditorPickerLoading && auditorPickerUsers.length === 0 ? (
                    <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                      No auditors in your organization. Create an Auditor user under User management.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Status</label>
                  <select
                    value={auditForm.status}
                    onChange={(e) => setAuditForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Findings</label>
                  <textarea
                    value={auditForm.findings}
                    onChange={(e) => setAuditForm((prev) => ({ ...prev, findings: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>

                <div className="rounded-xl border p-4" style={{ borderColor: COLORS.border, background: COLORS.bgGray }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                        {auditForm.auditor || "Audit preview"}
                      </p>
                      <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                        Audit date: {auditForm.auditDate ? formatDate(auditForm.auditDate) : "Not selected"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={auditTypeStyle(auditForm.auditType)}>
                        {auditForm.auditType}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={workflowStatusStyle(auditForm.status)}>
                        {auditForm.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAudit}
                  disabled={savingAudit}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.blue900, color: COLORS.textWhite, opacity: savingAudit ? 0.7 : 1 }}
                >
                  {savingAudit ? "Saving..." : "Add Audit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
