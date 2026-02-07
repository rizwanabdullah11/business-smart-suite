"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Edit, FileText } from "lucide-react"
import { COLORS } from "@/constant/colors"

// Sample manual data
const sampleManuals: Record<string, any> = {
  "1-1": {
    id: "1-1",
    title: "Quality Manual",
    version: "v2.1",
    issueDate: "2024-01-15",
    location: "QMS",
    description: "Comprehensive quality management system documentation",
    content: "This manual outlines the quality management procedures and standards...",
  },
  "1-2": {
    id: "1-2",
    title: "Safety Manual",
    version: "v3.0",
    issueDate: "2024-02-01",
    location: "HSE",
    description: "Health, Safety, and Environment guidelines",
    content: "This manual covers all safety procedures and protocols...",
  },
  "1-3": {
    id: "1-3",
    title: "Operations Manual",
    version: "v4.2",
    issueDate: "2024-02-05",
    location: "OPS",
    description: "Standard operating procedures",
    content: "This manual details the operational procedures...",
  },
}

export default function ManualDetailPage({ params }: { params: { id: string } }) {
  const [manual] = useState(sampleManuals[params.id] || {
    id: params.id,
    title: "Manual Not Found",
    version: "N/A",
    issueDate: "N/A",
    location: "N/A",
    description: "This manual does not exist",
    content: "No content available",
  })

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
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

        {/* Manual Header */}
        <div
          className="rounded-lg p-6 mb-6"
          style={{
            background: COLORS.bgWhite,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  backgroundColor: `${COLORS.primary}15`,
                  color: COLORS.primary,
                }}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                  {manual.title}
                </h1>
                <p className="text-lg" style={{ color: COLORS.textSecondary }}>
                  {manual.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                style={{
                  background: COLORS.bgWhite,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          {/* Manual Info */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Version
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {manual.version}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Issue Date
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {manual.issueDate}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Location
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {manual.location}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 border-b" style={{ borderColor: COLORS.border }}>
            <button
              className="px-4 py-2 font-medium border-b-2"
              style={{
                borderColor: COLORS.primary,
                color: COLORS.primary,
              }}
            >
              Overview
            </button>
            <button
              className="px-4 py-2 font-medium border-b-2"
              style={{
                borderColor: "transparent",
                color: COLORS.textSecondary,
              }}
            >
              Versions
            </button>
            <button
              className="px-4 py-2 font-medium border-b-2"
              style={{
                borderColor: "transparent",
                color: COLORS.textSecondary,
              }}
            >
              Reviews
            </button>
            <button
              className="px-4 py-2 font-medium border-b-2"
              style={{
                borderColor: "transparent",
                color: COLORS.textSecondary,
              }}
            >
              Audits
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="rounded-lg p-6"
          style={{
            background: COLORS.bgWhite,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.textPrimary }}>
            Manual Content
          </h2>
          <div className="prose max-w-none" style={{ color: COLORS.textSecondary }}>
            <p>{manual.content}</p>
            <p className="mt-4">
              This is a static preview of the manual. In a production environment, this would display
              the full manual content with proper formatting, sections, and navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
