import type { NextRequest } from "next/server"
import mongoose from "mongoose"
import User from "@/lib/server/models/User"
import { ROLE } from "@/lib/server/utils/roles"
import type { AuthUser } from "@/lib/server/auth"
import { getActiveOrganizationIdFromRequest } from "@/lib/server/organization-context"
import { generateJson, isGeminiConfigured, type GeminiPart } from "./gemini"

/** AI-ready summary of an organization, stored on the Organization user record. */
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

export const MAX_PROFILE_TEXT = 20_000
export const MAX_PROFILE_FILE_BYTES = 8 * 1024 * 1024

function toStringList(value: unknown, max = 12): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .slice(0, max)
}

/**
 * Build a structured profile from the text the user typed and/or an uploaded file.
 * PDFs are read by Gemini directly; .txt/.md files are read as text.
 */
export async function buildBusinessProfile(input: {
  organizationName: string
  text: string
  file?: { name: string; mimeType: string; base64: string } | null
}): Promise<BusinessProfile> {
  const sourceText = input.text.slice(0, MAX_PROFILE_TEXT)
  const now = new Date().toISOString()

  if (!isGeminiConfigured()) {
    if (input.file && input.file.mimeType === "application/pdf") {
      throw new Error("GEMINI_API_KEY is not set, so PDF files cannot be read. Paste the text instead or add the key.")
    }
    return {
      businessName: input.organizationName,
      industry: "",
      summary: sourceText.slice(0, 800),
      services: [],
      locations: [],
      equipment: [],
      keyRisks: [],
      isoStandards: [],
      keywords: [],
      sourceText,
      sourceFileName: input.file?.name || null,
      updatedAt: now,
    }
  }

  const parts: GeminiPart[] = [
    {
      text: `You build a business profile used to tailor an ISO compliance management system (documents, risks, training, legal register, etc.).
Organization name: ${input.organizationName}

Read the business description below (and the attached document, if any) and return ONLY JSON with this exact shape:
{
  "businessName": string,
  "industry": string,                 // e.g. "Gutter cleaning & exterior property maintenance"
  "summary": string,                  // 3-5 sentences: what they do, for whom, where, how
  "services": string[],               // main services/products
  "locations": string[],              // areas/cities/countries served
  "equipment": string[],              // key equipment, vehicles, tools, systems
  "keyRisks": string[],               // main operational / H&S / business risks
  "isoStandards": string[],           // ISO standards they hold or target (empty if unknown)
  "keywords": string[]                // 5-12 domain terms useful for naming documents
}
Only use facts stated or clearly implied. Do not invent company names, people or numbers.

Business description:
${sourceText || "(see attached document)"}`,
    },
  ]

  if (input.file && input.file.mimeType === "application/pdf") {
    parts.push({ inline_data: { mime_type: "application/pdf", data: input.file.base64 } })
  }

  const result = await generateJson<Partial<BusinessProfile>>(parts, 0.2)
  if (!result) {
    throw new Error("AI could not read the business description. Try again or paste plain text.")
  }

  return {
    businessName: String(result.businessName || input.organizationName).trim(),
    industry: String(result.industry || "").trim(),
    summary: String(result.summary || "").trim(),
    services: toStringList(result.services),
    locations: toStringList(result.locations),
    equipment: toStringList(result.equipment),
    keyRisks: toStringList(result.keyRisks),
    isoStandards: toStringList(result.isoStandards),
    keywords: toStringList(result.keywords),
    sourceText,
    sourceFileName: input.file?.name || null,
    updatedAt: now,
  }
}

/** Compact text version of a profile for use inside prompts. */
export function profileToPrompt(profile: BusinessProfile | null | undefined, fallbackName: string) {
  if (!profile) {
    return `Organization: ${fallbackName}\n(No business profile uploaded yet — keep suggestions generic but practical.)`
  }
  const line = (label: string, values: string[]) => (values.length ? `${label}: ${values.join(", ")}\n` : "")
  return (
    `Organization: ${profile.businessName || fallbackName}\n` +
    (profile.industry ? `Industry: ${profile.industry}\n` : "") +
    (profile.summary ? `Summary: ${profile.summary}\n` : "") +
    line("Services", profile.services) +
    line("Locations", profile.locations) +
    line("Equipment", profile.equipment) +
    line("Key risks", profile.keyRisks) +
    line("ISO standards", profile.isoStandards) +
    line("Keywords", profile.keywords)
  ).trim()
}

/**
 * Resolve which Organization record the current user is working in.
 * - Organization: itself
 * - Employee / Auditor: their organization
 * - Admin: the active organization (x-organization-id header / activeOrganizationId cookie),
 *   or an explicit organizationId (admin only)
 */
export async function resolveOrganizationForUser(
  request: NextRequest,
  user: AuthUser,
  explicitOrganizationId?: string | null
) {
  let organizationId: string | null = null
  if (user.role === "admin") {
    organizationId = explicitOrganizationId || getActiveOrganizationIdFromRequest(request, user)
  } else {
    organizationId = getActiveOrganizationIdFromRequest(request, user)
  }

  if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) return null

  return User.findOne({ _id: new mongoose.Types.ObjectId(organizationId), role: ROLE.ORGANIZATION })
}
