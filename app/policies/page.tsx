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
  ArrowUpDown,
  Calendar,
  Type,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Copy,
  Download,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"

// Sample data
const initialCategories = [
  {
    id: "1",
    title: "General Policies",
    policies: [
      { id: "1-1", title: "Quality Policy", version: "v2.1", issueDate: "2024-01-15", location: "QMS", highlighted: false, approved: true, paused: false },
      { id: "1-2", title: "Safety Policy", version: "v3.0", issueDate: "2024-02-01", location: "HSE", highlighted: true, approved: true, paused: false },
      { id: "1-3", title: "Environmental Policy", version: "v4.2", issueDate: "2024-02-05", location: "ENV", highlighted: false, approved: false, paused: false },
    ]
  },
  {
    id: "2",
    title: "HR Policies",
    policies: [
      { id: "2-1", title: "Employee Handbook", version: "v1.5", issueDate: "2024-01-20", location: "HR", highlighted: false, approved: true, paused: false },
      { id: "2-2", title: "Code of Conduct", version: "v2.3", issueDate: "2024-01-25", location: "HR", highlighted: false, approved: true, paused: true },
    ]
  },
]

type SortType = "name" | "date"

export default function PoliciesPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [showArchived, setShowArchived] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1"])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [addingPolicyToCategory, setAddingPolicyToCategory] = useState<string | null>(null)
  const [newPolicyData, setNewPolicyData] = useState({
    title: "",
    version: "",
    location: "",
    issueDate: new Date().toISOString().split('T')[0]
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleHighlight = (categoryId: string, policyId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            policies: cat.policies.map(policy =>
              policy.id === policyId
                ? { ...policy, highlighted: !policy.highlighted }
                : policy
            )
          }
          : cat
      )
    )
  }

  const toggleApprove = (categoryId: string, policyId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            policies: cat.policies.map(policy =>
              policy.id === policyId
                ? { ...policy, approved: !policy.approved }
                : policy
            )
          }
          : cat
      )
    )
  }

  const togglePause = (categoryId: string, policyId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            policies: cat.policies.map(policy =>
              policy.id === policyId
                ? { ...policy, paused: !policy.paused }
                : policy
            )
          }
          : cat
      )
    )
  }

  const deletePolicy = (categoryId: string, policyId: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              policies: cat.policies.filter(policy => policy.id !== policyId)
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
        policies: []
      }
      setCategories(prev => [...prev, newCategory])
      setNewCategoryTitle("")
      setShowAddCategory(false)
    }
  }

  const addPolicyToCategory = (categoryId: string) => {
    if (newPolicyData.title.trim()) {
      const newPolicy = {
        id: `${categoryId}-${Date.now()}`,
        title: newPolicyData.title.trim(),
        version: newPolicyData.version.trim() || "v1.0",
        location: newPolicyData.location.trim() || "N/A",
        issueDate: newPolicyData.issueDate,
        highlighted: false,
        approved: false,
        paused: false
      }

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, policies: [...cat.policies, newPolicy] }
            : cat
        )
      )

      setNewPolicyData({
        title: "",
        version: "",
        location: "",
        issueDate: new Date().toISOString().split('T')[0]
      })
      setAddingPolicyToCategory(null)
    }
  }

  const sortPolicies = (policies: any[]) => {
    const sorted = [...policies]
    if (sortType === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      sorted.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime())
    }
    return sortDirection === "asc" ? sorted : sorted.reverse()
  }

  const toggleSort = (type: SortType) => {
    if (sortType === type) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortType(type)
      setSortDirection("asc")
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:shadow-md"
                style={{
                  backgroundColor: COLORS.bgWhite,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{
                backgroundColor: `${COLORS.primary}15`,
                color: COLORS.primary,
              }}
            >
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Policies
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage your organizational policies
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
            <Link href="/policies/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Policy
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
                className="px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all"
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
                className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all "
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
              Active ({categories.reduce((acc, cat) => acc + cat.policies.length, 0)})
            </button>
            <button
              className="px-6 py-3 font-semibold border-b-2 transition-all"
              style={{
                borderColor: showArchived ? COLORS.primary : "transparent",
                color: showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(true)}
            >
              Archived (0)
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
            Sort by:
          </span>
          <button
            onClick={() => toggleSort("name")}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2"
            style={{
              background: sortType === "name" ? COLORS.primary : COLORS.bgWhite,
              color: sortType === "name" ? COLORS.textWhite : COLORS.textPrimary,
              border: `1px solid ${sortType === "name" ? COLORS.primary : COLORS.border}`,
            }}
          >
            <Type className="w-4 h-4" />
            Name
            {sortType === "name" && (
              <ArrowUpDown className={`w-3 h-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
            )}
          </button>
          <button
            onClick={() => toggleSort("date")}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2"
            style={{
              background: sortType === "date" ? COLORS.primary : COLORS.bgWhite,
              color: sortType === "date" ? COLORS.textWhite : COLORS.textPrimary,
              border: `1px solid ${sortType === "date" ? COLORS.primary : COLORS.border}`,
            }}
          >
            <Calendar className="w-4 h-4" />
            Date
            {sortType === "date" && (
              <ArrowUpDown className={`w-3 h-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
            )}
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const sortedPolicies = sortPolicies(category.policies)
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
                    background: COLORS.primaryGradient,
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
                      {category.policies.length} policies
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditCategory(category.id, category.title)
                      }}
                      className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                      title="Edit Category"
                      style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setAddingPolicyToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                      title="Add Policy"
                      style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                      title="Archive Category"
                      style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}
                    >
                      <Archive className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCategory(category.id)
                      }}
                      className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                      title="Delete Category"
                      style={{ background: COLORS.bgWhite, color: COLORS.pink600 }}
                    >
                      <Trash2 className="w-5 h-5" />
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
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            saveEditCategory(category.id)
                          }
                        }}
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

                {/* Policies List */}
                {isExpanded && (
                  <div className="p-5">
                    {/* Add Policy Form */}
                    {addingPolicyToCategory === category.id && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add New Policy
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Title *
                            </label>
                            <input
                              type="text"
                              value={newPolicyData.title}
                              onChange={(e) => setNewPolicyData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter policy title..."
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                borderColor: COLORS.border,
                                color: COLORS.textPrimary,
                                background: COLORS.bgWhite,
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Version
                            </label>
                            <input
                              type="text"
                              value={newPolicyData.version}
                              onChange={(e) => setNewPolicyData(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g., v1.0"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                borderColor: COLORS.border,
                                color: COLORS.textPrimary,
                                background: COLORS.bgWhite,
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Location
                            </label>
                            <input
                              type="text"
                              value={newPolicyData.location}
                              onChange={(e) => setNewPolicyData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="e.g., QMS"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                borderColor: COLORS.border,
                                color: COLORS.textPrimary,
                                background: COLORS.bgWhite,
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Issue Date
                            </label>
                            <input
                              type="date"
                              value={newPolicyData.issueDate}
                              onChange={(e) => setNewPolicyData(prev => ({ ...prev, issueDate: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{
                                borderColor: COLORS.border,
                                color: COLORS.textPrimary,
                                background: COLORS.bgWhite,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => addPolicyToCategory(category.id)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{
                              background: COLORS.primary,
                              color: COLORS.textWhite,
                            }}
                          >
                            Add Policy
                          </button>
                          <button
                            onClick={() => {
                              setAddingPolicyToCategory(null)
                              setNewPolicyData({
                                title: "",
                                version: "",
                                location: "",
                                issueDate: new Date().toISOString().split('T')[0]
                              })
                            }}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{
                              background: COLORS.bgWhite,
                              color: COLORS.textPrimary,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {sortedPolicies.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>
                          No policies in this category
                        </p>
                        <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>
                          Click the + button above to add your first policy
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedPolicies.map((policy) => (
                          <div
                            key={policy.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: policy.paused ? `${COLORS.warning}05` : policy.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-100 p-1 rounded">
                              <GripVertical className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1">
                              <Link
                                href={`/policies/${policy.id}`}
                                className="font-semibold hover:underline text-lg"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {policy.title}
                              </Link>
                              <div className="flex gap-4 text-sm mt-1.5" style={{ color: COLORS.textSecondary }}>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Version:</span> {policy.version}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {policy.issueDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Location:</span> {policy.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Primary Actions */}
                              <div className="flex items-center gap-1 mr-2">
                                <button
                                  onClick={() => toggleHighlight(category.id, policy.id)}
                                  className="p-2 rounded-lg transition-all hover:scale-105"
                                  style={{
                                    background: policy.highlighted ? COLORS.warning : "#FEF3C7",
                                    color: policy.highlighted ? COLORS.textWhite : "#92400E",
                                  }}
                                  title={policy.highlighted ? "Remove Highlight" : "Highlight"}
                                >
                                  <Star className={`w-5 h-5 ${policy.highlighted ? "fill-current" : ""}`} />
                                </button>
                                <button
                                  onClick={() => toggleApprove(category.id, policy.id)}
                                  className="p-2 rounded-lg transition-all hover:scale-105"
                                  style={{
                                    background: policy.approved ? COLORS.green500 : "#D1FAE5",
                                    color: policy.approved ? COLORS.textWhite : "#065F46",
                                  }}
                                  title={policy.approved ? "Unapprove" : "Approve"}
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => togglePause(category.id, policy.id)}
                                  className="p-2 rounded-lg transition-all hover:scale-105"
                                  style={{
                                    background: policy.paused ? COLORS.warning : "#FEF3C7",
                                    color: policy.paused ? COLORS.textWhite : "#92400E",
                                  }}
                                  title={policy.paused ? "Resume" : "Pause"}
                                >
                                  <Pause className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Divider */}
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>

                              {/* Secondary Actions */}
                              <div className="flex items-center gap-1">
                                <Link href={`/policies/${policy.id}/edit`}>
                                  <button
                                    className="p-2 rounded-lg transition-all hover:scale-105"
                                    style={{
                                      background: "#DBEAFE",
                                      color: "#1E40AF",
                                    }}
                                    title="Edit"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                </Link>
                                <button
                                  className="p-2 rounded-lg transition-all hover:scale-105"
                                  style={{
                                    background: "#E5E7EB",
                                    color: "#374151",
                                  }}
                                  title="Duplicate"
                                >
                                  <Copy className="w-5 h-5" />
                                </button>
                                <button
                                  className="p-2 rounded-lg transition-all hover:scale-105"
                                  style={{
                                    background: "#E0E7FF",
                                    color: "#4338CA",
                                  }}
                                  title="Download"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => deletePolicy(category.id, policy.id)}
                                  className="p-2 rounded-lg transition-all hover:scale-105"
                                  style={{
                                    background: "#FEE2E2",
                                    color: "#991B1B",
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
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

        {showArchived && (
          <div className="mt-12 text-center py-16">
            <Archive className="w-16 h-16 mx-auto mb-4" style={{ color: COLORS.textLight }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.textPrimary }}>
              No archived items
            </h3>
            <p style={{ color: COLORS.textSecondary }}>
              Archived manuals and categories will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
