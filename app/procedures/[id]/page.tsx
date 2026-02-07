"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Edit, List } from "lucide-react"
import { COLORS } from "@/constant/colors"

// Sample data
const sampleProcedures: Record<string, any> = {
  "1-1": {
    id: "1-1",
    title: "SOP-001: Machine Operation",
    version: "v4.0",
    issueDate: "2024-01-10",
    location: "PROD",
    description: "Standard operating procedure for CNC machine operation",
    content: "1. Ensure safety guards are in place.\n2. Turn on main power...",
  },
  "1-2": {
    id: "1-2",
    title: "SOP-002: Quality Check Process",
    version: "v2.5",
    issueDate: "2024-02-05",
    location: "QA",
    description: "Quality assurance inspection steps",
    content: "1. Select sample size.\n2. Visual inspection...",
  },
}

export default function ProcedureDetailPage({ params }: { params: { id: string } }) {
  const [proc] = useState(sampleProcedures[params.id] || {
    id: params.id,
    title: "Procedure Not Found",
    version: "N/A",
    issueDate: "N/A",
    location: "N/A",
    description: "This procedure does not exist",
    content: "No content available",
  })

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/procedures"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: COLORS.bgWhite,
              color: COLORS.textPrimary,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Procedures
          </Link>
        </div>

        {/* Header */}
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
                <List className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                  {proc.title}
                </h1>
                <p className="text-lg" style={{ color: COLORS.textSecondary }}>
                  {proc.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/procedures/${params.id}/edit`}>
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
              </Link>
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

          {/* Info */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Version
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {proc.version}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Issue Date
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {proc.issueDate}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Location
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {proc.location}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 border-b" style={{ borderColor: COLORS.border }}>
            <button className="px-4 py-2 font-medium border-b-2" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
              Overview
            </button>
            <button className="px-4 py-2 font-medium border-b-2" style={{ borderColor: "transparent", color: COLORS.textSecondary }}>
              Versions
            </button>
            <button className="px-4 py-2 font-medium border-b-2" style={{ borderColor: "transparent", color: COLORS.textSecondary }}>
              Reviews
            </button>
            <button className="px-4 py-2 font-medium border-b-2" style={{ borderColor: "transparent", color: COLORS.textSecondary }}>
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
            Procedure Content
          </h2>
          <div className="prose max-w-none" style={{ color: COLORS.textSecondary }}>
            <p>{proc.content}</p>
            <p className="mt-4">
              This is a static preview. In a real application, the actual procedure document would be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}