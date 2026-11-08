/**
 * Shared Gemini client for all AI features.
 *
 * Env:
 *   GEMINI_API_KEY  - required for AI calls (features fall back gracefully without it)
 *   GEMINI_MODEL    - optional, defaults to "gemini-2.5-flash"
 */

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } }

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY)
}

function getModel() {
  return (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim()
}

async function callGemini(parts: GeminiPart[], options: { json?: boolean; temperature?: number } = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const response = await fetch(`${GEMINI_BASE_URL}/${getModel()}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.4,
        ...(options.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  })

  if (!response.ok) {
    const message = await response.text().catch(() => "")
    throw new Error(`Gemini request failed (${response.status}): ${message.slice(0, 300)}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p?.text || "")
    .join("")
  return typeof text === "string" && text.trim() ? text.trim() : null
}

/** Plain-text answer. Returns null when Gemini is not configured. */
export async function generateText(prompt: string) {
  return callGemini([{ text: prompt }])
}

/** JSON answer parsed into T. Returns null when Gemini is not configured or output is not valid JSON. */
export async function generateJson<T>(parts: GeminiPart[], temperature = 0.4): Promise<T | null> {
  const raw = await callGemini(parts, { json: true, temperature })
  if (!raw) return null
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    return null
  }
}
