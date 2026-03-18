"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

type Props = {
  moduleSlug: string
  pageTitle: string
  backLabel: string
}

export default function GenericModuleEditPage({ moduleSlug, pageTitle, backLabel }: Props) {
  const params = useParams<{ id: string }>()
  const id = String(params?.id || "")
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [location, setLocation] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState("")
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [uploadedAt, setUploadedAt] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const detailHref = useMemo(
    () => `/task/${moduleSlug}/${id}?back=${encodeURIComponent(`/${moduleSlug}`)}`,
    [moduleSlug, id]
  )

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/${moduleSlug}/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!response.ok) throw new Error("Failed to load item")
        const data = await response.json()
        setTitle(String(data?.title || ""))
        setVersion(String(data?.version || ""))
        setLocation(String(data?.location || ""))
        setIssueDate(String(data?.issueDate || new Date().toISOString().split("T")[0]))
        setFileName(String(data?.fileName || ""))
        setFileType(String(data?.fileType || ""))
        setFileSize(typeof data?.fileSize === "number" ? data.fileSize : null)
        setUploadedAt(String(data?.uploadedAt || ""))
      } catch (error) {
        console.error(`Error loading ${moduleSlug} item:`, error)
        alert("Failed to load item")
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [moduleSlug, id])

  const handleSave = async () => {
    if (!id) return
    if (!title.trim()) {
      alert("Title is required")
      return
    }
    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}/${id}`, {
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
      if (!response.ok) throw new Error("Failed to update item")
      router.replace(detailHref)
      if (typeof window !== "undefined") window.location.assign(detailHref)
    } catch (error) {
      console.error(`Error updating ${moduleSlug} item:`, error)
      alert("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>
          </div>

          <div
            className="rounded-lg p-6"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>
              {pageTitle}
            </h1>

            {loading ? (
              <p style={{ color: COLORS.textSecondary }}>Loading...</p>
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
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
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
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
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
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
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
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  />
                </div>

                {(fileName || fileType || fileSize !== null || uploadedAt) && (
                  <div className="pt-2">
                    <h2 className="text-base font-semibold mb-3" style={{ color: COLORS.textPrimary }}>
                      Uploaded File Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                          File Name
                        </label>
                        <input
                          type="text"
                          value={fileName || "-"}
                          readOnly
                          className="w-full px-3 py-2 rounded border"
                          style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgGray }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                          File Size
                        </label>
                        <input
                          type="text"
                          value={fileSize !== null ? String(fileSize) : "-"}
                          readOnly
                          className="w-full px-3 py-2 rounded border"
                          style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgGray }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                          File Type
                        </label>
                        <input
                          type="text"
                          value={fileType || "-"}
                          readOnly
                          className="w-full px-3 py-2 rounded border"
                          style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgGray }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                          Uploaded At
                        </label>
                        <input
                          type="text"
                          value={uploadedAt ? new Date(uploadedAt).toLocaleString() : "-"}
                          readOnly
                          className="w-full px-3 py-2 rounded border"
                          style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgGray }}
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                    href={detailHref}
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
