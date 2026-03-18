"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [location, setLocation] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const backHref = "/policies"

  useEffect(() => {
    const loadPolicy = async () => {
      if (!id) return
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/policies/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!response.ok) throw new Error("Failed to load policy")
        const data = await response.json()
        setTitle(String(data?.title || ""))
        setVersion(String(data?.version || ""))
        setLocation(String(data?.location || ""))
        setIssueDate(String(data?.issueDate || new Date().toISOString().split("T")[0]))
      } catch (error) {
        console.error("Error loading policy:", error)
        alert("Failed to load policy")
      } finally {
        setLoading(false)
      }
    }

    loadPolicy()
  }, [id])

  const handleSave = async () => {
    if (!id) return
    if (!title.trim()) {
      alert("Title is required")
      return
    }
    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/policies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          version: version || "v1.0",
          location: location || "QMS",
          issueDate,
        }),
      })
      if (!response.ok) throw new Error("Failed to update policy")
      router.push(`/task/policies/${id}?back=${encodeURIComponent("/policies")}`)
    } catch (error) {
      console.error("Error updating policy:", error)
      alert("Failed to save policy changes")
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
              href={backHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Policy
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
              Edit Policy
            </h1>

            {loading ? (
              <p style={{ color: COLORS.textSecondary }}>Loading policy...</p>
            ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded border"
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
                  className="w-full px-3 py-2 rounded border"
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
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{
                    background: COLORS.primary,
                    color: COLORS.textWhite,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link
                  href={backHref}
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{
                    background: COLORS.bgGray,
                    color: COLORS.textPrimary,
                  }}
                >
                  Cancel
                </Link>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
