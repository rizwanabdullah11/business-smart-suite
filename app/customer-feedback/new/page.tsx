"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { loadCustomerFeedbackCategories } from "@/lib/client/customer-feedback-categories"

export default function NewCustomerFeedbackPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [feedbackType, setFeedbackType] = useState("Compliment")
  const [channel, setChannel] = useState("Email")
  const [rating, setRating] = useState("5")
  const [status, setStatus] = useState("New")
  const [submittedDate, setSubmittedDate] = useState(new Date().toISOString().split("T")[0])
  const [feedback, setFeedback] = useState("")
  const [followUpAction, setFollowUpAction] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const normalized = await loadCustomerFeedbackCategories()
        setCategories(normalized)
        setCategory((prev) => prev || normalized[0]?.id || "")
      } catch (error) {
        console.error("Error loading customer feedback categories:", error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Feedback title is required")
      return
    }
    if (!category) {
      alert("Please select a feedback category")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/customer-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          customerName: customerName.trim(),
          companyName: companyName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          feedbackType,
          channel,
          rating,
          status,
          submittedDate,
          feedback: feedback.trim(),
          followUpAction: followUpAction.trim(),
          ...(category ? { category, categoryId: category } : {}),
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to create customer feedback")
      }

      router.push("/customer-feedback")
    } catch (error) {
      console.error("Error creating customer feedback:", error)
      alert("Failed to create customer feedback")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/customer-feedback"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back Customer Feedback
            </Link>
          </div>

          <div
            className="rounded-lg p-6 shadow-sm"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>
              Add Customer Feedback
            </h1>
            <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
              Add a real customer response with contact details, feedback type, rating, and planned follow-up.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border"
                  style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                >
                  {categoriesLoading ? (
                    <option value="">Loading categories...</option>
                  ) : (
                    <>
                      <option value="">Select feedback category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Feedback Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Feedback summary..."
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Feedback Type
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  >
                    {["Compliment", "Complaint", "Suggestion", "Support"].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name..."
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company or account name..."
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number..."
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  >
                    {["Email", "Phone", "Website", "In Person", "Social Media"].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  >
                    {["1", "2", "3", "4", "5"].map((value) => (
                      <option key={value} value={value}>
                        {value} Star{value === "1" ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  >
                    {["New", "In Review", "Resolved"].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Submitted Date
                  </label>
                  <input
                    type="date"
                    value={submittedDate}
                    onChange={(e) => setSubmittedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Customer Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What did the customer say?"
                  rows={5}
                  className="w-full px-3 py-2 rounded border"
                  style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                  Follow-up Action
                </label>
                <textarea
                  value={followUpAction}
                  onChange={(e) => setFollowUpAction(e.target.value)}
                  placeholder="Planned response or improvement..."
                  rows={4}
                  className="w-full px-3 py-2 rounded border"
                  style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving || categoriesLoading}
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{
                    background: COLORS.primary,
                    color: COLORS.textWhite,
                    opacity: saving || categoriesLoading ? 0.7 : 1,
                  }}
                >
                  {saving ? "Creating..." : "Create Feedback"}
                </button>
                <Link
                  href="/customer-feedback"
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{
                    background: COLORS.bgGray,
                    color: COLORS.textPrimary,
                  }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
