"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function NewObjectivePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [target, setTarget] = useState("")
  const [deadline, setDeadline] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0])
  const [owner, setOwner] = useState("")
  const [measures, setMeasures] = useState("")
  const [status, setStatus] = useState("On Track")
  const [highlighted, setHighlighted] = useState(false)
  const [approved, setApproved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/categories?type=objectives", {
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
        console.error("Error loading objective categories:", error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert("Title is required")
      return
    }
    if (!category) {
      alert("Please select a category")
      return
    }
    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/objectives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          categoryId: category,
          issueDate,
          target,
          deadline,
          owner,
          measures,
          status,
          highlighted,
          approved,
        }),
      })
      if (!response.ok) throw new Error("Failed to create objective")
      router.push("/objectives")
    } catch (error) {
      console.error("Error creating objective:", error)
      alert("Failed to create objective")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/objectives"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Objectives
            </Link>
          </div>

          {/* Create Form */}
          <div
            className="rounded-lg p-6 shadow-sm"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>
              Create New Objective
            </h1>
            <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
              Define SMART goals and key performance indicators.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Objective Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Achieve ISO 9001 Certification"
                  required
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                >
                  {categoriesLoading ? (
                    <option value="">Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="">No categories found</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Target & Deadline */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              {/* Target & Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Target / KPI Value
                  </label>
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. Zero accidents"
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textPrimary,
                    }}
                  />
                </div>
              </div>

              {/* Owner & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Objective Owner
                  </label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. CEO"
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textPrimary,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textPrimary,
                    }}
                  >
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Behind">Behind</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Measures */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Plans to Achieve Targets
                </label>
                <textarea
                  value={measures}
                  onChange={(e) => setMeasures(e.target.value)}
                  placeholder="Strategies and action plans..."
                  rows={4}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="highlighted"
                    checked={highlighted}
                    onChange={(e) => setHighlighted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="highlighted" className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                    Highlight this objective
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="approved"
                    checked={approved}
                    onChange={(e) => setApproved(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="approved" className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                    Mark as approved
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all"
                  style={{
                    background: COLORS.primary,
                    color: COLORS.textWhite,
                  }}
                >
                  Create Objective
                </button>
                <Link
                  href="/objectives"
                  className="px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all inline-block"
                  style={{
                    background: COLORS.bgGray,
                    color: COLORS.textPrimary,
                  }}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}