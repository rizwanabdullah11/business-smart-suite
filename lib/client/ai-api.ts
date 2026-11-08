"use client"

export type BusinessProfile = {
  businessName: string
  industry: string
  summary: string
  services: string[]
  locations: string[]
  equipment: string[]
  keyRisks: string[]
  isoStandards: string[]
  keywords: string[]
  sourceText: string
  sourceFileName: string | null
  updatedAt: string
}

export type AiSuggestions = {
  titles: string[]
  categories: Array<{ name: string; existingId: string | null }>
  provider: "gemini" | "local-fallback"
  hasProfile: boolean
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({}))
  return String(data?.error || data?.message || fallback)
}

export async function fetchAiSuggestions(input: {
  module: string
  categoryType?: string
  field?: "title" | "category" | "both"
  currentTitle?: string
  categoryName?: string
}): Promise<AiSuggestions> {
  const response = await fetch("/api/ai/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(await readError(response, "AI suggestions failed"))
  return response.json()
}

export async function createCategory(name: string, type: string): Promise<{ id: string; _id: string; name: string }> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name, type }),
  })
  if (!response.ok) throw new Error(await readError(response, "Could not create category"))
  const data = await response.json()
  const id = String(data?._id || data?.id || "")
  return { id, _id: id, name: String(data?.name || name) }
}

export async function getBusinessProfile(organizationId?: string | null) {
  const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : ""
  const response = await fetch(`/api/ai/business-profile${query}`, { headers: authHeaders() })
  if (!response.ok) throw new Error(await readError(response, "Could not load business profile"))
  return (await response.json()) as {
    organizationId: string
    organizationName: string
    profile: BusinessProfile | null
  }
}

export async function saveBusinessProfile(input: {
  organizationId?: string | null
  text: string
  file?: File | null
}) {
  const form = new FormData()
  form.append("text", input.text)
  if (input.organizationId) form.append("organizationId", input.organizationId)
  if (input.file) form.append("file", input.file)

  const response = await fetch("/api/ai/business-profile", {
    method: "PUT",
    headers: authHeaders(),
    body: form,
  })
  if (!response.ok) throw new Error(await readError(response, "Could not save business profile"))
  return (await response.json()) as { organizationId: string; profile: BusinessProfile }
}
