"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function NewAuditSchedulePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [department, setDepartment] = useState("")
  const [auditor, setAuditor] = useState("")
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0])
  const [scope, setScope] = useState("")
  const [criteria, setCriteria] = useState("")
  const [status, setStatus] = useState("Scheduled")
  const [highlighted, setHighlighted] = useState(false)
  const [approved, setApproved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/categories?type=audit-schedule", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!response.ok) throw new Error("Failed to load categories")
        const data = await response.json()
        const normalized = (Array.isArray(data) ? data : [])
          .filter((cat: any) => !cat?.archived && !cat?.isArchived)
          .map((cat: any) => ({ id: String(cat._id || cat.id), name: String(cat.name || "") }))
          .filter((cat: { id: string; name: string }) => cat.id && cat.name)
        setCategories(normalized)
        setCategory((prev) => prev || normalized[0]?.id || "")
      } catch (error) {
        console.error("Error loading audit schedule categories:", error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert("Audit title is required")
      return
    }
    if (!category) {
      alert("Please select a category")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/audit-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          categoryId: category,
          department,
          auditor,
          scheduledDate,
          issueDate: scheduledDate,
          scope,
          criteria,
          status,
          highlighted,
          approved,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to create audit schedule")
      }

      router.push("/audit-schedule")
    } catch (error) {
      console.error("Error creating audit schedule:", error)
      alert("Failed to create audit schedule")
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-purple-300"
  const inputStyle = { background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }
  const labelCls = "mb-2 block text-sm font-semibold"

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#f7f8fb 0%,#f3f5f9 100%)" }}>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">

        {/* Header */}
        <div className="mb-6 flex items-start gap-3">
          <Link
            href="/audit-schedule"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: COLORS.purple50, color: COLORS.purple700, border: `1px solid ${COLORS.purple200}` }}
              >
                <span className="text-base font-bold">A</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
                Schedule New Audit
              </h1>
            </div>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Plan a new internal or external audit.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Category */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} style={inputStyle}>
                  {categoriesLoading ? (
                    <option value="">Loading categories…</option>
                  ) : categories.length === 0 ? (
                    <option value="">No audit categories found</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Audit Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ISO 9001 Annual Review"
                  required
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Scheduled Date</label>
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className={inputCls} style={inputStyle} />
              </div>

              {/* Department */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Department / Area</label>
                <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Warehouse" className={inputCls} style={inputStyle} />
              </div>

              {/* Auditor */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Lead Auditor</label>
                <input type="text" value={auditor} onChange={(e) => setAuditor(e.target.value)} placeholder="e.g. John Doe" className={inputCls} style={inputStyle} />
              </div>

              {/* Status */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} style={inputStyle}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Scope */}
              <div className="md:col-span-2">
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Audit Scope</label>
                <textarea value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Define scope boundaries…" rows={3} className={inputCls} style={inputStyle} />
              </div>

              {/* Criteria */}
              <div className="md:col-span-2">
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Audit Criteria (Standards / Policies)</label>
                <textarea value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="e.g. ISO 9001:2015 Clause 9.2" rows={3} className={inputCls} style={inputStyle} />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-5 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                <input type="checkbox" id="highlighted" checked={highlighted} onChange={(e) => setHighlighted(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                Highlight this audit
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                <input type="checkbox" id="approved" checked={approved} onChange={(e) => setApproved(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                Mark as approved
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || categoriesLoading || !category}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "#111827", color: COLORS.textWhite }}
              >
                {saving ? "Scheduling…" : "Schedule Audit"}
              </button>
              <Link
                href="/audit-schedule"
                className="inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}