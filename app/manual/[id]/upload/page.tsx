"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Loader } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function UploadManualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(`/api/manuals/${id}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Upload failed: ${response.statusText}`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/manual`)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
      console.error("Upload error:", err)
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

          {/* Upload Form */}
          <div
            className="rounded-lg p-6"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>
              Upload Document
            </h1>

            {error && (
              <div className="mb-4 p-4 rounded-lg" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-lg" style={{ background: "#DCFCE7", color: "#15803D" }}>
                File uploaded successfully! Redirecting...
              </div>
            )}

            <div
              className="border-2 border-dashed rounded-lg p-12 text-center"
              style={{ borderColor: COLORS.border }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.textSecondary }} />
              <p className="text-lg font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                Drop files here or click to browse
              </p>
              <p className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
              <input
                type="file"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null)
                  setError(null)
                }}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 rounded-lg font-medium cursor-pointer transition-all disabled:opacity-50"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                Select File
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 rounded-lg" style={{ background: COLORS.bgGray }}>
                <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                  Selected: {selectedFile.name}
                </p>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpload}
                className="px-6 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
                disabled={!selectedFile || loading}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
              <Link
                href={`/manual/${id}`}
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
  )
}
