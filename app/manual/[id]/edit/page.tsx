"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function EditManualPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("Quality Manual")
  const [version, setVersion] = useState("v2.1")
  const [location, setLocation] = useState("QMS")

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={`/manual/${params.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Manual
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
              Edit Manual
            </h1>

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

              <div className="flex gap-2 pt-4">
                <button
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{
                    background: COLORS.primary,
                    color: COLORS.textWhite,
                  }}
                >
                  Save Changes
                </button>
                <Link
                  href={`/manual/${params.id}`}
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
    </div>
  )
}
