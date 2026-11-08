"use client"

import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { BusinessProfileEditor } from "@/components/ai/BusinessProfileEditor"

export default function BusinessProfilePage() {
  const { isAdmin, isOrganization, loading } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Business profile for AI</h1>
          </div>
          <p className="mb-5 text-sm text-slate-600">
            Tell the AI about your business once. Every module (Manuals, Policies, Risk Assessments, Training,
            Legal Register…) then suggests titles and categories that fit your company.
          </p>

          {loading ? null : isAdmin || isOrganization ? (
            <>
              {isAdmin && (
                <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Admin: this edits the organization currently selected in the company selector.
                </p>
              )}
              <BusinessProfileEditor />
            </>
          ) : (
            <p className="text-sm text-slate-600">Only the organization account or an admin can edit the business profile.</p>
          )}
        </div>
      </div>
    </div>
  )
}
