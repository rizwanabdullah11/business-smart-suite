"use client"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function EditManualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch manual data on mount
  useEffect(() => {
    const fetchManual = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:5000/api/manuals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch manual")
        }

        const data = await response.json()
        setTitle(data.title || "")
        setVersion(data.version || "")
        setLocation(data.location || "")
      } catch (err) {
        console.error("Error fetching manual:", err)
        setError("Failed to load manual data")
      } finally {
        setLoadingData(false)
      }
    }

    if (id) {
      fetchManual()
    }
  }, [id])

  const handleSave = async () => {
    if (!title.trim() || !version.trim() || !location.trim()) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/manuals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          version: version.trim(),
          location: location.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Failed to save manual: ${response.statusText}`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/manual`)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving")
      console.error("Save error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bgGray }}>
        <Loader className="w-8 h-8 animate-spin" style={{ color: COLORS.primary }} />
      </div>
    )
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

          {/* Edit Form */}
          <div
            className="rounded-lg p-6"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>
              Edit Manual
            </h1>

            {error && (
              <div className="mb-4 p-4 rounded-lg" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-lg" style={{ background: "#DCFCE7", color: "#15803D" }}>
                Manual saved successfully! Redirecting...
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: COLORS.primary,
                    color: COLORS.textWhite,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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
