"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

const fieldClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 text-[0.9375rem] font-medium text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"

export default function NewPolicyPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [location, setLocation] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/categories?type=policy", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!response.ok) throw new Error("Failed to load categories")
        const data = await response.json()
        const normalized = (Array.isArray(data) ? data : [])
          .filter((cat: Record<string, unknown>) => !cat?.archived && !cat?.isArchived)
          .map((cat: Record<string, unknown>) => ({
            id: String(cat._id ?? cat.id),
            name: String(cat.name ?? ""),
          }))
          .filter((cat: { id: string; name: string }) => cat.id && cat.name)
        setCategories(normalized)
        setCategory((prev) => prev || normalized[0]?.id || "")
      } catch (error) {
        console.error("Error loading policy categories:", error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setSubmitError("Title is required")
      return
    }
    if (!category) {
      setSubmitError("Select a category before creating a policy.")
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const token = localStorage.getItem("token")
      const payload = {
        title: trimmed,
        version: version.trim() || undefined,
        location: location.trim() || undefined,
        issueDate: issueDate || undefined,
        category,
        categoryId: category,
      }
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Could not create policy"
        )
      }
      const newId =
        typeof data?.id === "string"
          ? data.id
          : data?._id != null
            ? String(data._id)
            : null
      if (newId) router.push(`/policies/${newId}`)
      else router.push("/policies")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not create policy")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100 via-[#eef1f7] to-slate-200/90 pb-16"
      style={{ fontFamily: "var(--font-app-sans), ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="ui-task-detail-shell">
        <div className="mb-5 flex items-start">
          <Link
            href="/policies"
            className="ui-btn ui-btn-secondary group inline-flex min-h-[2.625rem] items-center gap-2 rounded-xl px-4 py-2.5 text-[0.9375rem] font-semibold shadow-sm transition hover:border-slate-300"
          >
            <ArrowLeft
              className="h-4 w-4 text-slate-600 transition group-hover:-translate-x-0.5"
              strokeWidth={2.25}
              aria-hidden
            />
            Back to Policies
          </Link>
        </div>

        <article
          className="ui-card-main w-full overflow-hidden rounded-3xl border-x-0 border-t-0 border-b border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-[2px]"
          style={{ boxShadow: "0 24px 56px -26px rgba(15, 23, 42, 0.18)" }}
        >
          <header className="relative border-b border-slate-200/70 px-4 py-9 sm:px-8 sm:py-11">
            <div className="pointer-events-none absolute inset-0 opacity-95 bg-[linear-gradient(125deg,#faf5ff_0%,#f8fafc_40%,#eff6ff_100%)]" />
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-violet-400/12 blur-3xl" />
            <div className="relative">
              <p className="mb-2 inline-flex rounded-full border border-violet-200/80 bg-white/90 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-violet-800 shadow-sm">
                Policies
              </p>
              <h1 className="ui-display-title mt-3 max-w-[min(48rem,100%)] bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-700 bg-clip-text text-transparent">
                Create New Policy
              </h1>
              <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-slate-600">
                Add a controlled policy record. Fields below match your policy list columns; wider layout keeps the form readable on large screens.
              </p>
            </div>
          </header>

          <div className="px-4 py-8 sm:px-8 sm:py-11">
            {submitError ? (
              <div
                className="mb-6 rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm font-semibold text-red-900 shadow-sm"
                role="alert"
              >
                {submitError}
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label htmlFor="policy-category" className="ui-label mb-2 block">
                  Category
                </label>
                <select
                  id="policy-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={categoriesLoading || categories.length === 0}
                  className={fieldClass}
                >
                  {categoriesLoading ? (
                    <option value="">Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="">No policy categories — add one on the Policies page</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="policy-title" className="ui-label mb-2 block">
                  Title
                </label>
                <input
                  id="policy-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter policy title..."
                  className={fieldClass}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="policy-version" className="ui-label mb-2 block">
                  Version
                </label>
                <input
                  id="policy-version"
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g., v1.0"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="policy-location" className="ui-label mb-2 block">
                  Location
                </label>
                <input
                  id="policy-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., QMS"
                  className={fieldClass}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="policy-issue-date" className="ui-label mb-2 block">
                  Issue Date
                </label>
                <input
                  id="policy-issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-8 md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting || categoriesLoading}
                  className="ui-btn ui-btn-primary min-w-[11rem]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      Creating…
                    </>
                  ) : (
                    "Create Policy"
                  )}
                </button>
                <Link href="/policies" className="ui-btn ui-btn-secondary min-w-[9rem] no-underline">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </article>
      </div>
    </div>
  )
}
