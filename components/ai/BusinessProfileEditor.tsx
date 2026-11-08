"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, FileText, Loader2, Sparkles, Upload, X } from "lucide-react"
import { getBusinessProfile, saveBusinessProfile, type BusinessProfile } from "@/lib/client/ai-api"

const ACCEPTED_FILES = ".pdf,.txt,.md,application/pdf,text/plain,text/markdown"

type BusinessProfileFieldsProps = {
  text: string
  onTextChange: (value: string) => void
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

/** Text + file inputs for a business description. Used by the editor and the "Add organization" form. */
export function BusinessProfileFields({ text, onTextChange, file, onFileChange, disabled }: BusinessProfileFieldsProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={disabled}
        rows={6}
        placeholder="Describe the business: what you do, services, customers, areas covered, equipment, vehicles, number of staff, ISO standards you want…"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILES}
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          Upload document
        </button>
        {file ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            <FileText className="h-3.5 w-3.5" />
            {file.name}
            <button
              type="button"
              onClick={() => {
                onFileChange(null)
                if (inputRef.current) inputRef.current.value = ""
              }}
              aria-label="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : (
          <span className="text-xs text-slate-500">PDF, .txt or .md (max 8 MB). For Word, save as PDF.</span>
        )}
      </div>
    </div>
  )
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BusinessProfileSummary({ profile }: { profile: BusinessProfile }) {
  return (
    <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
        <CheckCircle2 className="h-4 w-4" />
        AI profile ready
        <span className="font-normal text-emerald-700">
          · updated {new Date(profile.updatedAt).toLocaleDateString()}
        </span>
      </div>
      {profile.industry && (
        <p className="text-sm text-slate-800">
          <strong>Industry:</strong> {profile.industry}
        </p>
      )}
      {profile.summary && <p className="text-sm text-slate-700">{profile.summary}</p>}
      <ChipList label="Services" items={profile.services} />
      <ChipList label="Locations" items={profile.locations} />
      <ChipList label="Equipment" items={profile.equipment} />
      <ChipList label="Key risks" items={profile.keyRisks} />
      <ChipList label="ISO standards" items={profile.isoStandards} />
    </div>
  )
}

type BusinessProfileEditorProps = {
  /** Admin: which organization to edit. Omit to use the active organization. */
  organizationId?: string | null
  onSaved?: (profile: BusinessProfile) => void
}

/** Load, edit and regenerate an organization's AI business profile. */
export function BusinessProfileEditor({ organizationId, onSaved }: BusinessProfileEditorProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState("")
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getBusinessProfile(organizationId)
      .then((data) => {
        if (cancelled) return
        setOrganizationName(data.organizationName)
        setProfile(data.profile)
        setText(data.profile?.sourceText || "")
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load profile"))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [organizationId])

  const handleSave = async () => {
    if (!text.trim() && !file) {
      setError("Add a description or upload a document first.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const data = await saveBusinessProfile({ organizationId, text, file })
      setProfile(data.profile)
      setFile(null)
      onSaved?.(data.profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading business profile…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {organizationName && (
        <p className="text-sm text-slate-600">
          Organization: <strong className="text-slate-900">{organizationName}</strong>
        </p>
      )}

      <BusinessProfileFields text={text} onTextChange={setText} file={file} onFileChange={setFile} disabled={saving} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {saving ? "Reading your business…" : profile ? "Update profile with AI" : "Create profile with AI"}
      </button>

      {profile && <BusinessProfileSummary profile={profile} />}
    </div>
  )
}

export default BusinessProfileEditor
