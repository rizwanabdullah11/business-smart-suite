"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Edit, FileText } from "lucide-react"
import { COLORS } from "@/constant/colors"

interface Manual {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  description: string
  content: string
}

export default function ManualDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [manual, setManual] = useState<Manual | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchManual = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manuals/${id}`
        )
        const data = await res.json()
        setManual(data)
      } catch (error) {
        console.error("Failed to fetch manual:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchManual()
  }, [id])

  if (loading) return <div className="p-6">Loading...</div>
  if (!manual) return <div className="p-6">Manual not found</div>

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
              <Link
                href={`/manual/${id}/edit`}
                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                style={{
                  background: COLORS.bgWhite,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>

              <button
                onClick={() =>
                  window.open(
                    `${process.env.NEXT_PUBLIC_API_URL}/manuals/download/${manual.id}`
                  )
                }
                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2"
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
          </div>
        </div>
      </div>
    </div>
  )
}