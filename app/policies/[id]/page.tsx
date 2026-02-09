"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Edit, FileText } from "lucide-react"
import { COLORS } from "@/constant/colors"

// Sample policy data
const samplePolicies: Record<string, any> = {
  "1-1": {
    id: "1-1",
    title: "Quality Policy",
    version: "v2.1",
    issueDate: "2024-01-15",
    location: "QMS",
    description: "Comprehensive quality management system policy",
    content: "This policy outlines the quality management standards and commitments of the organization...",
  },
  "1-2": {
    id: "1-2",
    title: "Safety Policy",
    version: "v3.0",
    issueDate: "2024-02-01",
    location: "HSE",
    description: "Health, Safety, and Environment guidelines",
    content: "This policy covers all safety procedures, protocols, and employee responsibilities...",
  },
  "1-3": {
    id: "1-3",
    title: "Environmental Policy",
    version: "v4.2",
    issueDate: "2024-02-05",
    location: "ENV",
    description: "Environmental protection and sustainability standards",
    content: "This policy details our commitment to environmental stewardship and sustainable practices...",
  },
  "2-1": {
    id: "2-1",
    title: "Employee Handbook",
    version: "v1.5",
    issueDate: "2024-01-20",
    location: "HR",
    description: "General employee guidelines and information",
    content: "This handbook provides an overview of company policies, benefits, and code of conduct...",
  },
  "2-2": {
    id: "2-2",
    title: "Code of Conduct",
    version: "v2.3",
    issueDate: "2024-01-25",
    location: "HR",
    description: "Professional behavior and ethics standards",
    content: "This code of conduct establishes the expected standards of behavior for all employees...",
  },
}

export default function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [policy] = useState(samplePolicies[id] || {
    id: id,
    title: "Policy Not Found",
    version: "N/A",
    issueDate: "N/A",
    location: "N/A",
    description: "This policy does not exist",
    content: "No content available",
  })

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/policies"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: COLORS.bgWhite,
              color: COLORS.textPrimary,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Policies
          </Link>
        </div>

        {/* Policy Header */}
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
                  {policy.title}
                </h1>
                <p className="text-lg" style={{ color: COLORS.textSecondary }}>
                  {policy.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/policies/${params.id}/edit`}>
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

          {/* Policy Info */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Version
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {policy.version}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Issue Date
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {policy.issueDate}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Location
              </p>
              <p className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {policy.location}
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
            Policy Content
          </h2>
          <div className="prose max-w-none" style={{ color: COLORS.textSecondary }}>
            <p>{policy.content}</p>
            <p className="mt-4">
              This is a static preview of the policy. In a production environment, this would display
              the full policy content with proper formatting, sections, and navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
