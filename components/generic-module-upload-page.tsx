"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import { COLORS } from "@/constant/colors"

type Props = {
  moduleSlug: string
  backLabel: string
  uploadTitle: string
  accept?: string
}

export default function GenericModuleUploadPage({
  moduleSlug,
  backLabel,
  uploadTitle,
  accept = ".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png",
}: Props) {
  const params = useParams<{ id: string }>()
  const id = String(params?.id || "")
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const detailHref = id ? `/task/${moduleSlug}/${id}?back=${encodeURIComponent(`/${moduleSlug}`)}` : `/${moduleSlug}`

  const handleUpload = async () => {
    if (!selectedFile || !id) return
    try {
      setUploading(true)
      const reader = new FileReader()
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = String(reader.result || "")
          const marker = "base64,"
          const idx = result.indexOf(marker)
          if (idx >= 0) resolve(result.slice(idx + marker.length))
          else resolve(result)
        }
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(selectedFile)
      })

      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type || "application/octet-stream",
          fileSize: selectedFile.size,
          fileData: base64Data,
          uploadedAt: new Date().toISOString(),
        }),
      })
      if (!response.ok) throw new Error("Failed to upload file")
      router.replace(detailHref)
      if (typeof window !== "undefined") window.location.assign(detailHref)
    } catch (error) {
      console.error(`Upload failed for ${moduleSlug}:`, error)
      alert("Failed to upload file")
    } finally {
      setUploading(false)
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
              {uploadTitle}
            </h1>

            <div
              className="border-2 border-dashed rounded-lg p-12 text-center"
              style={{ borderColor: COLORS.border }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.textSecondary }} />
              <p className="text-lg font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                Drop files here or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
                accept={accept}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 rounded-lg font-medium cursor-pointer"
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
                className="px-6 py-2 rounded-lg font-medium"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                  opacity: !selectedFile || uploading ? 0.7 : 1,
                }}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
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
        </div>
      </div>
    </div>
  )
}
