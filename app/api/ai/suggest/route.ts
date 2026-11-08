import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Category from "@/lib/server/models/Category"
import Manual from "@/lib/server/models/Manual"
import { getModuleModel, isSupportedModule } from "@/lib/server/models/module-item"
import { buildModuleAccessFilter } from "@/lib/server/organization-context"
import { isModuleEnabledForUser } from "@/lib/server/module-access"
import { getModuleBrief } from "@/lib/ai/module-briefs"
import { generateJson, isGeminiConfigured } from "@/lib/server/ai/gemini"
import {
  profileToPrompt,
  resolveOrganizationForUser,
  type BusinessProfile,
} from "@/lib/server/ai/business-profile"

type SuggestField = "title" | "category" | "both"

type CategorySuggestion = { name: string; existingId: string | null }

type AiResult = {
  titles?: unknown
  categories?: unknown
}

const MAX_TITLES = 6
const MAX_CATEGORIES = 5

function clean(value: unknown, maxLength = 120) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

function uniqueCaseInsensitive(values: string[], exclude: Set<string> = new Set()) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.toLowerCase()
    if (!value || seen.has(key) || exclude.has(key)) continue
    seen.add(key)
    out.push(value)
  }
  return out
}

/**
 * POST /api/ai/suggest
 * Body: { module: string, categoryType?: string, field?: "title" | "category" | "both", currentTitle?: string }
 * Returns AI suggestions tailored to the active organization's business profile.
 */
export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json().catch(() => ({}))
      const moduleSlug = clean(body?.module, 60)
      const field: SuggestField = ["title", "category", "both"].includes(body?.field) ? body.field : "both"
      const categoryType = clean(body?.categoryType || moduleSlug, 60).toLowerCase()
      const currentTitle = clean(body?.currentTitle, 200)
      const categoryName = clean(body?.categoryName, 80)

      const isManuals = moduleSlug === "manuals"
      if (!isManuals && !isSupportedModule(moduleSlug)) {
        return NextResponse.json({ error: `Unsupported module: ${moduleSlug}` }, { status: 404 })
      }
      if (!isModuleEnabledForUser(user, moduleSlug)) {
        return NextResponse.json({ error: "Module is not enabled for your plan" }, { status: 403 })
      }

      await connectToDatabase()
      const org = await resolveOrganizationForUser(request, user)
      const profile = (org?.businessProfile as BusinessProfile | null | undefined) || null
      const organizationName = org ? org.organizationName || org.name : "this organization"
      const brief = getModuleBrief(moduleSlug)

      // Existing categories for this module in this organization (so AI can reuse them).
      const existingCategories: Array<{ id: string; name: string }> = org
        ? (
            await Category.find({
              type: categoryType,
              organizationId: org._id,
              archived: { $ne: true },
              isArchived: { $ne: true },
            })
              .select("_id name")
              .limit(100)
              .lean()
          ).map((c: any) => ({ id: String(c._id), name: String(c.name || "") }))
        : []

      // Existing titles the user can see (so AI avoids duplicates).
      const Model: mongoose.Model<any> = isManuals ? (Manual as mongoose.Model<any>) : getModuleModel(moduleSlug)
      const { filter: accessFilter } = await buildModuleAccessFilter(request, user)
      const existingTitleDocs = org
        ? await Model.find(Object.keys(accessFilter || {}).length ? accessFilter : { organizationId: org._id })
            .select("title")
            .sort({ createdAt: -1 })
            .limit(80)
            .lean()
        : []
      const existingTitles = existingTitleDocs.map((d: any) => clean(d?.title)).filter(Boolean)
      const existingTitleKeys = new Set(existingTitles.map((t) => t.toLowerCase()))

      let titles: string[] = []
      let categoryNames: string[] = []
      let provider: "gemini" | "local-fallback" = "local-fallback"

      if (isGeminiConfigured()) {
        const prompt = `You are the AI assistant inside an ISO compliance management system.
You are the specialist for the "${brief.label}" module.
Module purpose: ${brief.purpose}

BUSINESS PROFILE
${profileToPrompt(profile, organizationName)}

TASK
Suggest ${field === "category" ? "categories" : field === "title" ? "titles" : "titles and categories"} for a new ${brief.itemLabel} that fit THIS specific business.
Title guidance: ${brief.titleGuidance}
Category guidance: ${brief.categoryGuidance}
${categoryName ? `The ${brief.itemLabel} will be filed in the category "${categoryName}" — titles must fit that category.` : ""}
${currentTitle ? `The user has started typing this title: "${currentTitle}". Improve/complete it and suggest close alternatives, and pick categories that fit it.` : ""}

Existing categories (prefer reusing one when it fits, spelled exactly the same): ${existingCategories.map((c) => c.name).join(" | ") || "(none yet)"}
Existing titles (do NOT repeat these): ${existingTitles.slice(0, 60).join(" | ") || "(none yet)"}

Rules:
- Use UK English.
- Titles: 3-10 words, specific to the business's services, equipment and risks. No numbering, no quotes.
- Categories: 1-4 words.
- Never invent people's names or company names.

Return ONLY JSON: {"titles": string[${MAX_TITLES}], "categories": string[${MAX_CATEGORIES}]}`

        const result = await generateJson<AiResult>([{ text: prompt }], 0.6)
        if (result) {
          provider = "gemini"
          titles = Array.isArray(result.titles) ? result.titles.map((t) => clean(t)) : []
          categoryNames = Array.isArray(result.categories) ? result.categories.map((c) => clean(c, 60)) : []
        }
      }

      if (provider === "local-fallback") {
        const serviceTitles = (profile?.services || [])
          .slice(0, 3)
          .map((service) => `${service} ${brief.itemLabel.replace(/\b\w/g, (ch) => ch.toUpperCase())}`)
        titles = [...serviceTitles, ...brief.fallbackTitles]
        categoryNames = [...existingCategories.map((c) => c.name), ...brief.fallbackCategories]
      }

      const finalTitles =
        field === "category" ? [] : uniqueCaseInsensitive(titles, existingTitleKeys).slice(0, MAX_TITLES)

      const existingByName = new Map(existingCategories.map((c) => [c.name.toLowerCase(), c.id]))
      const finalCategories: CategorySuggestion[] =
        field === "title"
          ? []
          : uniqueCaseInsensitive(categoryNames)
              .slice(0, MAX_CATEGORIES)
              .map((name) => ({ name, existingId: existingByName.get(name.toLowerCase()) || null }))

      return NextResponse.json({
        titles: finalTitles,
        categories: finalCategories,
        provider,
        hasProfile: Boolean(profile),
      })
    } catch (error) {
      console.error("AI suggest error:", error)
      return NextResponse.json(
        { error: `AI suggestions failed: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  { requiredPermissions: [Permission.VIEW_CATEGORIES] }
)
