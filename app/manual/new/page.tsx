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
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
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
    if (!title.trim() || !version.trim() || !location.trim() || !category) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/manuals", {
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
          issueDate: new Date().toISOString().split("T")[0],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Failed to create manual: ${response.statusText}`)
      }

      const newManual = await response.json()
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
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/manual"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Manuals
            </Link>
          </div>

          {/* Create Form */}
          <div
            className="rounded-lg p-6"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>
              Create New Manual
            </h1>

            {error && (
              <div className="mb-4 p-4 rounded-lg" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-lg" style={{ background: "#DCFCE7", color: "#15803D" }}>
                Manual created successfully! Redirecting...
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading || loadingCategories}
                  className="w-full px-3 py-2 rounded border disabled:opacity-50"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
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
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter manual title..."
                  disabled={loading}
                  className="w-full px-3 py-2 rounded border disabled:opacity-50"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g., v1.0"
                  disabled={loading}
                  className="w-full px-3 py-2 rounded border disabled:opacity-50"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., QMS"
                  disabled={loading}
                  className="w-full px-3 py-2 rounded border disabled:opacity-50"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreate}
                  disabled={loading || !category}
                  className="px-6 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: COLORS.primary,
                    color: COLORS.textWhite,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Manual"
                  )}
                </button>
                <Link
                  href="/manual"
                  className="px-6 py-2 rounded-lg font-medium transition-all"
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
