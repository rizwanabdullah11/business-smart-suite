import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { connectToDatabase } from "@/lib/server/db"
import type { AuthUser } from "@/lib/server/auth"
import {
  buildBusinessProfile,
  resolveOrganizationForUser,
  MAX_PROFILE_FILE_BYTES,
  MAX_PROFILE_TEXT,
} from "@/lib/server/ai/business-profile"

const TEXT_TYPES = new Set(["text/plain", "text/markdown", "text/x-markdown"])

function canManageProfile(user: AuthUser) {
  return user.role === "admin" || user.role === "organization"
}

/**
 * GET /api/ai/business-profile[?organizationId=...]
 * Returns the business profile of the active organization.
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    if (!canManageProfile(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await connectToDatabase()
    const organizationId = new URL(request.url).searchParams.get("organizationId")
    const org = await resolveOrganizationForUser(request, user, organizationId)
    if (!org) {
      return NextResponse.json({ error: "Select an organization first" }, { status: 400 })
    }
    return NextResponse.json({
      organizationId: String(org._id),
      organizationName: org.organizationName || org.name,
      profile: org.businessProfile || null,
    })
  } catch (error) {
    console.error("Business profile GET error:", error)
    return NextResponse.json({ error: "Failed to load business profile" }, { status: 500 })
  }
})

/**
 * PUT /api/ai/business-profile  (multipart/form-data)
 *   text            - business description (optional if file given)
 *   file            - .pdf, .txt or .md (optional)
 *   organizationId  - admin only; defaults to active organization
 */
export const PUT = withAuth(async (request: NextRequest, user) => {
  try {
    if (!canManageProfile(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const form = await request.formData()
    const organizationId = String(form.get("organizationId") || "") || null
    let text = String(form.get("text") || "").trim()
    const file = form.get("file")

    let filePayload: { name: string; mimeType: string; base64: string } | null = null
    if (file && typeof file !== "string" && file.size > 0) {
      if (file.size > MAX_PROFILE_FILE_BYTES) {
        return NextResponse.json({ error: "File is too large (max 8 MB)" }, { status: 400 })
      }
      const name = file.name || "upload"
      const lower = name.toLowerCase()
      const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf")
      const isText = TEXT_TYPES.has(file.type) || lower.endsWith(".txt") || lower.endsWith(".md")

      if (isPdf) {
        const buffer = Buffer.from(await file.arrayBuffer())
        filePayload = { name, mimeType: "application/pdf", base64: buffer.toString("base64") }
      } else if (isText) {
        const fileText = (await file.text()).trim()
        text = [text, fileText].filter(Boolean).join("\n\n")
        filePayload = { name, mimeType: "text/plain", base64: "" }
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Upload a PDF, .txt or .md file (for Word, save as PDF first)." },
          { status: 400 }
        )
      }
    }

    if (!text && !filePayload) {
      return NextResponse.json({ error: "Add a business description or upload a file" }, { status: 400 })
    }

    await connectToDatabase()
    const org = await resolveOrganizationForUser(request, user, organizationId)
    if (!org) {
      return NextResponse.json({ error: "Organization not found. Select an organization first." }, { status: 400 })
    }

    const profile = await buildBusinessProfile({
      organizationName: org.organizationName || org.name,
      text: text.slice(0, MAX_PROFILE_TEXT),
      file: filePayload,
    })

    org.businessProfile = profile as unknown as Record<string, unknown>
    org.markModified("businessProfile")
    await org.save()

    return NextResponse.json({ organizationId: String(org._id), profile })
  } catch (error) {
    console.error("Business profile PUT error:", error)
    const message = error instanceof Error ? error.message : "Failed to save business profile"
    return NextResponse.json({ error: message }, { status: 500 })
  }
})
