"use client"

import { useState } from "react"
import {
  FileText,
  Plus,
  Archive,
  Edit,
  Trash2,
  Check,
  X,
  GripVertical,
  Star,
  Pause,
  Calendar,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ClipboardCheck
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"
import DynamicModulePage from "@/components/dynamic-module-page"

// Sample data for Management Reviews
const initialCategories = [
  {
    id: "1",
    title: "Quarterly Reviews",
    managementReviews: [
      { id: "1-1", title: "Q1 2024 Management Review", version: "v1.0", issueDate: "2024-04-15", reviewDate: "2024-04-10", highlighted: true, approved: true, paused: false },
      { id: "1-2", title: "Q2 2024 Management Review", version: "v1.0", issueDate: "2024-07-15", reviewDate: "2024-07-10", highlighted: false, approved: true, paused: false },
    ]
  },
  {
    id: "2",
    title: "Annual Reviews",
    managementReviews: [
      { id: "2-1", title: "2023 Annual Review", version: "v2.0", issueDate: "2024-01-20", reviewDate: "2024-01-15", highlighted: false, approved: true, paused: false },
      { id: "2-2", title: "2024 Annual Review", version: "v1.0", issueDate: "2025-01-20", reviewDate: "2025-01-15", highlighted: false, approved: false, paused: true },
    ]
  },
]

type SortType = "name" | "date"

function LegacyManagementReviewsPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [showArchived, setShowArchived] = useState(false)
  const [categoryItemView, setCategoryItemView] = useState<
    Record<string, "active" | "archived" | "completed" | "highlighted">
  >({})
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1"])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [addingReviewToCategory, setAddingReviewToCategory] = useState<string | null>(null)
  const [newReviewData, setNewReviewData] = useState({
    title: "",
    version: "",
    reviewDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0]
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  const toggleHighlight = (categoryId: string, reviewId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            managementReviews: cat.managementReviews.map(r =>
              r.id === reviewId ? { ...r, highlighted: !r.highlighted } : r
            )
          }
          : cat
      )
    )
  }

  const toggleApprove = (categoryId: string, reviewId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            managementReviews: cat.managementReviews.map(r =>
              r.id === reviewId ? { ...r, approved: !r.approved } : r
            )
          }
          : cat
      )
    )
  }

  const togglePause = (categoryId: string, reviewId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            managementReviews: cat.managementReviews.map(r =>
              r.id === reviewId ? { ...r, paused: !r.paused } : r
            )
          }
          : cat
      )
    )
  }

  const archiveReview = (categoryId: string, reviewId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            managementReviews: cat.managementReviews.map(r =>
              r.id === reviewId ? { ...r, archived: true, isArchived: true } : r
            )
          }
          : cat
      )
    )
  }

  const unarchiveReview = (categoryId: string, reviewId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            managementReviews: cat.managementReviews.map(r =>
              r.id === reviewId ? { ...r, archived: false, isArchived: false } : r
            )
          }
          : cat
      )
    )
  }

  const deleteReview = (categoryId: string, reviewId: string) => {
    if (confirm("Are you sure you want to delete this management review?")) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              managementReviews: cat.managementReviews.filter(r => r.id !== reviewId)
            }
            : cat
        )
      )
    }
  }

  const deleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    }
  }

  const startEditCategory = (categoryId: string, currentTitle: string) => {
    setEditingCategory(categoryId)
    setEditTitle(currentTitle)
  }

  const saveEditCategory = (categoryId: string) => {
    if (editTitle.trim()) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId ? { ...cat, title: editTitle.trim() } : cat
        )
      )
    }
    setEditingCategory(null)
    setEditTitle("")
  }

  const addCategory = () => {
    if (newCategoryTitle.trim()) {
      const newCategory = {
        id: Date.now().toString(),
        title: newCategoryTitle.trim(),
        managementReviews: []
      }
      setCategories(prev => [...prev, newCategory])
      setNewCategoryTitle("")
      setShowAddCategory(false)
    }
  }

  const addReviewToCategory = (categoryId: string) => {
    if (newReviewData.title.trim()) {
      const newReview = {
        id: `${categoryId}-${Date.now()}`,
        title: newReviewData.title.trim(),
        version: newReviewData.version.trim() || "v1.0",
        reviewDate: newReviewData.reviewDate,
        issueDate: newReviewData.issueDate,
        highlighted: false,
        approved: false,
        paused: false
      }

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, managementReviews: [...cat.managementReviews, newReview] }
            : cat
        )
      )

      setNewReviewData({
        title: "",
        version: "",
        reviewDate: new Date().toISOString().split('T')[0],
        issueDate: new Date().toISOString().split('T')[0]
      })
      setAddingReviewToCategory(null)
    }
  }

  const sortReviews = (reviews: any[]) => {
    const sorted = [...reviews]
    if (sortType === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      sorted.sort((a, b) => new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime())
    }
    return sortDirection === "asc" ? sorted : sorted.reverse()
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{
                backgroundColor: `${COLORS.primary}15`,
                color: COLORS.primary,
              }}
            >
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Management Reviews
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage your management review records
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Archive className="w-4 h-4" />
              {showArchived ? "Show Active" : "Show Archived"}
            </button>
            <Link href="/management-reviews/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Review
              </button>
            </Link>
          </div>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <div
            className="mb-6 p-5 rounded-xl shadow-sm"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
              Create New Category
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                placeholder="Enter category name..."
                className="flex-1 px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.textPrimary,
                }}
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
              />
              <button
                onClick={addCategory}
                className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryTitle("")
                }}
                className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                style={{
                  background: COLORS.bgGray,
                  color: COLORS.textPrimary,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 border-b-2" style={{ borderColor: COLORS.border }}>
            <button
              className="px-6 py-3 font-semibold border-b-2 transition-all"
              style={{
                borderColor: !showArchived ? COLORS.primary : "transparent",
                color: !showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(false)}
            >
              Active ({categories.reduce((acc, cat) => acc + cat.managementReviews.filter((r: any) => !r.archived && !r.isArchived).length, 0)})
            </button>
            <button
              className="px-6 py-3 font-semibold border-b-2 transition-all"
              style={{
                borderColor: showArchived ? COLORS.primary : "transparent",
                color: showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(true)}
            >
              Archived ({categories.reduce((acc, cat) => acc + cat.managementReviews.filter((r: any) => r.archived || r.isArchived).length, 0)})
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const currentItemView = categoryItemView[category.id] ?? (showArchived ? "archived" : "active")
            const categoryReviews = category.managementReviews || []
            const activeReviews = categoryReviews.filter((r: any) => !r.archived && !r.isArchived)
            const archivedReviews = categoryReviews.filter((r: any) => r.archived || r.isArchived)
            const completedReviews = activeReviews.filter((r: any) => r.approved)
            const highlightedReviews = activeReviews.filter((r: any) => r.highlighted)
            const currentReviews =
              currentItemView === "archived"
                ? archivedReviews
                : currentItemView === "completed"
                  ? completedReviews
                  : currentItemView === "highlighted"
                    ? highlightedReviews
                    : activeReviews
            const sortedReviews = sortReviews(currentReviews)
            const isViewingArchivedItems = currentItemView === "archived"
            const isExpanded = expandedCategories.includes(category.id)

            return (
              <div
                key={category.id}
                className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                style={{
                  background: COLORS.bgWhite,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {/* Category Header */}
                <div
                  className="p-5 flex items-center justify-between cursor-pointer"
                  style={{
                    background: COLORS.primary,
                    color: COLORS.textWhite,
                  }}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <h2 className="text-xl font-bold">{category.title}</h2>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
                      {currentReviews.length} reviews
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditCategory(category.id, category.title)
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isViewingArchivedItems) {
                          setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))
                        }
                        setAddingReviewToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      title="Add Review"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCategory(category.id)
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Edit Category Form */}
                {editingCategory === category.id && (
                  <div
                    className="p-5"
                    style={{
                      background: COLORS.bgGray,
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                      Edit Category Name
                    </h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Enter category name..."
                        className="flex-1 px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          borderColor: COLORS.border,
                          color: COLORS.textPrimary,
                          background: COLORS.bgWhite,
                        }}
                        onKeyPress={(e) => { if (e.key === "Enter") saveEditCategory(category.id) }}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditCategory(category.id)}
                        className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all flex items-center gap-2"
                        style={{
                          background: COLORS.primary,
                          color: COLORS.textWhite,
                        }}
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null)
                          setEditTitle("")
                        }}
                        className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all flex items-center gap-2"
                        style={{
                          background: COLORS.bgWhite,
                          color: COLORS.textPrimary,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {isExpanded && (
                  <div className="p-5">
                    {/* Add Review Form */}
                    <div className="mb-4 flex gap-2">
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "active" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "active" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "active" ? COLORS.primary : COLORS.border }}>Active ({activeReviews.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "archived" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "archived" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "archived" ? COLORS.primary : COLORS.border }}>Archived ({archivedReviews.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "completed" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "completed" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "completed" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "completed" ? COLORS.primary : COLORS.border }}>Completed ({completedReviews.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "highlighted" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "highlighted" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "highlighted" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "highlighted" ? COLORS.primary : COLORS.border }}>Highlighted ({highlightedReviews.length})</button>
                    </div>
                    {addingReviewToCategory === category.id && currentItemView === "active" && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add New Management Review
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Title *
                            </label>
                            <input
                              type="text"
                              value={newReviewData.title}
                              onChange={(e) => setNewReviewData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter review title..."
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Version
                            </label>
                            <input
                              type="text"
                              value={newReviewData.version}
                              onChange={(e) => setNewReviewData(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g., v1.0"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Review Date
                            </label>
                            <input
                              type="date"
                              value={newReviewData.reviewDate}
                              onChange={(e) => setNewReviewData(prev => ({ ...prev, reviewDate: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Issue Date
                            </label>
                            <input
                              type="date"
                              value={newReviewData.issueDate}
                              onChange={(e) => setNewReviewData(prev => ({ ...prev, issueDate: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => addReviewToCategory(category.id)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.primary, color: COLORS.textWhite }}
                          >
                            Add Review
                          </button>
                          <button
                            onClick={() => setAddingReviewToCategory(null)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {sortedReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>
                          {isViewingArchivedItems ? "No archived reviews in this category" : currentItemView === "completed" ? "No completed reviews in this category" : currentItemView === "highlighted" ? "No highlighted reviews in this category" : "No reviews in this category"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedReviews.map((review) => (
                          <div
                            key={review.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: review.paused ? `${COLORS.warning}05` : review.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-100 p-1 rounded">
                              <GripVertical className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1">
                              <Link
                                href={`/management-reviews/${review.id}`}
                                className="font-semibold hover:underline text-lg"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {review.title}
                              </Link>
                              <div className="flex gap-4 text-sm mt-1.5" style={{ color: COLORS.textSecondary }}>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Version:</span> {review.version}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Review: {review.reviewDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Issued: {review.issueDate}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => toggleHighlight(category.id, review.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: review.highlighted ? COLORS.warning : "#FEF3C7", color: review.highlighted ? COLORS.textWhite : "#92400E" }}><Star className="w-4 h-4" /></button>
                                <button onClick={() => toggleApprove(category.id, review.id)} title={review.approved ? "Mark as Incomplete" : "Mark as Completed"} className="p-2 rounded-lg hover:scale-105" style={{ background: review.approved ? COLORS.green500 : "#D1FAE5", color: review.approved ? COLORS.textWhite : "#065F46" }}><Check className="w-4 h-4" /></button>
                                <button onClick={() => togglePause(category.id, review.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: review.paused ? COLORS.warning : "#FEF3C7", color: review.paused ? COLORS.textWhite : "#92400E" }}><Pause className="w-4 h-4" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`/management-reviews/${review.id}/edit`}><button className="p-2 rounded-lg hover:scale-105" style={{ background: "#DBEAFE", color: "#1E40AF" }}><Edit className="w-4 h-4" /></button></Link>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E5E7EB", color: "#374151" }}><Copy className="w-4 h-4" /></button>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E0E7FF", color: "#4338CA" }}><Download className="w-4 h-4" /></button>
                                {!isViewingArchivedItems ? (
                                  <button onClick={() => archiveReview(category.id, review.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#FFEDD5", color: "#9A3412" }}><Archive className="w-4 h-4" /></button>
                                ) : (
                                  <button onClick={() => unarchiveReview(category.id, review.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#DCFCE7", color: "#166534" }}><Archive className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => deleteReview(category.id, review.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#FEE2E2", color: "#991B1B" }}><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ManagementReviewsPage() {
  return (
    <DynamicModulePage
      moduleSlug="management-reviews"
      title="Management Reviews"
      description="Manage management review records"
      itemLabel="Review"
      icon={ClipboardCheck}
      newItemHref="/management-reviews/new"
      itemHrefPrefix="/management-reviews"
    />
  )
}
