"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function NewOrganisationalContextPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [description, setDescription] = useState("")
  const [type, setType] = useState("Strength")
  const [impact, setImpact] = useState("Low")
  const [strategy, setStrategy] = useState("")
  const [highlighted, setHighlighted] = useState(false)
  const [approved, setApproved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/categories?type=organisational-context", {
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
        console.error("Error loading organisational context categories:", error)
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
      const response = await fetch("/api/organisational-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          categoryId: category,
          description,
          type,
          impact,
          strategy,
          highlighted,
          approved,
        }),
      })
      if (!response.ok) throw new Error("Failed to create context issue")
      router.push("/organisational-context")
    } catch (error) {
      console.error("Error creating organisational context issue:", error)
      alert("Failed to create context issue")
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
              href="/organisational-context"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Organisational Context
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
              Add New Context Issue
            </h1>
            <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
              Record a new internal or external factor (SWOT/PESTLE).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Issue / Factor Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Emerging Competitors"
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              {/* Type & Impact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Type (SWOT)
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textPrimary,
                    }}
                  >
                    <option value="Strength">Strength</option>
                    <option value="Weakness">Weakness</option>
                    <option value="Opportunity">Opportunity</option>
                    <option value="Threat">Threat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Impact Assessment
                  </label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textPrimary,
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Strategic Response */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Strategic Response / Action Plan
                </label>
                <textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="How will we address this?"
                  rows={3}
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
                    Highlight this issue
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
                  Add Issue
                </button>
                <Link
                  href="/organisational-context"
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