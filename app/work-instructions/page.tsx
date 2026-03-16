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
  ClipboardList
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"
import DynamicModulePage from "@/components/dynamic-module-page"

// Sample data for Work Instructions
const initialCategories = [
  {
    id: "1",
    title: "Manufacturing",
    instructions: [
      { id: "1-1", title: "Assembly Line Setup", version: "v2.0", issueDate: "2024-01-20", area: "Production Line 1", highlighted: true, approved: true, paused: false },
      { id: "1-2", title: "Packaging Procedures", version: "v1.5", issueDate: "2024-02-25", area: "Packing Area", highlighted: false, approved: true, paused: false },
    ]
  },
  {
    id: "2",
    title: "Quality Control",
    instructions: [
      { id: "2-1", title: "Incoming Inspection", version: "v3.0", issueDate: "2024-03-15", area: "Receiving", highlighted: false, approved: true, paused: false },
      { id: "2-2", title: "Final Product Testing", version: "v1.1", issueDate: "2024-04-10", area: "Testing Lab", highlighted: false, approved: false, paused: true },
    ]
  },
]

type SortType = "name" | "date"

function LegacyWorkInstructionsPage() {
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
  const [addingInstructionToCategory, setAddingInstructionToCategory] = useState<string | null>(null)
  const [newInstructionData, setNewInstructionData] = useState({
    title: "",
    version: "",
    area: "",
    content: "",
    issueDate: new Date().toISOString().split('T')[0]
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  const toggleHighlight = (categoryId: string, instructionId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            instructions: cat.instructions.map(i =>
              i.id === instructionId ? { ...i, highlighted: !i.highlighted } : i
            )
          }
          : cat
      )
    )
  }

  const toggleApprove = (categoryId: string, instructionId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            instructions: cat.instructions.map(i =>
              i.id === instructionId ? { ...i, approved: !i.approved } : i
            )
          }
          : cat
      )
    )
  }

  const togglePause = (categoryId: string, instructionId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            instructions: cat.instructions.map(i =>
              i.id === instructionId ? { ...i, paused: !i.paused } : i
            )
          }
          : cat
      )
    )
  }

  const archiveInstruction = (categoryId: string, instructionId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            instructions: cat.instructions.map(i =>
              i.id === instructionId ? { ...i, archived: true, isArchived: true } : i
            )
          }
          : cat
      )
    )
  }

  const unarchiveInstruction = (categoryId: string, instructionId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            instructions: cat.instructions.map(i =>
              i.id === instructionId ? { ...i, archived: false, isArchived: false } : i
            )
          }
          : cat
      )
    )
  }

  const deleteInstruction = (categoryId: string, instructionId: string) => {
    if (confirm("Are you sure you want to delete this work instruction?")) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              instructions: cat.instructions.filter(i => i.id !== instructionId)
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
        instructions: []
      }
      setCategories(prev => [...prev, newCategory])
      setNewCategoryTitle("")
      setShowAddCategory(false)
    }
  }

  const addInstructionToCategory = (categoryId: string) => {
    if (newInstructionData.title.trim()) {
      const newInstruction = {
        id: `${categoryId}-${Date.now()}`,
        title: newInstructionData.title.trim(),
        version: newInstructionData.version.trim() || "v1.0",
        area: newInstructionData.area.trim() || "N/A",
        content: newInstructionData.content.trim() || "",
        issueDate: newInstructionData.issueDate,
        highlighted: false,
        approved: false,
        paused: false
      }

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, instructions: [...cat.instructions, newInstruction] }
            : cat
        )
      )

      setNewInstructionData({
        title: "",
        version: "",
        area: "",
        content: "",
        issueDate: new Date().toISOString().split('T')[0]
      })
      setAddingInstructionToCategory(null)
    }
  }

  const sortInstructions = (instructions: any[]) => {
    const sorted = [...instructions]
    if (sortType === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      sorted.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime())
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
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Work Instructions
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage standard operating procedures and work instructions
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
            <Link href="/work-instructions/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Instruction
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
              Active ({categories.reduce((acc, cat) => acc + cat.instructions.filter((i: any) => !i.archived && !i.isArchived).length, 0)})
            </button>
            <button
              className="px-6 py-3 font-semibold border-b-2 transition-all"
              style={{
                borderColor: showArchived ? COLORS.primary : "transparent",
                color: showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(true)}
            >
              Archived ({categories.reduce((acc, cat) => acc + cat.instructions.filter((i: any) => i.archived || i.isArchived).length, 0)})
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const currentItemView = categoryItemView[category.id] ?? (showArchived ? "archived" : "active")
            const categoryInstructions = category.instructions || []
            const activeInstructions = categoryInstructions.filter((i: any) => !i.archived && !i.isArchived)
            const archivedInstructions = categoryInstructions.filter((i: any) => i.archived || i.isArchived)
            const completedInstructions = activeInstructions.filter((i: any) => i.approved)
            const highlightedInstructions = activeInstructions.filter((i: any) => i.highlighted)
            const currentInstructions =
              currentItemView === "archived"
                ? archivedInstructions
                : currentItemView === "completed"
                  ? completedInstructions
                  : currentItemView === "highlighted"
                    ? highlightedInstructions
                    : activeInstructions
            const sortedInstructions = sortInstructions(currentInstructions)
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
                      {currentInstructions.length} instructions
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
                        setAddingInstructionToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      title="Add Instruction"
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

                {/* Instructions List */}
                {isExpanded && (
                  <div className="p-5">
                    <div className="mb-4 flex gap-2">
                      <button
                        onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))}
                        className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                        style={{
                          background: currentItemView === "active" ? COLORS.primaryGradient : COLORS.bgWhite,
                          color: currentItemView === "active" ? COLORS.textWhite : COLORS.textPrimary,
                          borderColor: currentItemView === "active" ? COLORS.primary : COLORS.border,
                        }}
                      >
                        Active ({activeInstructions.length})
                      </button>
                      <button
                        onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))}
                        className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                        style={{
                          background: currentItemView === "archived" ? COLORS.primaryGradient : COLORS.bgWhite,
                          color: currentItemView === "archived" ? COLORS.textWhite : COLORS.textPrimary,
                          borderColor: currentItemView === "archived" ? COLORS.primary : COLORS.border,
                        }}
                      >
                        Archived ({archivedInstructions.length})
                      </button>
                      <button
                        onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "completed" }))}
                        className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                        style={{
                          background: currentItemView === "completed" ? COLORS.primaryGradient : COLORS.bgWhite,
                          color: currentItemView === "completed" ? COLORS.textWhite : COLORS.textPrimary,
                          borderColor: currentItemView === "completed" ? COLORS.primary : COLORS.border,
                        }}
                      >
                        Completed ({completedInstructions.length})
                      </button>
                      <button
                        onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "highlighted" }))}
                        className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                        style={{
                          background: currentItemView === "highlighted" ? COLORS.primaryGradient : COLORS.bgWhite,
                          color: currentItemView === "highlighted" ? COLORS.textWhite : COLORS.textPrimary,
                          borderColor: currentItemView === "highlighted" ? COLORS.primary : COLORS.border,
                        }}
                      >
                        Highlighted ({highlightedInstructions.length})
                      </button>
                    </div>
                    {/* Add Instruction Form */}
                    {addingInstructionToCategory === category.id && currentItemView === "active" && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add New Work Instruction
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Title *
                            </label>
                            <input
                              type="text"
                              value={newInstructionData.title}
                              onChange={(e) => setNewInstructionData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter instruction title..."
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
                              value={newInstructionData.version}
                              onChange={(e) => setNewInstructionData(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g., v1.0"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Area/Process
                            </label>
                            <input
                              type="text"
                              value={newInstructionData.area}
                              onChange={(e) => setNewInstructionData(prev => ({ ...prev, area: e.target.value }))}
                              placeholder="e.g., Manufacturing"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                            Content / Steps
                          </label>
                          <textarea
                            value={newInstructionData.content}
                            onChange={(e) => setNewInstructionData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Enter work instruction details..."
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderColor: COLORS.border }}
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => addInstructionToCategory(category.id)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.primary, color: COLORS.textWhite }}
                          >
                            Add Instruction
                          </button>
                          <button
                            onClick={() => setAddingInstructionToCategory(null)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {sortedInstructions.length === 0 ? (
                      <div className="text-center py-12">
                        <ClipboardList className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>
                          {isViewingArchivedItems
                            ? "No archived instructions in this category"
                            : currentItemView === "completed"
                              ? "No completed instructions in this category"
                              : currentItemView === "highlighted"
                                ? "No highlighted instructions in this category"
                                : "No instructions in this category"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedInstructions.map((instruction) => (
                          <div
                            key={instruction.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: instruction.paused ? `${COLORS.warning}05` : instruction.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-100 p-1 rounded">
                              <GripVertical className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1">
                              <Link
                                href={`/work-instructions/${instruction.id}`}
                                className="font-semibold hover:underline text-lg"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {instruction.title}
                              </Link>
                              <div className="flex gap-4 text-sm mt-1.5" style={{ color: COLORS.textSecondary }}>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Version:</span> {instruction.version}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Issued: {instruction.issueDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Area:</span> {instruction.area}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => toggleHighlight(category.id, instruction.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: instruction.highlighted ? COLORS.warning : "#FEF3C7", color: instruction.highlighted ? COLORS.textWhite : "#92400E" }}><Star className="w-4 h-4" /></button>
                                <button onClick={() => toggleApprove(category.id, instruction.id)} title={instruction.approved ? "Mark as Incomplete" : "Mark as Completed"} className="p-2 rounded-lg hover:scale-105" style={{ background: instruction.approved ? COLORS.green500 : "#D1FAE5", color: instruction.approved ? COLORS.textWhite : "#065F46" }}><Check className="w-4 h-4" /></button>
                                <button onClick={() => togglePause(category.id, instruction.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: instruction.paused ? COLORS.warning : "#FEF3C7", color: instruction.paused ? COLORS.textWhite : "#92400E" }}><Pause className="w-4 h-4" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`/work-instructions/${instruction.id}/edit`}><button className="p-2 rounded-lg hover:scale-105" style={{ background: "#DBEAFE", color: "#1E40AF" }}><Edit className="w-4 h-4" /></button></Link>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E5E7EB", color: "#374151" }}><Copy className="w-4 h-4" /></button>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E0E7FF", color: "#4338CA" }}><Download className="w-4 h-4" /></button>
                                {!isViewingArchivedItems ? (
                                  <button onClick={() => archiveInstruction(category.id, instruction.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#FFEDD5", color: "#9A3412" }}><Archive className="w-4 h-4" /></button>
                                ) : (
                                  <button onClick={() => unarchiveInstruction(category.id, instruction.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#DCFCE7", color: "#166534" }}><Archive className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => deleteInstruction(category.id, instruction.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#FEE2E2", color: "#991B1B" }}><Trash2 className="w-4 h-4" /></button>
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

export default function WorkInstructionsPage() {
  return (
    <DynamicModulePage
      moduleSlug="work-instructions"
      title="Work Instructions"
      description="Manage standard operating procedures and work instructions"
      itemLabel="Instruction"
      icon={ClipboardList}
      newItemHref="/work-instructions/new"
      itemHrefPrefix="/work-instructions"
    />
  )
}
