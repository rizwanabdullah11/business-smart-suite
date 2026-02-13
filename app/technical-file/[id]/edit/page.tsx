"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function EditTechnicalFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/technical-file"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Technical Files
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
              Edit Technical File
            </h1>

            <div className="text-center py-12">
              <p className="text-lg font-medium" style={{ color: COLORS.textPrimary }}>
                Edit Form UI Coming Soon
              </p>
              <p className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
                ID: {id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}