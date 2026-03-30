"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { COLORS } from "@/constant/colors"

type FieldType = "text" | "number" | "date" | "textarea" | "select" | "checkbox"

export type DynamicEditField = {
  key: string
  label: string
  type?: FieldType
  placeholder?: string
  options?: string[]
  defaultValue?: string | number | boolean
  required?: boolean
}

type DynamicModuleEditPageProps = {
  id: string
  moduleSlug: string
  pageTitle: string
  backHref: string
  backLabel: string
  fields: DynamicEditField[]
}

function toInitialFieldValue(field: DynamicEditField) {
  if (field.defaultValue !== undefined) return field.defaultValue
  if (field.type === "checkbox") return false
  return ""
}

export default function DynamicModuleEditPage({
  id,
  moduleSlug,
  pageTitle,
  backHref,
  backLabel,
  fields,
}: DynamicModuleEditPageProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, toInitialFieldValue(field)]))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const endpoint = useMemo(() => `/api/${moduleSlug}/${id}`, [id, moduleSlug])
  const fieldsKey = useMemo(() => JSON.stringify(fields), [fields])

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return
      try {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem("token")
        const response = await fetch(endpoint, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!response.ok) {
          throw new Error("Failed to load item")
        }

        const data = await response.json()
        const nextValues = Object.fromEntries(
          fields.map((field) => {
            const rawValue = data?.[field.key]
            if (field.type === "checkbox") return [field.key, Boolean(rawValue)]
            if (field.type === "date") {
              if (!rawValue) return [field.key, ""]
              const date = new Date(rawValue)
              if (Number.isNaN(date.getTime())) return [field.key, String(rawValue)]
              return [field.key, date.toISOString().split("T")[0]]
            }
            if (field.type === "number") {
              return [field.key, rawValue ?? ""]
            }
            return [field.key, rawValue ?? ""]
          })
        )

        setFormData(nextValues)
      } catch (err) {
        console.error(`Failed to load ${moduleSlug} item:`, err)
        setError("Failed to load item data")
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [endpoint, fieldsKey, id, moduleSlug])

  const updateField = (key: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    const missingRequired = fields.find((field) => {
      if (!field.required) return false
      const value = formData[field.key]
      if (field.type === "checkbox") return false
      return value === "" || value === null || value === undefined
    })

    if (missingRequired) {
      setError(`${missingRequired.label} is required`)
      return
    }

    try {
      setSaving(true)
      setError(null)
      const token = localStorage.getItem("token")
      const payload = Object.fromEntries(
        fields.map((field) => {
          const rawValue = formData[field.key]
          if (field.type === "checkbox") return [field.key, Boolean(rawValue)]
          if (field.type === "number") {
            if (rawValue === "" || rawValue === null || rawValue === undefined) return [field.key, ""]
            return [field.key, Number(rawValue)]
          }
          return [field.key, rawValue]
        })
      )

      const response = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || data?.message || "Failed to save item")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(backHref)
      }, 400)
    } catch (err) {
      console.error(`Failed to save ${moduleSlug} item:`, err)
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  const renderField = (field: DynamicEditField) => {
    const value = formData[field.key]
    const commonStyle = {
      borderColor: COLORS.border,
      color: COLORS.textPrimary,
      background: COLORS.bgGrayLight,
    }

    if (field.type === "textarea") {
      return (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => updateField(field.key, e.target.value)}
          rows={4}
          placeholder={field.placeholder}
          disabled={saving}
          className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
          style={commonStyle}
        />
      )
    }

    if (field.type === "select") {
      return (
        <select
          value={String(value ?? "")}
          onChange={(e) => updateField(field.key, e.target.value)}
          disabled={saving}
          className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
          style={commonStyle}
        >
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === "checkbox") {
      return (
        <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border" style={commonStyle}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => updateField(field.key, e.target.checked)}
            disabled={saving}
          />
          <span>{field.label}</span>
        </label>
      )
    }

    return (
      <input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={field.type === "number" ? String(value ?? "") : String(value ?? "")}
        onChange={(e) => updateField(field.key, e.target.value)}
        placeholder={field.placeholder}
        disabled={saving}
        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
        style={commonStyle}
      />
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#f7f8fb 0%,#f3f5f9 100%)" }}>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: COLORS.purple50, color: COLORS.purple700, border: `1px solid ${COLORS.purple200}` }}
                >
                  <Loader2 className="h-5 w-5 opacity-0 absolute" aria-hidden />
                  <span className="text-base font-bold">{pageTitle.charAt(0)}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
                  {pageTitle}
                </h1>
              </div>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Update the details for this record
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: COLORS.primary }} />
            </div>
          ) : (
            <div className="space-y-5">
              {error ? (
                <div className="rounded-xl p-4 text-sm font-medium" style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA" }}>
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-xl p-4 text-sm font-medium" style={{ background: "#DCFCE7", color: "#15803D", border: "1px solid #BBF7D0" }}>
                  Changes saved successfully. Redirecting…
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" || field.type === "checkbox" ? "md:col-span-2" : ""}>
                    {field.type !== "checkbox" ? (
                      <label className="mb-2 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                        {field.label}
                        {field.required ? <span className="text-red-500"> *</span> : null}
                      </label>
                    ) : null}
                    {renderField(field)}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: "#111827", color: COLORS.textWhite }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <Link
                  href={backHref}
                  className="inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
