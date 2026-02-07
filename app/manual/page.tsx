"use client"

import { useState } from "react"
import { FileText, Plus, Archive, RefreshCw, Edit, Trash2, Check, X, GripVertical } from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"

// Sample data
const initialCategories = [
  {
    id: "1",
    title: "General Manuals",
    manuals: [
      { id: "1-1", title: "Quality Manual", version: "v2.1", issueDate: "2024-01-15", location: "QMS", highlighted: false, approved: true },
      { id: "1-2", title: "Safety Manual", version: "v3.0", issueDate: "2024-02-01", location: "HSE", highlighted: true, approved: true },
      { id: "1-3", title: "Operations Manual", version: "v4.2", issueDate: "2024-02-05", location: "OPS", highlighted: false, approved: false },
    ]
  },
  {
    id: "2",
    title: "Technical Documentation",
    manuals: [
      { id: "2-1", title: "Technical Specifications", version: "v1.5", issueDate: "2024-01-20", location: "TECH", highlighted: false, approved: true },
      { id: "2-2", title: "Product Manual", version: "v2.3", issueDate: "2024-01-25", location: "PROD", highlighted: false, approved: true },
    ]
  },
]

export default function ManualPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [showArchived, setShowArchived] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1"])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleHighlight = (categoryId: string, manualId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              manuals: cat.manuals.map(manual =>
                manual.id === manualId
                  ? { ...manual, highlighted: !manual.highlighted }
                  : manual
              )
            }
          : cat
      )
    )
  }

  const toggleApprove = (categoryId: string, manualId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              manuals: cat.manuals.map(manual =>
                manual.id === manualId
                  ? { ...manual, approved: !manual.approved }
                  : manual
              )
            }
          : cat
      )
    )
  }

  const deleteManual = (categoryId: string, manualId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              manuals: cat.manuals.filter(manual => manual.id !== manualId)
            }
          : cat
      )
    )
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
        manuals: []
      }
      setCategories(prev => [...prev, newCategory])
      setNewCategoryTitle("")
      setShowAddCategory(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <FileText className="h-6 w-6 mr-2" style={{ color: COLORS.textPrimary }} />
          <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
            Manuals
          </h1>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              Add Category
            </button>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: COLORS.bgWhite,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              {showArchived ? "Show Active" : "Show Archived"}
            </button>
            <Link href="/manual/new">
              <button
                className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </Link>
          </div>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <div
            className="mb-4 p-4 rounded-lg"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                placeholder="Category name..."
                className="flex-1 px-3 py-2 rounded border"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.textPrimary,
                }}
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
              />
              <button
                onClick={addCategory}
                className="px-4 py-2 rounded font-medium"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryTitle("")
                }}
                className="px-4 py-2 rounded font-medium"
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
        <div className="mb-4">
          <div className="flex gap-2 border-b" style={{ borderColor: COLORS.border }}>
            <button
              className="px-4 py-2 font-medium border-b-2 transition-all"
              style={{
                borderColor: !showArchived ? COLORS.primary : "transparent",
                color: !showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(false)}
            >
              Active
            </button>
            <button
              className="px-4 py-2 font-medium border-b-2 transition-all"
              style={{
                borderColor: showArchived ? COLORS.primary : "transparent",
                color: showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(true)}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg overflow-hidden"
              style={{
                background: COLORS.bgWhite,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              {/* Category Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                style={{
                  background: "#1F2937",
                  color: COLORS.textWhite,
                }}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-2">
                  {editingCategory === category.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 rounded text-black"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          saveEditCategory(category.id)
                        }
                      }}
                    />
                  ) : (
                    <h2 className="text-lg font-semibold">{category.title}</h2>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Sort by Name</span>
                  {editingCategory === category.id ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          saveEditCategory(category.id)
                        }}
                        className="p-1 rounded hover:bg-gray-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCategory(null)
                        }}
                        className="p-1 rounded hover:bg-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditCategory(category.id, category.title)
                        }}
                        className="p-1 rounded hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="px-3 py-1 rounded text-sm"
                        style={{ background: "#374151" }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Manuals List */}
              {expandedCategories.includes(category.id) && (
                <div className="p-4">
                  {category.manuals.length === 0 ? (
                    <p className="text-center py-8" style={{ color: COLORS.textSecondary }}>
                      No manuals in this category
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {category.manuals.map((manual) => (
                        <div
                          key={manual.id}
                          className="flex items-center gap-3 p-3 rounded border"
                          style={{
                            borderColor: COLORS.border,
                            background: manual.highlighted ? `${COLORS.primary}10` : COLORS.bgWhite,
                          }}
                        >
                          <button className="cursor-move">
                            <GripVertical className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                          </button>
                          <div className="flex-1">
                            <Link
                              href={`/manual/${manual.id}`}
                              className="font-medium hover:underline"
                              style={{ color: COLORS.textPrimary }}
                            >
                              {manual.title}
                            </Link>
                            <div className="flex gap-4 text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                              <span>Version: {manual.version}</span>
                              <span>Issue Date: {manual.issueDate}</span>
                              <span>Location: {manual.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleHighlight(category.id, manual.id)}
                              className="p-2 rounded transition-all"
                              style={{
                                background: manual.highlighted ? COLORS.primary : COLORS.bgGray,
                                color: manual.highlighted ? COLORS.textWhite : COLORS.textSecondary,
                              }}
                              title="Highlight"
                            >
                              ★
                            </button>
                            <button
                              onClick={() => toggleApprove(category.id, manual.id)}
                              className="p-2 rounded transition-all"
                              style={{
                                background: manual.approved ? COLORS.green500 : COLORS.bgGray,
                                color: manual.approved ? COLORS.textWhite : COLORS.textSecondary,
                              }}
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteManual(category.id, manual.id)}
                              className="p-2 rounded transition-all hover:bg-red-100"
                              style={{ color: COLORS.danger }}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showArchived && (
          <div className="mt-8 text-center" style={{ color: COLORS.textSecondary }}>
            <p>No archived items</p>
          </div>
        )}
      </div>
    </div>
  )
}
