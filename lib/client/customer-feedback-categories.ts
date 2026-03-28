"use client"

export type CustomerFeedbackCategory = {
  id: string
  name: string
}

export const SUGGESTED_CUSTOMER_FEEDBACK_CATEGORIES = [
  "Product Quality",
  "Service Experience",
  "Support & Response",
  "Delivery & Timelines",
  "Billing & Pricing",
  "Website & Portal",
  "General Feedback",
] as const

function normalizeCategories(data: unknown): CustomerFeedbackCategory[] {
  return (Array.isArray(data) ? data : [])
    .filter((cat: any) => !cat?.archived && !cat?.isArchived)
    .map((cat: any) => ({ id: String(cat._id || cat.id), name: String(cat.name || "") }))
    .filter((cat: CustomerFeedbackCategory) => cat.id && cat.name)
}

export async function loadCustomerFeedbackCategories(): Promise<CustomerFeedbackCategory[]> {
  const token = localStorage.getItem("token")
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const fetchCategories = async () => {
    const response = await fetch("/api/categories?type=customer-feedback", { headers: authHeaders })
    if (!response.ok) throw new Error("Failed to load categories")
    return normalizeCategories(await response.json())
  }

  let categories = await fetchCategories()
  const existingNames = new Set(categories.map((category) => category.name.trim().toLowerCase()))
  const missingSuggestions = SUGGESTED_CUSTOMER_FEEDBACK_CATEGORIES.filter(
    (name) => !existingNames.has(name.trim().toLowerCase()),
  )

  if (missingSuggestions.length > 0) {
    await Promise.all(
      missingSuggestions.map(async (name) => {
        try {
          await fetch("/api/categories", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({ name, type: "customer-feedback" }),
          })
        } catch {
          // Ignore permission or network failures and return what already exists.
        }
      }),
    )

    categories = await fetchCategories().catch(() => categories)
  }

  return categories
}
