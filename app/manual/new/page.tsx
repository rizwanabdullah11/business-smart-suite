"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader } from "lucide-react"
import { COLORS } from "@/constant/colors"

interface Category {
  _id: string
  name: string
}

export default function NewManualPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/categories?type=manual", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data)
        if (data.length > 0) {
          setCategory(data[0]._id)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to load categories")
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCreate = async () => {
    if (!title.trim() || !version.trim() || !location.trim() || !category || !issueDate) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/manuals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          version: version.trim(),
          location: location.trim(),
          category: category,
          issueDate: issueDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Failed to create manual: ${response.statusText}`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/manual`)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while creating the manual")
      console.error("Create error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/manual"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:bg-white hover:shadow-md"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Manuals
            </Link>
          </div>

          {/* Create Form */}
          <div
            className="rounded-2xl p-8 shadow-sm"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                Create New Manual
              </h1>
              <p className="text-gray-500 font-medium">Add a new documentation to your system</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl font-medium" style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl font-medium shadow-sm" style={{ background: "#DCFCE7", color: "#15803D", border: "1px solid #BBF7D0" }}>
                Manual created successfully! Redirecting...
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading || loadingCategories}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50 text-lg cursor-pointer"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                    background: COLORS.bgGrayLight,
                  }}
                >
                  <option value="">
                    {loadingCategories ? "Loading categories..." : "Select a category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                  Manual Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter manual title..."
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50 text-lg"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                    background: COLORS.bgGrayLight,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                    Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g., v1.0"
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50 text-lg"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textPrimary,
                      background: COLORS.bgGrayLight,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50 text-lg"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.textPrimary,
                      background: COLORS.bgGrayLight,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., QMS"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50 text-lg"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                    background: COLORS.bgGrayLight,
                  }}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleCreate}
                  disabled={loading || !category}
                  className="flex-1 px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  style={{
                    background: COLORS.primaryGradient,
                    color: COLORS.textWhite,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating Manual...
                    </>
                  ) : (
                    "Create Manual"
                  )}
                </button>
                <Link
                  href="/manual"
                  className="px-8 py-4 rounded-xl font-bold transition-all hover:bg-gray-200 text-lg"
                  style={{
                    background: COLORS.bgGray,
                    color: COLORS.textPrimary,
                  }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
