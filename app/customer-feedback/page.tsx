"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Archive,
  Building2,
  Calendar,
  CheckCircle2,
  Edit,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Star,
  Trash2,
  User,
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

function statusStyle(status?: string) {
  if (status === "Resolved") return { bg: COLORS.green100, color: COLORS.green600 }
  if (status === "In Review") return { bg: COLORS.orange100, color: COLORS.orange700 }
  return { bg: COLORS.blue100, color: COLORS.blue700 }
}

function typeStyle(type?: string) {
  if (type === "Complaint") return { bg: COLORS.pink100, color: COLORS.pink700 }
  if (type === "Suggestion") return { bg: COLORS.indigo100, color: COLORS.indigo700 }
  if (type === "Support") return { bg: COLORS.orange100, color: COLORS.orange700 }
  return { bg: COLORS.green100, color: COLORS.green600 }
}

function renderStars(value?: string | number) {
  const numeric = Math.max(1, Math.min(5, Number(value || 0) || 0))
  return Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={`w-4 h-4 ${index < numeric ? "fill-current" : ""}`}
      style={{ color: index < numeric ? "#F59E0B" : "#D1D5DB" }}
    />
  ))
}

export default function CustomerFeedbackPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"All" | "New" | "In Review" | "Resolved">("All")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      const [categoryResponse, itemResponse] = await Promise.all([
        fetch("/api/categories?type=customer-feedback", { headers, credentials: "include" }),
        fetch("/api/customer-feedback", { headers, credentials: "include" }),
      ])

      const nextCategories = categoryResponse.ok ? await categoryResponse.json() : []
      const nextItems = itemResponse.ok ? await itemResponse.json() : []
      setCategories(Array.isArray(nextCategories) ? nextCategories : [])
      setItems(Array.isArray(nextItems) ? nextItems : [])
    } catch (error) {
      console.error("Failed to load customer feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.archived || item.isArchived) return false
      if (statusFilter === "All") return true
      return (item.status || "New") === statusFilter
    })
  }, [items, statusFilter])

  const groupedItems = useMemo(() => {
    const categoryMap = new Map<string, string>()
    categories.forEach((category) => {
      const id = String(category._id || category.id || "")
      if (id) categoryMap.set(id, String(category.name || "Unnamed Category"))
    })

    const groups = new Map<string, { title: string; items: FeedbackItem[] }>()
    filteredItems.forEach((item) => {
      const categoryId = toCategoryId(item)
      const key = categoryId || "uncategorized"
      const title = categoryMap.get(categoryId) || "Uncategorized Feedback"
      const group = groups.get(key) || { title, items: [] }
      group.items.push(item)
      groups.set(key, group)
    })

    return Array.from(groups.values())
  }, [categories, filteredItems])

  const stats = useMemo(() => {
    const activeItems = items.filter((item) => !item.archived && !item.isArchived)
    const total = activeItems.length
    const averageRating =
      total > 0
        ? (
            activeItems.reduce((sum, item) => sum + (Number(item.rating || 0) || 0), 0) / total
          ).toFixed(1)
        : "0.0"
    return {
      total,
      averageRating,
      newCount: activeItems.filter((item) => (item.status || "New") === "New").length,
      resolvedCount: activeItems.filter((item) => item.status === "Resolved").length,
    }
  }, [items])

  const updateStatus = async (item: FeedbackItem, status: "New" | "In Review" | "Resolved") => {
    try {
      const itemId = String(item._id || item.id || "")
      if (!itemId) return
      setActionLoading(`status-${itemId}`)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/customer-feedback/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...item, status }),
      })
      if (!response.ok) throw new Error("Failed to update feedback status")
      await loadData()
    } catch (error) {
      console.error("Failed to update feedback status:", error)
      alert("Failed to update feedback status")
    } finally {
      setActionLoading(null)
    }
  }

  const archiveItem = async (item: FeedbackItem) => {
    try {
      const itemId = String(item._id || item.id || "")
      if (!itemId) return
      setActionLoading(`archive-${itemId}`)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/customer-feedback/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...item, archived: true, isArchived: true }),
      })
      if (!response.ok) throw new Error("Failed to archive feedback")
      await loadData()
    } catch (error) {
      console.error("Failed to archive feedback:", error)
      alert("Failed to archive feedback")
    } finally {
      setActionLoading(null)
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      setActionLoading(`delete-${itemId}`)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/customer-feedback/${itemId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error("Failed to delete feedback")
      await loadData()
    } catch (error) {
      console.error("Failed to delete feedback:", error)
      alert("Failed to delete feedback")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div
            className="rounded-2xl p-6 border"
            style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${COLORS.primary}15`, color: COLORS.primary }}
                >
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                    Customer Feedback
                  </h1>
                  <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                    Track customer comments, satisfaction, complaints, and follow-up actions in a customer-focused view.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/customer-feedback/new"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold"
                  style={{ background: COLORS.primaryGradient, color: COLORS.textWhite }}
                >
                  <Plus className="w-5 h-5" />
                  Add Feedback
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: "Total Feedback", value: stats.total, color: COLORS.blue100, text: COLORS.blue700 },
              { label: "Average Rating", value: stats.averageRating, color: COLORS.orange100, text: COLORS.orange700 },
              { label: "New Feedback", value: stats.newCount, color: COLORS.indigo100, text: COLORS.indigo700 },
              { label: "Resolved", value: stats.resolvedCount, color: COLORS.green100, text: COLORS.green600 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-5 border"
                style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
              >
                <div
                  className="inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3"
                  style={{ background: stat.color, color: stat.text }}
                >
                  {stat.label}
                </div>
                <p className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl p-5 border"
            style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
          >
            <div className="flex flex-wrap gap-3">
              {(["All", "New", "In Review", "Resolved"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border"
                  style={{
                    background: statusFilter === filter ? COLORS.primaryGradient : COLORS.bgWhite,
                    color: statusFilter === filter ? COLORS.textWhite : COLORS.textPrimary,
                    borderColor: statusFilter === filter ? COLORS.primary : COLORS.border,
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div
              className="rounded-2xl p-10 border text-center"
              style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
            >
              <p style={{ color: COLORS.textSecondary }}>Loading customer feedback...</p>
            </div>
          ) : groupedItems.length === 0 ? (
            <div
              className="rounded-2xl p-10 border text-center"
              style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
            >
              <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                No customer feedback found.
              </p>
              <p className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
                Add your first feedback entry to start tracking customer responses.
              </p>
            </div>
          ) : (
            groupedItems.map((group) => (
              <div key={group.title} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                      {group.title}
                    </h2>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      {group.items.length} feedback entr{group.items.length === 1 ? "y" : "ies"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {group.items.map((item) => {
                    const itemId = String(item._id || item.id || "")
                    const status = statusStyle(item.status)
                    const type = typeStyle(item.feedbackType)
                    return (
                      <div
                        key={itemId}
                        className="rounded-2xl p-5 border shadow-sm"
                        style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                              {item.title || "Untitled Feedback"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{ background: status.bg, color: status.color }}
                              >
                                {item.status || "New"}
                              </span>
                              <span
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{ background: type.bg, color: type.color }}
                              >
                                {item.feedbackType || "Feedback"}
                              </span>
                              {item.channel ? (
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-bold"
                                  style={{ background: COLORS.gray100, color: COLORS.gray700 }}
                                >
                                  {item.channel}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">{renderStars(item.rating)}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 text-sm" style={{ color: COLORS.textSecondary }}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{item.customerName || "No customer name"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{item.companyName || "No company"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{item.email || "No email"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{item.phone || "No phone"}</span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Calendar className="w-4 h-4" />
                            <span>{item.submittedDate || item.createdAt || "No date"}</span>
                          </div>
                        </div>

                        <div
                          className="mt-5 rounded-xl p-4"
                          style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}` }}
                        >
                          <p className="text-sm font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
                            Customer Feedback
                          </p>
                          <p className="text-sm leading-6" style={{ color: COLORS.textSecondary }}>
                            {item.feedback || "No feedback text provided."}
                          </p>
                        </div>

                        {item.followUpAction ? (
                          <div
                            className="mt-4 rounded-xl p-4"
                            style={{ background: COLORS.indigo50, border: `1px solid ${COLORS.indigo100}` }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4" style={{ color: COLORS.indigo700 }} />
                              <p className="text-sm font-semibold" style={{ color: COLORS.indigo700 }}>
                                Follow-up Action
                              </p>
                            </div>
                            <p className="text-sm leading-6" style={{ color: COLORS.textSecondary }}>
                              {item.followUpAction}
                            </p>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-2 mt-5">
                          <Link
                            href={`/customer-feedback/${itemId}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                            style={{ background: COLORS.gray100, color: COLORS.gray700 }}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                          <Link
                            href={`/customer-feedback/${itemId}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                            style={{ background: COLORS.blue100, color: COLORS.blue700 }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                          {item.status !== "Resolved" ? (
                            <button
                              type="button"
                              onClick={() => updateStatus(item, item.status === "New" ? "In Review" : "Resolved")}
                              disabled={actionLoading === `status-${itemId}`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                              style={{ background: COLORS.green100, color: COLORS.green600 }}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {item.status === "New" ? "Start Review" : "Resolve"}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => archiveItem(item)}
                            disabled={actionLoading === `archive-${itemId}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                            style={{ background: COLORS.orange100, color: COLORS.orange700 }}
                          >
                            <Archive className="w-4 h-4" />
                            Archive
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(itemId)}
                            disabled={actionLoading === `delete-${itemId}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                            style={{ background: COLORS.pink100, color: COLORS.pink700 }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
