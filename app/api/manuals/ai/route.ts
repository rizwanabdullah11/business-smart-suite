import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import Manual from "@/lib/server/models/Manual"
import mongoose from "mongoose"
import { buildModuleAccessFilter } from "@/lib/server/organization-context"
import { generateText } from "@/lib/server/ai/gemini"

type ManualSummary = {
  id: string
  title: string
  version: string
  location: string
  issueDate: string
  approved: boolean
  highlighted: boolean
  paused: boolean
  archived: boolean
}

function mapManual(doc: any): ManualSummary {
  return {
    id: String(doc?._id || ""),
    title: String(doc?.title || "Untitled"),
    version: String(doc?.version || "v1.0"),
    location: String(doc?.location || "QMS"),
    issueDate: String(doc?.issueDate || "N/A"),
    approved: Boolean(doc?.approved),
    highlighted: Boolean(doc?.highlighted),
    paused: Boolean(doc?.paused),
    archived: Boolean(doc?.archived || doc?.isArchived),
  }
}

function localSummary(items: ManualSummary[]) {
  if (!items.length) return "No manuals found to summarize."
  return items
    .map(
      (m) =>
        `- ${m.title}: version ${m.version}, location ${m.location}, issue date ${m.issueDate}, status ${m.approved ? "Completed" : "Pending"}${m.highlighted ? ", highlighted" : ""}${m.paused ? ", paused" : ""}${m.archived ? ", archived" : ""}.`
    )
    .join("\n")
}


export const POST = withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json()
      const action = String(body?.action || "summarize-all")
      const question = String(body?.question || "").trim()
      const manualId = body?.manualId ? String(body.manualId) : null
      const categoryId = body?.categoryId ? String(body.categoryId) : null

      await connectToDatabase()
      // Only read manuals the current user is allowed to see (organization scope).
      const { filter: accessFilter } = await buildModuleAccessFilter(request, user)
      const scope = Object.keys(accessFilter || {}).length ? [accessFilter] : []

      let docs: any[] = []
      if (action === "ask-one" && manualId) {
        if (!mongoose.Types.ObjectId.isValid(manualId)) {
          return NextResponse.json({ error: "Invalid manual id" }, { status: 400 })
        }
        const doc = await Manual.findOne({ $and: [{ _id: new mongoose.Types.ObjectId(manualId) }, ...scope] }).lean()
        docs = doc ? [doc] : []
      } else {
        const query: Record<string, unknown> = {}
        if (categoryId) {
          if (mongoose.Types.ObjectId.isValid(categoryId)) {
            const objectId = new mongoose.Types.ObjectId(categoryId)
            query.$or = [
              { category: objectId },
              { categoryId: objectId },
              { category: categoryId },
              { categoryId: categoryId },
            ]
          } else {
            query.$or = [{ category: categoryId }, { categoryId: categoryId }]
          }
        }

        docs = await Manual.find(scope.length ? { $and: [query, ...scope] } : query)
          .sort({ updatedAt: -1 })
          .limit(200)
          .lean()
      }

      const manuals = docs.map(mapManual)
      if (!manuals.length) {
        return NextResponse.json({ answer: "No manuals found." })
      }

      const prompt =
        action === "ask-one"
          ? `You are an assistant for ISO documentation.\nManual:\n${JSON.stringify(manuals[0], null, 2)}\n\nUser question: ${question || "Summarize this manual in 2-4 bullets with title."}\n\nKeep the answer concise and practical.`
          : action === "ask-category"
            ? `You are an assistant for ISO documentation.\nThese manuals are from one category.\nManuals JSON:\n${JSON.stringify(manuals, null, 2)}\n\nUser question: ${question || "Summarize this category tasks with title."}\n\nAnswer clearly and concisely.`
            : `You are an assistant for ISO documentation.\nGenerate a concise summary list for ${categoryId ? "the selected category tasks" : "all manual tasks"}.\nEach line must include title and a short summary.\nManuals JSON:\n${JSON.stringify(manuals, null, 2)}`

      const geminiAnswer = await generateText(prompt)

      return NextResponse.json({
        answer: geminiAnswer || localSummary(manuals),
        provider: geminiAnswer ? "gemini" : "local-fallback",
      })
    } catch (error) {
      return NextResponse.json(
        { error: `Manual AI failed: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_MANUALS],
  }
)
