"use client"

import { useState } from "react"
import {
  GraduationCap,
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
  Users,
  Calendar,
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"
import DynamicModulePage from "@/components/dynamic-module-page"

// Sample data for Training
const initialCategories = [
  {
    id: "1",
    title: "Mandatory Safety Training",
    items: [
      { id: "1-1", title: "Fire Safety Awareness", employee: "John Doe", department: "Production", date: "2023-09-15", expiry: "2024-09-15", status: "Valid", certificate: true, highlighted: false, approved: true, paused: false },
      { id: "1-2", title: "Manual Handling", employee: "Jane Smith", department: "Logistics", date: "2023-01-10", expiry: "2024-01-10", status: "Expired", certificate: true, highlighted: true, approved: true, paused: false },
      { id: "1-3", title: "First Aid at Work", employee: "Mike Ross", department: "Admin", date: "2023-11-01", expiry: "2026-11-01", status: "Valid", certificate: true, highlighted: false, approved: true, paused: false },
    ]
  },
  {
    id: "2",
    title: "Technical Skills",
    items: [
      { id: "2-1", title: "Forklift Driving License", employee: "Bob Builder", department: "Logistics", date: "2023-05-20", expiry: "2025-05-20", status: "Valid", certificate: true, highlighted: false, approved: true, paused: false },
    ]
  },
  {
    id: "3",
    title: "Soft Skills",
    items: []
  }
]

type SortType = "name" | "status"

function LegacyTrainingPage() {
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
    employee: "",
    department: "",
    date: new Date().toISOString().split('T')[0],
    expiry: "",
    status: "Valid"
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
    if (confirm("Are you sure you want to delete this record?")) {
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
        employee: newItemData.employee.trim(),
        department: newItemData.department.trim(),
        date: newItemData.date,
        expiry: newItemData.expiry || "N/A",
        status: newItemData.status,
        certificate: false,
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
        employee: "",
        department: "",
        date: new Date().toISOString().split('T')[0],
        expiry: "",
        status: "Valid"
      })
      setAddingItemToCategory(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Valid": return COLORS.success
      case "Expiring Soon": return COLORS.orange500
      case "Expired": return COLORS.orange700
      default: return COLORS.textSecondary
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
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Training Matrix
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage employee training records, competencies, and certificates
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
            <Link href="/training/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add Record
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
                placeholder="Enter training category name (e.g. Leadership)..."
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
                      {category.items.length} records
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
                    {addingItemToCategory === category.id && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add Training Record
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Training Course Name
                            </label>
                            <input
                              type="text"
                              value={newItemData.title}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g. Working at Heights"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Employee Name
                            </label>
                            <input
                              type="text"
                              value={newItemData.employee}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, employee: e.target.value }))}
                              placeholder="e.g. Sarah Connor"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Department
                            </label>
                            <input
                              type="text"
                              value={newItemData.department}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, department: e.target.value }))}
                              placeholder="e.g. Operations"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Date Completed
                            </label>
                            <input
                              type="date"
                              value={newItemData.date}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, date: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Expiry Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={newItemData.expiry}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, expiry: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Status
                            </label>
                            <select
                              value={newItemData.status}
                              onChange={(e) => setNewItemData(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            >
                              <option value="Valid">Valid</option>
                              <option value="Expiring Soon">Expiring Soon</option>
                              <option value="Expired">Expired</option>
                              <option value="Planned">Planned</option>
                            </select>
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
                        <GraduationCap className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>No training records found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: item.paused ? `${COLORS.orange500}05` : item.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-100 p-1 rounded">
                              <GripVertical className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <Link
                                  href={`/training/${item.id}`}
                                  className="font-semibold hover:underline text-lg"
                                  style={{ color: COLORS.textPrimary }}
                                >
                                  {item.title}
                                </Link>
                                <div className="flex gap-2">
                                  <span className="px-2 py-1 rounded text-xs font-bold" style={{
                                    backgroundColor: `${getStatusColor(item.status)}20`,
                                    color: getStatusColor(item.status)
                                  }}>
                                    {item.status.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-6 text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{item.employee} ({item.department})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Completed: {item.date}</span>
                                </div>
                                {item.expiry && item.expiry !== "N/A" && (
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Expires: {item.expiry}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-4">
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => toggleHighlight(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: item.highlighted ? COLORS.warning : "#FEF3C7", color: item.highlighted ? COLORS.textWhite : "#92400E" }}><Star className="w-4 h-4" /></button>
                                <button onClick={() => toggleApprove(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: item.approved ? COLORS.green500 : "#D1FAE5", color: item.approved ? COLORS.textWhite : "#065F46" }}><Check className="w-4 h-4" /></button>
                                <button onClick={() => togglePause(category.id, item.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: item.paused ? COLORS.orange500 : "#FEF3C7", color: item.paused ? COLORS.textWhite : "#92400E" }}><Pause className="w-4 h-4" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`/training/${item.id}/edit`}><button className="p-2 rounded-lg hover:scale-105" style={{ background: "#DBEAFE", color: "#1E40AF" }}><Edit className="w-4 h-4" /></button></Link>
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

export default function TrainingPage() {
  return (
    <DynamicModulePage
      moduleSlug="training"
      title="Training"
      description="Track employee training records and validity"
      itemLabel="Record"
      icon={GraduationCap}
      newItemHref="/training/new"
      itemHrefPrefix="/training"
      dateFieldKey="date"
      formFields={[
        { key: "title", label: "Training", required: true, placeholder: "Training title..." },
        { key: "employee", label: "Employee", placeholder: "Employee name..." },
        { key: "department", label: "Department", placeholder: "Department..." },
        { key: "date", label: "Training Date", type: "date" },
        { key: "expiry", label: "Expiry Date", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Valid", "Expired", "Pending"], defaultValue: "Valid" },
        { key: "certificate", label: "Certificate Issued", type: "checkbox", defaultValue: true },
      ]}
      listFieldKeys={["employee", "department", "date", "expiry", "status"]}
    />
  )
}