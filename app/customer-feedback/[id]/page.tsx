"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Mail,
  MessageSquare,
  Phone,
  Star,
  User,
} from "lucide-react"
import { COLORS } from "@/constant/colors"

type FeedbackItem = {
  _id?: string
  id?: string
  title?: string
  customerName?: string
  companyName?: string
  email?: string
  phone?: string
  feedbackType?: string
  channel?: string
  rating?: string | number
  status?: string
  submittedDate?: string
  feedback?: string
  followUpAction?: string
  category?: string | { _id?: string; name?: string }
  categoryId?: string
  createdAt?: string
}

function renderStars(value?: string | number) {
  const numeric = Math.max(1, Math.min(5, Number(value || 0) || 0))
  return Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={`w-5 h-5 ${index < numeric ? "fill-current" : ""}`}
      style={{ color: index < numeric ? "#F59E0B" : "#D1D5DB" }}
    />
  ))
}

function statusStyle(status?: string) {
  if (status === "Resolved") return { bg: COLORS.green100, color: COLORS.green600 }
  if (status === "In Review") return { bg: COLORS.orange100, color: COLORS.orange700 }
  return { bg: COLORS.blue100, color: COLORS.blue700 }
}

function typeStyle(type?: string) {
  if (type === "Complaint") return { bg: COLORS.pink100, color: COLORS.pink700 }
  if (type === "Suggestion") return { bg: COLORS.indigo100, color: COLORS.indigo700 }
  if (type === "Support") return { bg: COLORS.orange100, color: COLORS.orange700 }
  return { bg: COLORS.green100, color: COLORS.green600 }
}

export default function CustomerFeedbackDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id || "")
  const [item, setItem] = useState<FeedbackItem | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const itemResponse = await fetch(`/api/customer-feedback/${id}`, { headers })
        if (!itemResponse.ok) throw new Error("Failed to load feedback")
        const nextItem = await itemResponse.json()
        setItem(nextItem)

        const categoryId =
          nextItem?.category?._id ||
          nextItem?.categoryId ||
          (typeof nextItem?.category === "string" ? nextItem.category : "")

        if (categoryId) {
          const categoryResponse = await fetch("/api/categories?type=customer-feedback", { headers })
          if (categoryResponse.ok) {
            const categories = await categoryResponse.json()
            const matched = (Array.isArray(categories) ? categories : []).find(
              (category: any) => String(category._id || category.id) === String(categoryId),
            )
            setCategoryName(String(matched?.name || ""))
          }
        }
      } catch (error) {
        console.error("Error loading customer feedback detail:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) loadData()
  }, [id])

  const status = useMemo(() => statusStyle(item?.status), [item?.status])
  const type = useMemo(() => typeStyle(item?.feedbackType), [item?.feedbackType])

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/customer-feedback"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back Customer Feedback
            </Link>

            {id ? (
              <Link
                href={`/customer-feedback/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                style={{ background: COLORS.primary, color: COLORS.textWhite }}
              >
                <Edit className="w-4 h-4" />
                Edit Feedback
              </Link>
            ) : null}
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{
              background: COLORS.bgWhite,
              borderColor: COLORS.border,
            }}
          >
            {loading ? (
              <p style={{ color: COLORS.textSecondary }}>Loading feedback detail...</p>
            ) : !item ? (
              <p style={{ color: COLORS.textSecondary }}>Feedback record not found.</p>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-2xl"
                      style={{
                        backgroundColor: `${COLORS.primary}15`,
                        color: COLORS.primary,
                      }}
                    >
                      <MessageSquare className="w-7 h-7" />
                    </div>

                    <div>
                      <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                        {item.title || "Customer Feedback"}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {item.status || "New"}
                        </span>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: type.bg, color: type.color }}
                        >
                          {item.feedbackType || "Feedback"}
                        </span>
                        {item.channel ? (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{ background: COLORS.gray100, color: COLORS.gray700 }}
                          >
                            {item.channel}
                          </span>
                        ) : null}
                        {categoryName ? (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{ background: COLORS.indigo100, color: COLORS.indigo700 }}
                          >
                            {categoryName}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">{renderStars(item.rating)}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: COLORS.bgGrayLight, borderColor: COLORS.border }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.textSecondary }}>
                      <User className="w-4 h-4" />
                      Customer
                    </div>
                    <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                      {item.customerName || "No customer name"}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: COLORS.bgGrayLight, borderColor: COLORS.border }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.textSecondary }}>
                      <Building2 className="w-4 h-4" />
                      Company
                    </div>
                    <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                      {item.companyName || "No company"}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: COLORS.bgGrayLight, borderColor: COLORS.border }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.textSecondary }}>
                      <Calendar className="w-4 h-4" />
                      Submitted Date
                    </div>
                    <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                      {item.submittedDate || item.createdAt || "No date"}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: COLORS.bgGrayLight, borderColor: COLORS.border }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.textSecondary }}>
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <p className="font-semibold break-all" style={{ color: COLORS.textPrimary }}>
                      {item.email || "No email"}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: COLORS.bgGrayLight, borderColor: COLORS.border }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.textSecondary }}>
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                    <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                      {item.phone || "No phone"}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: COLORS.bgGrayLight, borderColor: COLORS.border }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.textSecondary }}>
                      <Star className="w-4 h-4" />
                      Rating
                    </div>
                    <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
                      {item.rating || "No rating"} / 5
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-8">
                  <div
                    className="rounded-2xl p-5 border"
                    style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
                  >
                    <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.textPrimary }}>
                      Customer Feedback
                    </h2>
                    <p className="leading-7 whitespace-pre-wrap" style={{ color: COLORS.textSecondary }}>
                      {item.feedback || "No feedback text provided."}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl p-5 border"
                    style={{ background: COLORS.bgWhite, borderColor: COLORS.border }}
                  >
                    <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.textPrimary }}>
                      Follow-up Action
                    </h2>
                    <p className="leading-7 whitespace-pre-wrap" style={{ color: COLORS.textSecondary }}>
                      {item.followUpAction || "No follow-up action recorded yet."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
