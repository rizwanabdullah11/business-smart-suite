"use client"

import { useState } from "react"
import {
  Scale,
  Plus,
  Archive,
  Edit,
  Trash2,
  Check,
  X,
  GripVertical,
  Star,
  Pause,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  AlertTriangle,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"
import DynamicModulePage from "@/components/dynamic-module-page"

// Sample data for Legal Register
const initialCategories = [
  {
    id: "1",
    title: "Health & Safety Legislation",
    items: [
      { id: "1-1", title: "Health and Safety at Work Act 1974", authority: "HSE", description: "Primary legislation covering occupational health and safety in Great Britain.", compliance: "Compliant", lastReview: "2023-12-01", nextReview: "2024-12-01", highlighted: true, approved: true, paused: false },
      { id: "1-2", title: "Management of Health and Safety at Work Regulations 1999", authority: "HSE", description: "Requires employers to assess risks to health and safety.", compliance: "Partial", lastReview: "2024-01-15", nextReview: "2024-07-15", highlighted: false, approved: true, paused: false },
    ]
  },
  {
    id: "2",
    title: "Environmental Regulations",
    items: [
      { id: "2-1", title: "Environmental Protection Act 1990", authority: "Environment Agency", description: "Fundamental structure and authority for waste management and control of emissions.", compliance: "Compliant", lastReview: "2023-11-20", nextReview: "2024-11-20", highlighted: false, approved: true, paused: false },
    ]
  },
  {
    id: "3",
    title: "Data Protection",
    items: [
      { id: "3-1", title: "Data Protection Act 2018 (GDPR)", authority: "ICO", description: "Controls how your personal information is used by organisations, businesses or the government.", compliance: "Compliant", lastReview: "2024-02-01", nextReview: "2025-02-01", highlighted: true, approved: true, paused: false },
    ]
  }
]

type SortType = "name" | "compliance"

function LegacyLegalRegisterPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [showArchived, setShowArchived] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1", "2"])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [addingItemToCategory, setAddingItemToCategory] = useState<string | null>(null)
  const [newItemData, setNewItemData] = useState({
    title: "",
    authority: "",
    description: "",
    compliance: "Compliant",
    lastReview: new Date().toISOString().split('T')[0],
    nextReview: ""
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  const toggleHighlight = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            items: cat.items.map(i =>
              i.id === itemId ? { ...i, highlighted: !i.highlighted } : i
            )
          }
          : cat
      )
    )
  }

  const toggleApprove = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            items: cat.items.map(i =>
              i.id === itemId ? { ...i, approved: !i.approved } : i
            )
          }
          : cat
      )
    )
  }

  const togglePause = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            items: cat.items.map(i =>
              i.id === itemId ? { ...i, paused: !i.paused } : i
            )
          }
          : cat
      )
    )
  }

  const deleteItem = (categoryId: string, itemId: string) => {
    if (confirm("Are you sure you want to delete this regulation?")) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              items: cat.items.filter(i => i.id !== itemId)
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
        items: []
      }
      setCategories(prev => [...prev, newCategory])
      setNewCategoryTitle("")
      setShowAddCategory(false)
    }
  }

  const addItemToCategory = (categoryId: string) => {
    if (newItemData.title.trim()) {
      const newItem = {
        id: `${categoryId}-${Date.now()}`,
        title: newItemData.title.trim(),
        authority: newItemData.authority.trim(),
        description: newItemData.description.trim(),
        compliance: newItemData.compliance,
        lastReview: newItemData.lastReview,
        nextReview: newItemData.nextReview || "Not Set",
        highlighted: false,
        approved: false,
        paused: false
      }

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, items: [...cat.items, newItem] }
            : cat
        )
      )

      setNewItemData({
        title: "",
        authority: "",
        description: "",
        compliance: "Compliant",
        lastReview: new Date().toISOString().split('T')[0],
        nextReview: ""
      })
      setAddingItemToCategory(null)
    }
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "Compliant": return COLORS.success
      case "Partial": return COLORS.warning
      case "Non-Compliant": return COLORS.danger
      case "Not Applicable": return COLORS.textSecondary
      default: return COLORS.primary
    }
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
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Legal Register
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Track compliance with legal and other requirements
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
            <Link href="/legal-register/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add Regulation
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
                placeholder="Enter category name (e.g. Employment Law)..."
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
              Active ({categories.reduce((acc, cat) => acc + cat.items.length, 0)})
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

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
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
                      {category.items.length} regulations
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
                        setAddingItemToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      title="Add Regulation"
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

                {/* Items List */}
                {isExpanded && (
                  <div className="p-5">
                    {/* Add Item Form */}
                    {addingItemToCategory === category.id && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add Regulation
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Act / Regulation Title *
                            </label>
                            <input
                              type="text"
                              value={newItemData.title}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g. Factories Act 1948"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Authority
                            </label>
                            <input
                              type="text"
                              value={newItemData.authority}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, authority: e.target.value }))}
                              placeholder="e.g. Government of India"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                            Description of Requirement
                          </label>
                          <input
                            type="text"
                            value={newItemData.description}
                            onChange={(e) => setNewItemData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief summary..."
                            className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderColor: COLORS.border }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Compliance Status
                            </label>
                            <select
                              value={newItemData.compliance}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, compliance: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            >
                              <option value="Compliant">Compliant</option>
                              <option value="Partial">Partial</option>
                              <option value="Non-Compliant">Non-Compliant</option>
                              <option value="Not Applicable">Not Applicable</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Last Review Date
                            </label>
                            <input
                              type="date"
                              value={newItemData.lastReview}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, lastReview: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Next Review Date
                            </label>
                            <input
                              type="date"
                              value={newItemData.nextReview}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, nextReview: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => addItemToCategory(category.id)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.primary, color: COLORS.textWhite }}
                          >
                            Add Details
                          </button>
                          <button
                            onClick={() => setAddingItemToCategory(null)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {category.items.length === 0 ? (
                      <div className="text-center py-12">
                        <Scale className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>No regulations in this category</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: item.paused ? `${COLORS.warning}05` : item.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-100 p-1 rounded">
                              <GripVertical className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                  <Link
                                    href={`/legal-register/${item.id}`}
                                    className="font-semibold hover:underline text-lg"
                                    style={{ color: COLORS.textPrimary }}
                                  >
                                    {item.title}
                                  </Link>
                                  <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>{item.authority}</span>
                                </div>

                                <div className="flex gap-2">
                                  <span className="px-2 py-1 rounded text-xs font-bold" style={{
                                    backgroundColor: `${getComplianceColor(item.compliance)}20`,
                                    color: getComplianceColor(item.compliance)
                                  }}>
                                    {item.compliance.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm mt-1 mb-2" style={{ color: COLORS.textSecondary }}>
                                {item.description}
                              </p>
                              <div className="flex gap-6 text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>Review: {item.lastReview}</span>
                                </div>
                                {item.nextReview && (
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Next: {item.nextReview}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-4">
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => toggleHighlight(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: item.highlighted ? COLORS.warning : "#FEF3C7", color: item.highlighted ? COLORS.textWhite : "#92400E" }}><Star className="w-4 h-4" /></button>
                                <button onClick={() => toggleApprove(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: item.approved ? COLORS.green500 : "#D1FAE5", color: item.approved ? COLORS.textWhite : "#065F46" }}><Check className="w-4 h-4" /></button>
                                <button onClick={() => togglePause(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: item.paused ? COLORS.warning : "#FEF3C7", color: item.paused ? COLORS.textWhite : "#92400E" }}><Pause className="w-4 h-4" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`/legal-register/${item.id}/edit`}><button className="p-2 rounded-lg hover:scale-105" style={{ background: "#DBEAFE", color: "#1E40AF" }}><Edit className="w-4 h-4" /></button></Link>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E5E7EB", color: "#374151" }}><Copy className="w-4 h-4" /></button>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E0E7FF", color: "#4338CA" }}><Download className="w-4 h-4" /></button>
                                <button onClick={() => deleteItem(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#FEE2E2", color: "#991B1B" }}><Trash2 className="w-4 h-4" /></button>
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

export default function LegalRegisterPage() {
  return (
    <DynamicModulePage
      moduleSlug="legal-register"
      title="Legal Register"
      description="Track legal and regulatory obligations"
      itemLabel="Regulation"
      icon={Scale}
      newItemHref="/legal-register/new"
      itemHrefPrefix="/legal-register"
      dateFieldKey="lastReview"
      formFields={[
        { key: "title", label: "Title", required: true, placeholder: "Regulation title..." },
        { key: "authority", label: "Authority", placeholder: "Authority..." },
        { key: "description", label: "Description", type: "textarea", placeholder: "Description..." },
        { key: "compliance", label: "Compliance", type: "select", options: ["Compliant", "Partial", "Non-Compliant"], defaultValue: "Compliant" },
        { key: "lastReview", label: "Last Review", type: "date" },
        { key: "nextReview", label: "Next Review", type: "date" },
      ]}
      listFieldKeys={["authority", "compliance", "lastReview", "nextReview"]}
    />
  )
}