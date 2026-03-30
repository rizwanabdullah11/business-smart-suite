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

  const inputCls = "w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-purple-300"
  const inputStyle = { background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }
  const labelCls = "mb-2 block text-sm font-semibold"

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#f7f8fb 0%,#f3f5f9 100%)" }}>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">

        {/* Header */}
        <div className="mb-6 flex items-start gap-3">
          <Link
            href="/customer-feedback"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: COLORS.purple50, color: COLORS.purple700, border: `1px solid ${COLORS.purple200}` }}
              >
                <span className="text-base font-bold">C</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
                Add Customer Feedback
              </h1>
            </div>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Add a real customer response with contact details, feedback type, rating, and planned follow-up.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
          <div className="space-y-5">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Category */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} style={inputStyle}>
                  {categoriesLoading ? (
                    <option value="">Loading categories…</option>
                  ) : (
                    <>
                      <option value="">Select feedback category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Feedback Title */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Feedback Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Feedback summary…" className={inputCls} style={inputStyle} />
              </div>

              {/* Feedback Type */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Feedback Type</label>
                <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} className={inputCls} style={inputStyle}>
                  {["Compliment", "Complaint", "Suggestion", "Support"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Customer Name</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name…" className={inputCls} style={inputStyle} />
              </div>

              {/* Company Name */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company or account name…" className={inputCls} style={inputStyle} />
              </div>

              {/* Email */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" className={inputCls} style={inputStyle} />
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number…" className={inputCls} style={inputStyle} />
              </div>

              {/* Channel */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Channel</label>
                <select value={channel} onChange={(e) => setChannel(e.target.value)} className={inputCls} style={inputStyle}>
                  {["Email", "Phone", "Website", "In Person", "Social Media"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Rating</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} className={inputCls} style={inputStyle}>
                  {["1","2","3","4","5"].map((v) => <option key={v} value={v}>{v} Star{v === "1" ? "" : "s"}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} style={inputStyle}>
                  {["New", "In Review", "Resolved"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Submitted Date */}
              <div>
                <label className={labelCls} style={{ color: COLORS.textPrimary }}>Submitted Date</label>
                <input type="date" value={submittedDate} onChange={(e) => setSubmittedDate(e.target.value)} className={inputCls} style={inputStyle} />
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className={labelCls} style={{ color: COLORS.textPrimary }}>Customer Feedback</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What did the customer say?" rows={5} className={inputCls} style={inputStyle} />
            </div>

            {/* Follow-up */}
            <div>
              <label className={labelCls} style={{ color: COLORS.textPrimary }}>Follow-up Action</label>
              <textarea value={followUpAction} onChange={(e) => setFollowUpAction(e.target.value)} placeholder="Planned response or improvement…" rows={4} className={inputCls} style={inputStyle} />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || categoriesLoading}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "#111827", color: COLORS.textWhite }}
              >
                {saving ? "Creating…" : "Create Feedback"}
              </button>
              <Link
                href="/customer-feedback"
                className="inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
