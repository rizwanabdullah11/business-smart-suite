"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { COLORS } from "@/constant/colors"

const TABS = ["Details", "Document", "Version history", "Reviews", "Permissions", "Audits"] as const

function toTitle(moduleSlug: string) {
  if (!moduleSlug) return "Task"
  return moduleSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase())
}

function formatDate(value?: string) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export default function UniversalTaskDetailPage() {
  const params = useParams<{ module: string; id: string }>()
  const searchParams = useSearchParams()
  const moduleSlug = params?.module || ""
  const id = params?.id || ""
  const backPath = searchParams.get("back") || `/${moduleSlug}`

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Details")
  const [item, setItem] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [savingReview, setSavingReview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [reviewForm, setReviewForm] = useState({
    reviewerName: "",
    reviewDate: "",
    nextReviewDate: "",
    reviewDetails: "",
  })

  const endpoint = useMemo(
    () => (moduleSlug === "manuals" ? `/api/manuals/${id}` : `/api/${moduleSlug}/${id}`),
    [moduleSlug, id]
  )

  const updateItem = async (payload: Record<string, unknown>) => {
    const token = localStorage.getItem("token")
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.error || "Failed to update task")
    }
    setItem(data)
    return data
  }

  useEffect(() => {
    const loadItem = async () => {
      if (!moduleSlug || !id) return
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")

        const response = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load task")
        }
        setItem(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task")
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [moduleSlug, id, endpoint])

  const title = useMemo(
    () => String(item?.title || item?.name || `${toTitle(moduleSlug)} Task`),
    [item, moduleSlug]
  )

  const detailEntries = useMemo(() => {
    if (!item) return []
    const hidden = new Set([
      "_id",
      "__v",
      "createdAt",
      "updatedAt",
      "category",
      "categoryId",
      "createdBy",
      "archived",
      "isArchived",
      "approved",
      "highlighted",
      "paused",
      "fileData",
      "reviews",
    ])
    return Object.entries(item).filter(([key, value]) => !hidden.has(key) && value !== undefined && value !== null && value !== "")
  }, [item])

  const reviews = useMemo(() => {
    if (!Array.isArray(item?.reviews)) return []
    return item.reviews
  }, [item])

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ""))
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(file)
      })

      await updateItem({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileData,
        uploadedAt: new Date().toISOString(),
      })
      alert("Document uploaded successfully")
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Failed to upload document")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDownloadFile = async () => {
    if (item?.fileData && item?.fileName) {
      const link = document.createElement("a")
      link.href = String(item.fileData)
      link.download = String(item.fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
    alert("No uploaded document available for download.")
  }

  const handleSaveReview = async () => {
    if (!reviewForm.reviewerName.trim() || !reviewForm.reviewDate) {
      alert("Reviewer Name and Review Date are required")
      return
    }
    setSavingReview(true)
    try {
      const nextReviews = [
        ...(Array.isArray(item?.reviews) ? item.reviews : []),
        {
          reviewerName: reviewForm.reviewerName.trim(),
          reviewDate: reviewForm.reviewDate,
          nextReviewDate: reviewForm.nextReviewDate || null,
          reviewDetails: reviewForm.reviewDetails.trim(),
          createdAt: new Date().toISOString(),
        },
      ]

      await updateItem({ reviews: nextReviews })
      setShowReviewModal(false)
      setReviewForm({
        reviewerName: "",
        reviewDate: "",
        nextReviewDate: "",
        reviewDetails: "",
      })
    } catch (err) {
      console.error("Save review failed:", err)
      alert("Failed to save review")
    } finally {
      setSavingReview(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error || !item) {
    return (
      <div className="p-6">
        <p style={{ color: COLORS.textPrimary }}>{error || "Task not found"}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="mb-4">
          <Link href={backPath} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
            <ArrowLeft className="w-4 h-4" />
            Back to {toTitle(backPath.replace("/", ""))}
          </Link>
        </div>

        <div className="rounded-xl p-5 mb-4" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>{title}</h1>
          <div className="p-2 text-sm rounded-lg" style={{ background: "#FEF9C3", color: COLORS.textSecondary }}>
            Last viewed: {new Date().toLocaleString()} (Current User)
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center gap-2 mb-4 border-b pb-2" style={{ borderColor: COLORS.border }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 rounded text-sm font-medium"
                style={{
                  background: activeTab === tab ? COLORS.bgGray : "transparent",
                  color: activeTab === tab ? COLORS.textPrimary : COLORS.textSecondary,
                  border: `1px solid ${activeTab === tab ? COLORS.border : "transparent"}`,
                }}
              >
                {tab}
              </button>
            ))}
            <button
              onClick={handleDownloadFile}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm"
              style={{ color: COLORS.textSecondary }}
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>

          {activeTab === "Details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailEntries.map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium mb-1" style={{ color: COLORS.textSecondary }}>
                    {key}
                  </p>
                  <div className="px-3 py-2 rounded border" style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}>
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Document" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.primary, color: COLORS.textWhite, opacity: uploading ? 0.7 : 1 }}
                >
                  {uploading ? "Uploading..." : "Add Document From Computer"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleUploadFile}
                />
              </div>

              {item?.fileName ? (
                <div className="p-4 rounded-lg border" style={{ borderColor: COLORS.border }}>
                  <p style={{ color: COLORS.textPrimary }}><strong>File:</strong> {String(item.fileName)}</p>
                  <p style={{ color: COLORS.textSecondary }}><strong>Type:</strong> {String(item.fileType || "-")}</p>
                  <p style={{ color: COLORS.textSecondary }}><strong>Size:</strong> {item.fileSize ? `${Math.round(Number(item.fileSize) / 1024)} KB` : "-"}</p>
                </div>
              ) : (
                <p style={{ color: COLORS.textSecondary }}>No document uploaded yet.</p>
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="space-y-4">
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: COLORS.blue900, color: COLORS.textWhite }}
              >
                Add Review
              </button>

              {reviews.length === 0 ? (
                <div className="py-10 text-center" style={{ color: COLORS.textSecondary }}>
                  No reviews available for this document.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: COLORS.border }}>
                      <p style={{ color: COLORS.textPrimary }}><strong>Reviewer:</strong> {review.reviewerName}</p>
                      <p style={{ color: COLORS.textSecondary }}><strong>Review Date:</strong> {formatDate(review.reviewDate)}</p>
                      <p style={{ color: COLORS.textSecondary }}><strong>Next Review Date:</strong> {review.nextReviewDate ? formatDate(review.nextReviewDate) : "N/A"}</p>
                      <p style={{ color: COLORS.textSecondary }}><strong>Details:</strong> {review.reviewDetails || "-"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab !== "Details" && activeTab !== "Document" && activeTab !== "Reviews" && (
            <div className="py-10 text-center" style={{ color: COLORS.textSecondary }}>
              {activeTab} tab is ready.
            </div>
          )}
        </div>

        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="w-full max-w-xl rounded-2xl p-6" style={{ background: COLORS.bgWhite }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-semibold" style={{ color: COLORS.textPrimary }}>Add Review</h3>
                <button onClick={() => setShowReviewModal(false)} style={{ color: COLORS.textSecondary }}>X</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Reviewer Name</label>
                  <input
                    type="text"
                    value={reviewForm.reviewerName}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewerName: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Review Date</label>
                  <input
                    type="date"
                    value={reviewForm.reviewDate}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Next Review Date (Optional)</label>
                  <input
                    type="date"
                    value={reviewForm.nextReviewDate}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, nextReviewDate: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textPrimary }}>Review Details</label>
                  <textarea
                    value={reviewForm.reviewDetails}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewDetails: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReview}
                  disabled={savingReview}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: COLORS.blue900, color: COLORS.textWhite, opacity: savingReview ? 0.7 : 1 }}
                >
                  {savingReview ? "Saving..." : "Add Review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
