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
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:bg-white hover:shadow-md"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              {backLabel}
            </Link>
          </div>

          <div
            className="rounded-2xl p-8 shadow-sm"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                {pageTitle}
              </h1>
              <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Update the details for this record
              </p>
            </div>

            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.primary }} />
              </div>
            ) : (
              <div className="space-y-6">
                {error ? (
                  <div className="p-4 rounded-xl font-medium" style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA" }}>
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="p-4 rounded-xl font-medium" style={{ background: "#DCFCE7", color: "#15803D", border: "1px solid #BBF7D0" }}>
                    Changes saved successfully. Redirecting...
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map((field) => (
                    <div key={field.key} className={field.type === "textarea" || field.type === "checkbox" ? "md:col-span-2" : ""}>
                      {field.type !== "checkbox" ? (
                        <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                          {field.label}
                          {field.required ? <span className="text-red-500"> *</span> : null}
                        </label>
                      ) : null}
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    style={{
                      background: COLORS.primaryGradient,
                      color: COLORS.textWhite,
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <Link
                    href={backHref}
                    className="px-8 py-4 rounded-xl font-bold transition-all hover:bg-gray-200 text-lg"
                    style={{
                      background: COLORS.bgGray,
                      color: COLORS.textPrimary,
                    }}
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
