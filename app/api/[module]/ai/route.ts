import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"
import { connectToDatabase } from "@/lib/server/db"
import { getModuleModel, isSupportedModule } from "@/lib/server/models/module-item"

type EntrySummary = {
  id: string
  title: string
  category: string
  approved: boolean
  highlighted: boolean
  paused: boolean
  archived: boolean
}

function unsupportedModule(module: string) {
  return NextResponse.json({ error: `Unsupported module: ${module}` }, { status: 404 })
}

function toSummary(entry: any): EntrySummary {
  const title = String(entry?.title || entry?.name || "Untitled")
  const category =
    typeof entry?.category === "object" && entry?.category?.name
      ? String(entry.category.name)
      : "Unknown"

  return {
    id: String(entry?._id || ""),
    title,
    category,
    approved: Boolean(entry?.approved),
    highlighted: Boolean(entry?.highlighted),
    paused: Boolean(entry?.paused),
    archived: Boolean(entry?.archived || entry?.isArchived),
  }
}

function localSummary(items: EntrySummary[]) {
  if (!items.length) return "No tasks found to summarize."
  return items
    .map(
      (item) =>
        `- ${item.title}: category ${item.category}, status ${item.approved ? "Completed" : "Pending"}${item.highlighted ? ", highlighted" : ""}${item.paused ? ", paused" : ""}${item.archived ? ", archived" : ""}.`
    )
    .join("\n")
}

async function askGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Gemini request failed: ${message}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  return typeof text === "string" && text.trim() ? text.trim() : null
}

export const POST = withAuth(
  async (request: NextRequest, _user, { params }: { params: { module: string } }) => {
    try {
      const module = params.module
      if (!isSupportedModule(module)) return unsupportedModule(module)

      const body = await request.json()
      const action = String(body?.action || "summarize-all")
      const itemId = body?.itemId ? String(body.itemId) : null
      const categoryId = body?.categoryId ? String(body.categoryId) : null
      const question = String(body?.question || "").trim()

      await connectToDatabase()
      const Model = getModuleModel(module)

      let docs: any[] = []
      if (action === "ask-one" && itemId) {
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
          return NextResponse.json({ error: "Invalid item id" }, { status: 400 })
        }
        const doc = await Model.findById(itemId).populate("category", "name").lean()
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
        docs = await Model.find(query).populate("category", "name").sort({ updatedAt: -1 }).limit(200).lean()
      }

      const summaries = docs.map(toSummary)
      if (!summaries.length) {
        return NextResponse.json({ answer: "No tasks found." })
      }

      const prompt =
        action === "ask-one"
          ? `You are an assistant for business compliance tasks.\nItem:\n${JSON.stringify(summaries[0], null, 2)}\nUser question: ${question || "Summarize this task in 2-4 bullets with title."}\nKeep the answer concise and practical.`
          : action === "ask-category"
            ? `You are an assistant for business compliance tasks.\nThese tasks are from one category.\nTasks JSON:\n${JSON.stringify(summaries, null, 2)}\nUser question: ${question || "Summarize this category tasks with title."}\nKeep the answer concise and practical.`
            : `You are an assistant for business compliance tasks.\nGenerate a concise summary list for ${categoryId ? "the selected category tasks" : "all tasks"}.\nEach line must include task title and a short summary.\nTasks JSON:\n${JSON.stringify(summaries, null, 2)}`

      const geminiAnswer = await askGemini(prompt)

      return NextResponse.json({
        answer: geminiAnswer || localSummary(summaries),
        provider: geminiAnswer ? "gemini" : "local-fallback",
      })
    } catch (error) {
      return NextResponse.json(
        { error: `Module AI failed: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      )
    }
  },
  {
    requiredPermissions: [Permission.VIEW_CATEGORIES],
  }
)
