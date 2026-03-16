"use client"

import { useState } from "react"
import {
  Globe,
  Plus,
  Archive,
  Edit,
  Trash2,
  Check,
  X,
  GripVertical,
  Star,
  Pause,
  AlertOctagon,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Leaf
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"
import DynamicModulePage from "@/components/dynamic-module-page"

// Sample data for IMS Aspects & Impacts
const initialCategories = [
  {
    id: "1",
    title: "Corporate Offices",
    items: [
      { id: "1-1", title: "Electricity Consumption", aspect: "Use of electricity for lighting and HVAC", impact: "Depletion of natural resources", riskLevel: "Low", highlighted: false, approved: true, paused: false },
      { id: "1-2", title: "Paper Waste Generation", aspect: "Printing and disposal of paper", impact: "Landfill waste increase", riskLevel: "Medium", highlighted: true, approved: true, paused: false },
    ]
  },
  {
    id: "2",
    title: "Production / Manufacturing",
    items: [
      { id: "2-1", title: "Chemical Handling", aspect: "Storage and use of solvents", impact: "Potential soil or water contamination", riskLevel: "High", highlighted: true, approved: true, paused: false },
      { id: "2-2", title: "Noise Emissions", aspect: "Operation of heavy machinery", impact: "Noise pollution affecting workers/neighbors", riskLevel: "Medium", highlighted: false, approved: false, paused: true },
    ]
  },
]

type SortType = "name" | "risk"

function LegacyIMSAspectsImpactsPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [showArchived, setShowArchived] = useState(false)
  const [categoryItemView, setCategoryItemView] = useState<
    Record<string, "active" | "archived" | "completed" | "highlighted">
  >({})
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
    aspect: "",
    impact: "",
    riskLevel: "Low"
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

  const archiveItem = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            items: cat.items.map(i =>
              i.id === itemId ? { ...i, archived: true, isArchived: true } : i
            )
          }
          : cat
      )
    )
  }

  const unarchiveItem = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            items: cat.items.map(i =>
              i.id === itemId ? { ...i, archived: false, isArchived: false } : i
            )
          }
          : cat
      )
    )
  }

  const deleteItem = (categoryId: string, itemId: string) => {
    if (confirm("Are you sure you want to delete this aspect/impact record?")) {
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
        aspect: newItemData.aspect.trim() || "N/A",
        impact: newItemData.impact.trim() || "N/A",
        riskLevel: newItemData.riskLevel,
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
        aspect: "",
        impact: "",
        riskLevel: "Low"
      })
      setAddingItemToCategory(null)
    }
  }

  const sortItems = (items: any[]) => {
    const sorted = [...items]
    if (sortType === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      // Simple risk sort: High > Medium > Low
      const riskOrder = { "High": 3, "Medium": 2, "Low": 1 }
      sorted.sort((a, b) => (riskOrder[b.riskLevel as keyof typeof riskOrder] || 0) - (riskOrder[a.riskLevel as keyof typeof riskOrder] || 0))
    }
    return sortDirection === "asc" ? sorted : sorted.reverse()
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return COLORS.danger
      case "Medium": return COLORS.warning
      case "Low": return COLORS.success
      default: return COLORS.textSecondary
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
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                IMS Aspects & Impacts
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage environmental aspects, impacts, and associated risks
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
            <Link href="/ims-aspects-impacts/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Record
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
              Active ({categories.reduce((acc, cat) => acc + cat.items.filter((i: any) => !i.archived && !i.isArchived).length, 0)})
            </button>
            <button
              className="px-6 py-3 font-semibold border-b-2 transition-all"
              style={{
                borderColor: showArchived ? COLORS.primary : "transparent",
                color: showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(true)}
            >
              Archived ({categories.reduce((acc, cat) => acc + cat.items.filter((i: any) => i.archived || i.isArchived).length, 0)})
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const currentItemView = categoryItemView[category.id] ?? (showArchived ? "archived" : "active")
            const categoryItems = category.items || []
            const activeItems = categoryItems.filter((i: any) => !i.archived && !i.isArchived)
            const archivedItems = categoryItems.filter((i: any) => i.archived || i.isArchived)
            const completedItems = activeItems.filter((i: any) => i.approved)
            const highlightedItems = activeItems.filter((i: any) => i.highlighted)
            const currentItems =
              currentItemView === "archived"
                ? archivedItems
                : currentItemView === "completed"
                  ? completedItems
                  : currentItemView === "highlighted"
                    ? highlightedItems
                    : activeItems
            const sortedItems = sortItems(currentItems)
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
                      {currentItems.length} records
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
                        setAddingItemToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      title="Add Record"
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
                    <div className="mb-4 flex gap-2">
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "active" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "active" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "active" ? COLORS.primary : COLORS.border }}>Active ({activeItems.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "archived" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "archived" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "archived" ? COLORS.primary : COLORS.border }}>Archived ({archivedItems.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "completed" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "completed" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "completed" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "completed" ? COLORS.primary : COLORS.border }}>Completed ({completedItems.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "highlighted" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "highlighted" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "highlighted" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "highlighted" ? COLORS.primary : COLORS.border }}>Highlighted ({highlightedItems.length})</button>
                    </div>
                    {addingItemToCategory === category.id && currentItemView === "active" && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add New Aspect & Impact
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Activity/Product/Service *
                            </label>
                            <input
                              type="text"
                              value={newItemData.title}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g. Chemical Handling"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Risk Level
                            </label>
                            <select
                              value={newItemData.riskLevel}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, riskLevel: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Aspect
                            </label>
                            <textarea
                              value={newItemData.aspect}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, aspect: e.target.value }))}
                              placeholder="Describe the environmental aspect..."
                              rows={2}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Impact
                            </label>
                            <textarea
                              value={newItemData.impact}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, impact: e.target.value }))}
                              placeholder="Describe the environmental impact..."
                              rows={2}
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
                            Add Record
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

                    {sortedItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Globe className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>
                          {isViewingArchivedItems ? "No archived records in this category" : currentItemView === "completed" ? "No completed records in this category" : currentItemView === "highlighted" ? "No highlighted records in this category" : "No records in this category"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedItems.map((item) => (
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
                                <Link
                                  href={`/ims-aspects-impacts/${item.id}`}
                                  className="font-semibold hover:underline text-lg"
                                  style={{ color: COLORS.textPrimary }}
                                >
                                  {item.title}
                                </Link>
                                <span className="px-2 py-1 rounded text-xs font-bold" style={{
                                  backgroundColor: `${getRiskColor(item.riskLevel)}20`,
                                  color: getRiskColor(item.riskLevel)
                                }}>
                                  {item.riskLevel.toUpperCase()} RISK
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm mt-2" style={{ color: COLORS.textSecondary }}>
                                <div>
                                  <span className="font-medium block text-gray-700">Aspect:</span> {item.aspect}
                                </div>
                                <div>
                                  <span className="font-medium block text-gray-700">Impact:</span> {item.impact}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-4">
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => toggleHighlight(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: item.highlighted ? COLORS.warning : "#FEF3C7", color: item.highlighted ? COLORS.textWhite : "#92400E" }}><Star className="w-4 h-4" /></button>
                                <button onClick={() => toggleApprove(category.id, item.id)} title={item.approved ? "Mark as Incomplete" : "Mark as Completed"} className="p-2 rounded-lg hover:scale-105" style={{ background: item.approved ? COLORS.green500 : "#D1FAE5", color: item.approved ? COLORS.textWhite : "#065F46" }}><Check className="w-4 h-4" /></button>
                                <button onClick={() => togglePause(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: item.paused ? COLORS.warning : "#FEF3C7", color: item.paused ? COLORS.textWhite : "#92400E" }}><Pause className="w-4 h-4" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`/ims-aspects-impacts/${item.id}/edit`}><button className="p-2 rounded-lg hover:scale-105" style={{ background: "#DBEAFE", color: "#1E40AF" }}><Edit className="w-4 h-4" /></button></Link>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E5E7EB", color: "#374151" }}><Copy className="w-4 h-4" /></button>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E0E7FF", color: "#4338CA" }}><Download className="w-4 h-4" /></button>
                                {!isViewingArchivedItems ? (
                                  <button onClick={() => archiveItem(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#FFEDD5", color: "#9A3412" }}><Archive className="w-4 h-4" /></button>
                                ) : (
                                  <button onClick={() => unarchiveItem(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#DCFCE7", color: "#166534" }}><Archive className="w-4 h-4" /></button>
                                )}
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

export default function IMSAspectsImpactsPage() {
  return (
    <DynamicModulePage
      moduleSlug="ims-aspects-impacts"
      title="IMS Aspects & Impacts"
      description="Manage aspects and impacts records"
      itemLabel="Record"
      icon={Leaf}
      newItemHref="/ims-aspects-impacts/new"
      itemHrefPrefix="/ims-aspects-impacts"
    />
  )
}
