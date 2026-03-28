"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { loadCustomerFeedbackCategories } from "@/lib/client/customer-feedback-categories"

export default function EditCustomerFeedbackPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = String(params?.id || "")

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const [categoryResponse, itemResponse] = await Promise.all([
          loadCustomerFeedbackCategories(),
          fetch(`/api/customer-feedback/${id}`, { headers }),
        ])

        if (!itemResponse.ok) throw new Error("Failed to load customer feedback")
        const item = await itemResponse.json()
        const normalized = await categoryResponse

        setCategories(normalized)
        setTitle(String(item?.title || ""))
        setCustomerName(String(item?.customerName || ""))
        setCompanyName(String(item?.companyName || ""))
        setEmail(String(item?.email || ""))
        setPhone(String(item?.phone || ""))
        setFeedbackType(String(item?.feedbackType || "Compliment"))
        setChannel(String(item?.channel || "Email"))
        setRating(String(item?.rating || "5"))
        setStatus(String(item?.status || "New"))
        setSubmittedDate(String(item?.submittedDate || item?.createdAt || new Date().toISOString().split("T")[0]).slice(0, 10))
        setFeedback(String(item?.feedback || ""))
        setFollowUpAction(String(item?.followUpAction || ""))
        const categoryValue =
          item?.category?._id ||
          item?.categoryId ||
          (typeof item?.category === "string" ? item.category : "")
        setCategory(String(categoryValue || ""))
      } catch (error) {
        console.error("Error loading customer feedback:", error)
        alert("Failed to load customer feedback")
      } finally {
        setCategoriesLoading(false)
        setLoading(false)
      }
    }

    if (id) loadData()
  }, [id])

  const handleSave = async () => {
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
      const response = await fetch(`/api/customer-feedback/${id}`, {
        method: "PUT",
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

      if (!response.ok) throw new Error("Failed to update customer feedback")
      router.push(`/customer-feedback/${id}`)
    } catch (error) {
      console.error("Error updating customer feedback:", error)
      alert("Failed to update customer feedback")
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
              href={`/customer-feedback/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Feedback Detail
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
              Edit Customer Feedback
            </h1>

            {loading ? (
              <p style={{ color: COLORS.textSecondary }}>Loading feedback...</p>
            ) : (
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
                    rows={4}
                    className="w-full px-3 py-2 rounded border"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg font-medium"
                    style={{
                      background: COLORS.primary,
                      color: COLORS.textWhite,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <Link
                    href={`/customer-feedback/${id}`}
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
