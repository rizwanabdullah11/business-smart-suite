"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Plus, Sparkles, X } from "lucide-react"
import { createCategory, fetchAiSuggestions, type AiSuggestions } from "@/lib/client/ai-api"
import { useAuth } from "@/contexts/auth-context"

type CategoryOption = { id?: string; _id?: string; name: string }

type AISuggestProps = {
  /** API module slug, e.g. "manuals", "policies", "risk-assessments" */
  moduleSlug: string
  /** Category type used by /api/categories?type=..., e.g. "manual", "policy" */
  categoryType: string
  /** What the user typed so far (AI improves it if present) */
  currentTitle?: string
  /** Categories already loaded on the page */
  categories?: ReadonlyArray<CategoryOption>
  onSelectTitle?: (title: string) => void
  /** Called with the category id to select */
  onSelectCategory?: (categoryId: string) => void
  /** Called after AI creates a brand-new category, so the page can add it to its dropdown */
  onCategoryCreated?: (category: { id: string; _id: string; name: string }) => void
  /** Which suggestions to show (default: both) */
  field?: "title" | "category" | "both"
  /** Label for the title chips (e.g. "Supplier name") */
  titleLabel?: string
  /** When the category is already chosen (e.g. adding inside a category card), tell the AI */
  categoryName?: string
  /**
   * "New category" mode: suggest NEW category names only and pass the picked name back
   * (e.g. to fill a "Create New Category" input). Overrides title/category selection.
   */
  onPickCategoryName?: (name: string) => void
  /** What the user typed in the category name box so far (category mode) */
  currentCategory?: string
}

function categoryId(option: CategoryOption) {
  return String(option.id || option._id || "")
}

/**
 * "✨ Suggest with AI" — drop next to a Title field on any New form.
 * Suggestions are tailored to the organization's business profile and the module.
 */
export function AISuggest({
  moduleSlug,
  categoryType,
  currentTitle = "",
  categories = [],
  onSelectTitle,
  onSelectCategory,
  onCategoryCreated,
  field = "both",
  titleLabel = "Title ideas",
  categoryName,
  onPickCategoryName,
  currentCategory = "",
}: AISuggestProps) {
  const { isAdmin, isOrganization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AiSuggestions | null>(null)
  const [creating, setCreating] = useState<string | null>(null)

  const categoryNameMode = Boolean(onPickCategoryName)
  const effectiveField = categoryNameMode ? "category" : onSelectCategory ? field : "title"

  const runSuggest = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAiSuggestions({
        module: moduleSlug,
        categoryType,
        field: effectiveField,
        currentTitle: categoryNameMode ? undefined : currentTitle.trim() || undefined,
        categoryName: categoryName?.trim() || undefined,
        currentCategory: categoryNameMode ? currentCategory.trim() || undefined : undefined,
        newCategoriesOnly: categoryNameMode || undefined,
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI suggestions failed")
    } finally {
      setLoading(false)
    }
  }

  const pickCategory = async (suggestion: { name: string; existingId: string | null }) => {
    if (!onSelectCategory) return
    // Match against categories already on the page first (covers ids the API didn't know about).
    const local = categories.find((c) => c.name.trim().toLowerCase() === suggestion.name.trim().toLowerCase())
    const knownId = suggestion.existingId || (local ? categoryId(local) : "")
    if (knownId) {
      onSelectCategory(knownId)
      return
    }

    setCreating(suggestion.name)
    setError(null)
    try {
      const created = await createCategory(suggestion.name, categoryType)
      onCategoryCreated?.(created)
      onSelectCategory(created.id)
      setResult((prev) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) =>
                c.name === suggestion.name ? { ...c, existingId: created.id } : c
              ),
            }
          : prev
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category")
    } finally {
      setCreating(null)
    }
  }

  const canEditProfile = isAdmin || isOrganization

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={runSuggest}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Thinking…" : result ? "Suggest again" : "Suggest with AI"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-3 space-y-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-violet-700">
              {result.provider === "gemini" ? "AI suggestions for your business" : "Standard suggestions (AI key not set)"}
            </p>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-violet-400 hover:text-violet-700"
              aria-label="Close suggestions"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {result.titles.length > 0 && onSelectTitle && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{titleLabel}</p>
              <div className="flex flex-wrap gap-2">
                {result.titles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => onSelectTitle(title)}
                    className={`rounded-full border px-3 py-1 text-left text-sm transition ${
                      currentTitle.trim() === title
                        ? "border-violet-500 bg-violet-600 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {categoryNameMode && result.categories.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Category name ideas</p>
              <div className="flex flex-wrap gap-2">
                {result.categories.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => onPickCategoryName?.(cat.name)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      currentCategory.trim() === cat.name
                        ? "border-violet-500 bg-violet-600 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!categoryNameMode && result.categories.length > 0 && onSelectCategory && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Category ideas</p>
              <div className="flex flex-wrap gap-2">
                {result.categories.map((cat) => {
                  const isNew =
                    !cat.existingId &&
                    !categories.some((c) => c.name.trim().toLowerCase() === cat.name.trim().toLowerCase())
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      disabled={creating !== null}
                      onClick={() => pickCategory(cat)}
                      title={isNew ? "Creates this category and selects it" : "Select this category"}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60"
                    >
                      {creating === cat.name ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isNew ? (
                        <Plus className="h-3.5 w-3.5 text-violet-600" />
                      ) : null}
                      {cat.name}
                    </button>
                  )
                })}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                <Plus className="inline h-3 w-3" /> = new category, created when you tap it.
              </p>
            </div>
          )}

          {result.titles.length === 0 && result.categories.length === 0 && (
            <p className="text-sm text-slate-600">No new ideas — try typing a few words first.</p>
          )}

          {!result.hasProfile && (
            <p className="text-xs text-slate-600">
              Tip:{" "}
              {canEditProfile ? (
                <Link href="/business-profile" className="font-semibold text-violet-700 underline">
                  add your business profile
                </Link>
              ) : (
                "ask your organization admin to add a business profile"
              )}{" "}
              so suggestions match your business.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default AISuggest
