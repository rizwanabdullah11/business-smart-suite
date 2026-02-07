"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function UploadProcedurePage({ params }: { params: { id: string } }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={`/procedures/${params.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Procedure
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

            <div
              className="border-2 border-dashed rounded-lg p-12 text-center"
              style={{ borderColor: COLORS.border }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.textSecondary }} />
              <p className="text-lg font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                Drop files here or click to browse
              </p>
              <p className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>
                Supported formats: PDF, DOC, DOCX
              </p>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx"
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
                className="px-6 py-2 rounded-lg font-medium"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
                disabled={!selectedFile}
              >
                Upload
              </button>
              <Link
                href={`/procedures/${params.id}`}
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