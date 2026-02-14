"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Truck } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function SupplierDetailPage() {
  const params = useParams()
  const id = params?.id as string

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/suppliers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: COLORS.bgWhite,
              color: COLORS.textPrimary,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Suppliers
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
                <Truck className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                  Supplier Detail
                </h1>
                <p className="text-lg" style={{ color: COLORS.textSecondary }}>
                  ID: {id}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <p className="text-lg font-medium" style={{ color: COLORS.textPrimary }}>
              Detail View UI Coming Soon
            </p>
            <p className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
              This page is ready for implementation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}