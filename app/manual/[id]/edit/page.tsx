"use client"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader } from "lucide-react"
import { COLORS } from "@/constant/colors"

export default function EditManualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [location, setLocation] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch manual data on mount
  useEffect(() => {
    const fetchManual = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/manuals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch manual")
        }

        const data = await response.json()
        console.log("Fetched manual data:", data)
        setTitle(data.title || "")
        setVersion(data.version || "")
        setLocation(data.location || "")

        // Format issueDate for <input type="date"> (YYYY-MM-DD)
        const rawDate = data.issueDate || data.createdAt
        if (rawDate) {
          const d = new Date(rawDate)
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            setIssueDate(`${y}-${m}-${day}`)
          }
        }
      } catch (err) {
        console.error("Error fetching manual:", err)
        setError("Failed to load manual data")
      } finally {
        setLoadingData(false)
      }
    }

    if (id) {
      fetchManual()
    }
  }, [id])

  const handleSave = async () => {
    if (!title.trim() || !version.trim() || !location.trim() || !issueDate) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/manuals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          version: version.trim(),
          location: location.trim(),
          issueDate: issueDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Failed to save manual: ${response.statusText}`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/manual`)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving")
      console.error("Save error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-[#eef1f7] to-slate-200/90">
        <div className="ui-card-main flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/95 px-12 py-10 shadow-xl backdrop-blur-sm">
          <Loader className="h-11 w-11 animate-spin text-violet-600" aria-hidden />
          <p className="text-[0.9375rem] font-semibold tracking-tight text-slate-600">Loading manual…</p>
        </div>
      </div>
    )
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 text-[0.9375rem] font-medium text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100 via-[#eef1f7] to-slate-200/90 pb-14"
      style={{ fontFamily: "var(--font-app-sans), ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="ui-page-shell">
        <div className="mb-8">
          <Link
            href="/manual"
            className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-md transition hover:bg-white hover:shadow-lg"
            style={{
              background: "rgba(255,255,255,0.88)",
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 10px 30px -12px rgba(15, 23, 42, 0.12)",
            }}
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Back to Manuals
          </Link>
        </div>

        <article
          className="ui-card-main mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-[2px]"
          style={{ boxShadow: `${COLORS.shadowLg}, 0 0 0 1px rgba(124,58,237,0.06)` }}
        >
          <header className="relative border-b border-slate-200/70 px-6 py-10 sm:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,#faf5ff_0%,#f8fafc_38%,#eff6ff_100%)] opacity-95" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-12 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-violet-200/70 bg-white/90 px-3.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-violet-800 shadow-sm">
                  Documentation
                </span>
                <span className="text-[0.8125rem] font-semibold tracking-tight text-slate-500">
                  Controlled record editor
                </span>
              </div>
              <h1 className="ui-display-title text-slate-900">Edit manual</h1>
              <p className="mt-3 max-w-xl text-[0.9375rem] font-medium leading-relaxed text-slate-600">
                Update title, version, location, and issue date. All fields are required before saving.
              </p>
            </div>
          </header>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {error ? (
              <div
                className="mb-6 rounded-2xl border border-red-200/80 px-5 py-4 text-[0.9375rem] font-semibold text-red-900"
                style={{ background: "#fef2f2" }}
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                className="mb-6 rounded-2xl border border-emerald-200/80 px-5 py-4 text-[0.9375rem] font-semibold text-emerald-900 shadow-sm"
                style={{ background: "#ecfdf5" }}
              >
                Manual saved successfully. Redirecting…
              </div>
            ) : null}

            <div className="space-y-8">
              <div>
                <label className="ui-label mb-2.5 block">
                  Manual title <span className="font-bold text-red-500 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  placeholder="e.g., Quality Management Manual"
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-10">
                <div>
                  <label className="ui-label mb-2.5 block">
                    Version <span className="font-bold text-red-500 normal-case tracking-normal">*</span>
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    disabled={loading}
                    placeholder="e.g., v1.0"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="ui-label mb-2.5 block">
                    Issue date <span className="font-bold text-red-500 normal-case tracking-normal">*</span>
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    disabled={loading}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className="ui-label mb-2.5 block">
                  Location <span className="font-bold text-red-500 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                  placeholder="e.g., QMS"
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                <Link
                  href="/manual"
                  className="order-2 inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/90 px-8 text-[0.9375rem] font-bold text-slate-800 transition hover:bg-slate-100 sm:order-1 sm:flex-none"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="order-1 inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-xl px-8 text-[0.9375rem] font-bold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:min-w-[200px] sm:flex-none"
                  style={{ background: COLORS.primaryGradient }}
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
