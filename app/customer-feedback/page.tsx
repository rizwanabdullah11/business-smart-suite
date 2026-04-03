"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Archive,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  MessageSquare,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { COLORS } from "@/constant/colors"

type FeedbackItem = {
  _id?: string
  id?: string
  title?: string
  customerName?: string
  companyName?: string
  email?: string
  phone?: string
  feedbackType?: string
  channel?: string
  rating?: string | number
  status?: string
  submittedDate?: string
  feedback?: string
  followUpAction?: string
  category?: string | { _id?: string }
  categoryId?: string
  archived?: boolean
  isArchived?: boolean
  createdAt?: string
  updatedAt?: string
}

type Category = {
  _id?: string
  id?: string
  name?: string
}

function toCategoryId(item: FeedbackItem) {
  if (typeof item.category === "string") return item.category
  if (typeof item.category === "object" && item.category?._id) return String(item.category._id)
  return item.categoryId || ""
}

function getStatusTone(status?: string) {
  if (status === "Resolved")
    return { label: "Resolved", background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }
  if (status === "In Review")
    return { label: "In Review", background: "#fffaf3", color: "#c2410c", borderColor: "#fed7aa" }
  return { label: "New", background: "#faf5ff", color: "#7c3aed", borderColor: "#e9d5ff" }
}

function formatDate(value?: string) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB")
}

function RatingStars({ value }: { value?: string | number }) {
  const n = Math.max(0, Math.min(5, Number(value || 0) || 0))
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < n ? "fill-current" : ""}`}
          style={{ color: i < n ? "#f59e0b" : "#d1d5db" }}
        />
      ))}
    </div>
  )
}

export default function CustomerFeedbackPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"All" | "New" | "In Review" | "Resolved">("All")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({})

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      const [catRes, itemRes] = await Promise.all([
        fetch("/api/categories?type=customer-feedback", { headers, credentials: "include" }),
        fetch("/api/customer-feedback", { headers, credentials: "include" }),
      ])
      const nextCats = catRes.ok ? await catRes.json() : []
      const nextItems = itemRes.ok ? await itemRes.json() : []
      setCategories(Array.isArray(nextCats) ? nextCats : [])
      setItems(Array.isArray(nextItems) ? nextItems : [])
    } catch (err) {
      console.error("Failed to load customer feedback:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (item.archived || item.isArchived) return false
        if (statusFilter === "All") return true
        return (item.status || "New") === statusFilter
      }),
    [items, statusFilter],
  )

  const groupedItems = useMemo(() => {
    const catMap = new Map<string, string>()
    categories.forEach((c) => {
      const id = String(c._id || c.id || "")
      if (id) catMap.set(id, String(c.name || "Unnamed Category"))
    })
    const groups = new Map<string, { id: string; title: string; items: FeedbackItem[] }>()
    filteredItems.forEach((item) => {
      const catId = toCategoryId(item)
      const key = catId || "uncategorized"
      const title = catMap.get(catId) || "Uncategorized Feedback"
      const group = groups.get(key) || { id: key, title, items: [] }
      group.items.push(item)
      groups.set(key, group)
    })
    return Array.from(groups.values())
  }, [categories, filteredItems])

  useEffect(() => {
    if (groupedItems.length > 0 && expandedGroups.length === 0) {
      setExpandedGroups([groupedItems[0].id])
    }
  }, [groupedItems])

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => (prev.includes(id) ? [] : [id]))
  }

  const stats = useMemo(() => {
    const active = items.filter((i) => !i.archived && !i.isArchived)
    const total = active.length
    const avgRating =
      total > 0
        ? (active.reduce((s, i) => s + (Number(i.rating || 0) || 0), 0) / total).toFixed(1)
        : "0.0"
    return {
      total,
      avgRating,
      newCount: active.filter((i) => (i.status || "New") === "New").length,
      resolvedCount: active.filter((i) => i.status === "Resolved").length,
    }
  }, [items])

  const updateStatus = async (item: FeedbackItem, status: "New" | "In Review" | "Resolved") => {
    const itemId = String(item._id || item.id || "")
    if (!itemId) return
    try {
      setActionLoading(`status-${itemId}`)
      const token = localStorage.getItem("token")
      await fetch(`/api/customer-feedback/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...item, status }),
      })
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const archiveItem = async (item: FeedbackItem) => {
    const itemId = String(item._id || item.id || "")
    if (!itemId) return
    try {
      setActionLoading(`archive-${itemId}`)
      const token = localStorage.getItem("token")
      await fetch(`/api/customer-feedback/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...item, archived: true, isArchived: true }),
      })
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      setActionLoading(`delete-${itemId}`)
      const token = localStorage.getItem("token")
      await fetch(`/api/customer-feedback/${itemId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#f7f8fb 0%,#f3f5f9 100%)" }}>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: COLORS.purple50, color: COLORS.purple700, border: `1px solid ${COLORS.purple200}` }}
                >
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
                  Customer Feedback
                </h1>
              </div>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Track customer comments, satisfaction, complaints, and follow-up actions.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/customer-feedback/new">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: "#111827", color: COLORS.textWhite, border: "1px solid #111827" }}
              >
                <Plus className="h-4 w-4" />
                Add New
              </button>
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, bg: COLORS.purple50, color: COLORS.purple700, border: COLORS.purple200 },
            { label: "Avg Rating", value: stats.avgRating, bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
            { label: "New", value: stats.newCount, bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
            { label: "Resolved", value: stats.resolvedCount, bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-4 py-3"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: s.color }}>{s.label}</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Status Filter Tabs ── */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div
            className="inline-flex rounded-xl p-1"
            style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
          >
            {(["All", "New", "In Review", "Resolved"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  background: statusFilter === f ? COLORS.purple700 : "transparent",
                  color: statusFilter === f ? COLORS.textWhite : COLORS.textSecondary,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div
            className="rounded-2xl px-6 py-16 text-center"
            style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
          >
            <p style={{ color: COLORS.textSecondary }}>Loading customer feedback…</p>
          </div>
        ) : groupedItems.length === 0 ? (
          <div
            className="rounded-2xl px-6 py-16 text-center"
            style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}` }}
          >
            <MessageSquare className="mx-auto mb-3 h-10 w-10" style={{ color: COLORS.textLight }} />
            <div className="mb-1 text-base font-semibold" style={{ color: COLORS.textPrimary }}>No feedback found</div>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>Add your first feedback entry to start tracking customer responses.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedItems.map((group) => {
              const isExpanded = expandedGroups.includes(group.id)
              const sortedGroup = group.items
              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-2xl shadow-sm"
                  style={{ background: COLORS.bgWhite, border: "1px solid #ececf3", boxShadow: "0 10px 30px rgba(31,41,55,0.05)" }}
                >
                  {/* Category Header */}
                  <div
                    className="flex flex-col gap-3 px-4 py-1.5 sm:flex-row sm:items-center sm:justify-between"
                    style={{ background: "#341746", color: "#fff" }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="flex items-center gap-3 text-left"
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-md"
                        style={{ background: "rgba(255,255,255,0.14)" }}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-base font-semibold">{group.title}</div>
                        <div className="text-xs text-white/70">
                          {sortedGroup.length} feedback entr{sortedGroup.length === 1 ? "y" : "ies"} in view
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <div className="mr-1 flex h-7 w-5 items-center justify-center opacity-50">
                        <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                          <circle cx="3" cy="2" r="1.5"/><circle cx="9" cy="2" r="1.5"/>
                          <circle cx="3" cy="7" r="1.5"/><circle cx="9" cy="7" r="1.5"/>
                          <circle cx="3" cy="12" r="1.5"/><circle cx="9" cy="12" r="1.5"/>
                        </svg>
                      </div>
                      <div
                        className="h-6 w-6 rounded"
                        style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.4)" }}
                      />
                      <Link href="/customer-feedback/new">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                          style={{ background: "#22c55e" }}
                          title="Add Feedback"
                        >
                          <Plus className="h-3.5 w-3.5 text-white" />
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Table */}
                  {isExpanded ? (
                    <div className="p-4 sm:p-5">
                      <div className="mb-3 flex justify-end text-xs sm:text-sm" style={{ color: COLORS.textSecondary }}>
                        Showing {sortedGroup.length} result{sortedGroup.length === 1 ? "" : "s"}
                      </div>
                      <div
                        className="overflow-hidden rounded-2xl"
                        style={{ border: "1px solid #efeff5", background: "#fcfcff" }}
                      >
                        <div className="overflow-x-auto p-3">
                          <table className="min-w-full text-left">
                            <thead style={{ background: "#fff" }}>
                              <tr style={{ color: "#707685" }}>
                                <th className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wide">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded cursor-pointer"
                                    checked={sortedGroup.length > 0 && sortedGroup.every((i) => {
                                      const id = String(i._id || i.id || "")
                                      return selectedItems[group.id]?.has(id)
                                    })}
                                    onChange={(e) => {
                                      const ids = sortedGroup.map((i) => String(i._id || i.id || ""))
                                      setSelectedItems((prev) => ({
                                        ...prev,
                                        [group.id]: e.target.checked ? new Set(ids) : new Set(),
                                      }))
                                    }}
                                  />
                                </th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Customer</th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Type</th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Rating</th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Date</th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Status</th>
                                <th className="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wide">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedGroup.map((item, index) => {
                                const itemId = String(item._id || item.id || "")
                                const statusTone = getStatusTone(item.status)
                                const isSelected = selectedItems[group.id]?.has(itemId) ?? false
                                return (
                                  <tr
                                    key={itemId}
                                    style={{
                                      background: isSelected ? "#f4f2ff" : "#fff",
                                      borderTop: index === 0 ? "none" : "1px solid #efeff5",
                                      borderBottom: index === sortedGroup.length - 1 ? "1px solid #efeff5" : "none",
                                    }}
                                  >
                                    <td className="px-2 py-1 align-top">
                                      <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 rounded cursor-pointer"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          setSelectedItems((prev) => {
                                            const current = new Set(prev[group.id] ?? [])
                                            if (e.target.checked) current.add(itemId)
                                            else current.delete(itemId)
                                            return { ...prev, [group.id]: current }
                                          })
                                        }}
                                      />
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                          style={{ background: "#f4f2ff", color: COLORS.purple700, border: `1px solid ${COLORS.purple200}` }}
                                        >
                                          <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <Link
                                            href={`/customer-feedback/${itemId}`}
                                            className="block text-sm font-semibold hover:underline sm:text-[15px] break-words"
                                            style={{ color: COLORS.purple700 }}
                                          >
                                            {item.title || item.customerName || "Untitled Feedback"}
                                          </Link>
                                          {item.customerName && item.title ? (
                                            <div className="mt-0.5 text-xs" style={{ color: "#73788a" }}>{item.customerName}</div>
                                          ) : null}
                                          {item.companyName ? (
                                            <div className="mt-0.5 text-xs" style={{ color: "#73788a" }}>{item.companyName}</div>
                                          ) : null}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                      {item.feedbackType ? (
                                        <span
                                          className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                                          style={{
                                            background: item.feedbackType === "Complaint" ? "#fdf2f8" : item.feedbackType === "Suggestion" ? COLORS.purple50 : "#fff7ed",
                                            color: item.feedbackType === "Complaint" ? "#be185d" : item.feedbackType === "Suggestion" ? COLORS.purple700 : "#c2410c",
                                            border: `1px solid ${item.feedbackType === "Complaint" ? "#fbcfe8" : item.feedbackType === "Suggestion" ? COLORS.purple200 : "#fed7aa"}`,
                                          }}
                                        >
                                          {item.feedbackType}
                                        </span>
                                      ) : (
                                        <span className="text-sm" style={{ color: COLORS.textPrimary }}>—</span>
                                      )}
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                      <RatingStars value={item.rating} />
                                    </td>
                                    <td className="px-2 py-1 align-top text-sm" style={{ color: COLORS.textPrimary }}>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" style={{ color: COLORS.textLight }} />
                                        {formatDate(item.submittedDate || item.createdAt)}
                                      </div>
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                      <span
                                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                                        style={{
                                          background: statusTone.background,
                                          color: statusTone.color,
                                          border: `1px solid ${statusTone.borderColor}`,
                                        }}
                                      >
                                        {statusTone.label}
                                      </span>
                                    </td>
                                    <td className="px-2 py-1">
                                      <div className="flex items-center justify-end gap-1">
                                        <div className="mr-1 flex h-6 w-5 cursor-move items-center justify-center opacity-30 hover:opacity-60">
                                          <svg width="10" height="14" viewBox="0 0 10 14" fill="#374151">
                                            <circle cx="2.5" cy="2" r="1.5"/><circle cx="7.5" cy="2" r="1.5"/>
                                            <circle cx="2.5" cy="7" r="1.5"/><circle cx="7.5" cy="7" r="1.5"/>
                                            <circle cx="2.5" cy="12" r="1.5"/><circle cx="7.5" cy="12" r="1.5"/>
                                          </svg>
                                        </div>
                                        <Link href={`/customer-feedback/${itemId}`}>
                                          <button
                                            type="button"
                                            className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                                            style={{ background: "#6366f1" }}
                                            title="View"
                                          >
                                            <Eye className="h-3.5 w-3.5 text-white" />
                                          </button>
                                        </Link>
                                        <Link href={`/customer-feedback/${itemId}/edit`}>
                                          <button
                                            type="button"
                                            className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                                            style={{ background: "#4f46e5" }}
                                            title="Edit"
                                          >
                                            <Edit className="h-3.5 w-3.5 text-white" />
                                          </button>
                                        </Link>
                                        {item.status !== "Resolved" ? (
                                          <button
                                            type="button"
                                            onClick={() => updateStatus(item, item.status === "New" ? "In Review" : "Resolved")}
                                            disabled={actionLoading === `status-${itemId}`}
                                            className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{ background: "#22c55e" }}
                                            title={item.status === "New" ? "Start Review" : "Mark Resolved"}
                                          >
                                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                          </button>
                                        ) : null}
                                        <button
                                          type="button"
                                          onClick={() => archiveItem(item)}
                                          disabled={actionLoading === `archive-${itemId}`}
                                          className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                          style={{ background: "#f59e0b" }}
                                          title="Archive"
                                        >
                                          <Archive className="h-3.5 w-3.5 text-white" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deleteItem(itemId)}
                                          disabled={actionLoading === `delete-${itemId}`}
                                          className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                          style={{ background: "#ef4444" }}
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-white" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
