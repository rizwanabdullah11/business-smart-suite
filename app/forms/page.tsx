"use client"

import { useState, useEffect } from "react"
import {
  FileBox,
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
  ScrollText,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"

type SortType = "name" | "date"

export default function FormsPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [archivedCategories, setArchivedCategories] = useState<any[]>([])
  const [categoryItemView, setCategoryItemView] = useState<
    Record<string, "active" | "archived" | "completed" | "highlighted">
  >({})
  const [showArchived, setShowArchived] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1"])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [addingFormToCategory, setAddingFormToCategory] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [newFormData, setNewFormData] = useState({
    title: "",
    version: "",
    location: "",
    issueDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  const toIdString = (value: any) => {
    if (!value) return null
    if (typeof value === "string") return value
    if (typeof value === "object" && "_id" in value) return String((value as any)._id)
    return String(value)
  }

  const getItemCategoryId = (item: any) => {
    const raw = item?.category?._id || item?.categoryId || item?.category || null
    return toIdString(raw)
  }

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token")

      // 1) Get categories
      const catRes = await fetch("/api/categories?type=form", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const categoriesData = await catRes.json()

      // 2) Get active forms
      const formsRes = await fetch("/api/forms", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const formsData = await formsRes.json()

      // 3) Get archived forms
      const archivedRes = await fetch("/api/forms/archived/all", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const archivedData = archivedRes.ok ? await archivedRes.json() : []

      const archivedById = new Map<string, any>()
      archivedData.forEach((item: any) => {
        if (item?._id) archivedById.set(String(item._id), item)
      })
      formsData
        .filter((item: any) => item?.archived || item?.isArchived)
        .forEach((item: any) => {
          if (item?._id) archivedById.set(String(item._id), item)
        })
      const archivedForms = Array.from(archivedById.values())

      const allCategories = categoriesData.map((cat: any) => {
        const categoryId = toIdString(cat._id)
        const activeForms = formsData
          .filter((f: any) => getItemCategoryId(f) === categoryId && !f.archived && !f.isArchived)
          .map((f: any) => ({
            id: f._id,
            title: f.title,
            version: f.version,
            issueDate: f.issueDate,
            location: f.location,
            highlighted: f.highlighted || false,
            approved: f.approved || false,
            paused: f.paused || false,
          }))

        const categoryArchivedForms = archivedForms
          .filter((f: any) => getItemCategoryId(f) === categoryId)
          .map((f: any) => ({
            id: f._id,
            title: f.title,
            version: f.version,
            issueDate: f.issueDate,
            location: f.location,
            highlighted: f.highlighted || false,
            approved: f.approved || false,
            paused: f.paused || false,
          }))

        return {
          id: categoryId,
          title: cat.name,
          isArchived: Boolean(cat.isArchived),
          archived: Boolean(cat.archived),
          forms: activeForms,
          archivedForms: categoryArchivedForms,
          completedForms: activeForms.filter((f: any) => Boolean(f.approved)),
          highlightedForms: activeForms.filter((f: any) => Boolean(f.highlighted)),
        }
      })

      const merged = allCategories.filter((cat: any) => !cat.isArchived && !cat.archived)
      const mergedArchived = allCategories.filter(
        (cat: any) => cat.archivedForms.length > 0 || cat.isArchived || cat.archived
      )

      setCategories(merged)
      setArchivedCategories(mergedArchived)
      setCategoryItemView((prev) => {
        const next = { ...prev }
        allCategories.forEach((cat: any) => {
          if (!next[cat.id]) next[cat.id] = "active"
        })
        return next
      })
    } catch (err) {
      console.log(err)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  const archiveCategory = async (categoryId: string) => {
    if (!confirm("Archive this category?")) return

    try {
      setLoadingAction(`archive-category-${categoryId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/categories/${categoryId}/archive?type=form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Failed to archive category")

      await loadData()
    } catch (err) {
      console.error("Error archiving category:", err)
      alert("Failed to archive category")
    } finally {
      setLoadingAction(null)
    }
  }

  const unarchiveCategory = async (categoryId: string) => {
    if (!confirm("Unarchive this category?")) return

    try {
      setLoadingAction(`unarchive-category-${categoryId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/categories/${categoryId}/unarchive?type=form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Failed to unarchive category")

      await loadData()
    } catch (err) {
      console.error("Error unarchiving category:", err)
      alert("Failed to unarchive category")
    } finally {
      setLoadingAction(null)
    }
  }

  const toggleHighlight = async (categoryId: string, formId: string) => {
    try {
      setLoadingAction(`highlight-${formId}`)
      const token = localStorage.getItem("token")
      const form = categories
        .find(c => c.id === categoryId)
        ?.forms.find((f: any) => f.id === formId)

      if (!form) return

      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ highlighted: !form.highlighted })
      })

      if (!response.ok) throw new Error("Failed to update highlight")

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              forms: cat.forms.map((f: any) =>
                f.id === formId
                  ? { ...f, highlighted: !f.highlighted }
                  : f
              )
            }
            : cat
        )
      )
    } catch (err) {
      console.error("Error toggling highlight:", err)
      alert("Failed to update highlight status")
    } finally {
      setLoadingAction(null)
    }
  }

  const toggleApprove = async (categoryId: string, formId: string) => {
    try {
      setLoadingAction(`approve-${formId}`)
      const token = localStorage.getItem("token")
      const form = categories
        .find(c => c.id === categoryId)
        ?.forms.find((f: any) => f.id === formId)

      if (!form) return

      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved: !form.approved })
      })

      if (!response.ok) throw new Error("Failed to update approval")

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              forms: cat.forms.map((f: any) =>
                f.id === formId
                  ? { ...f, approved: !f.approved }
                  : f
              )
            }
            : cat
        )
      )
    } catch (err) {
      console.error("Error toggling approve:", err)
      alert("Failed to update approval status")
    } finally {
      setLoadingAction(null)
    }
  }

  const togglePause = async (categoryId: string, formId: string) => {
    try {
      setLoadingAction(`pause-${formId}`)
      const token = localStorage.getItem("token")
      const form = categories
        .find(c => c.id === categoryId)
        ?.forms.find((f: any) => f.id === formId)

      if (!form) return

      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paused: !form.paused })
      })

      if (!response.ok) throw new Error("Failed to update pause status")

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              forms: cat.forms.map((f: any) =>
                f.id === formId
                  ? { ...f, paused: !f.paused }
                  : f
              )
            }
            : cat
        )
      )
    } catch (err) {
      console.error("Error toggling pause:", err)
      alert("Failed to update pause status")
    } finally {
      setLoadingAction(null)
    }
  }

  const archiveForm = async (formId: string) => {
    try {
      setLoadingAction(`archive-${formId}`)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ archived: true, isArchived: true })
      })
      if (!response.ok) throw new Error("Failed to archive form")
      await loadData()
    } catch (err) {
      console.error("Error archiving form:", err)
      alert("Failed to archive form")
    } finally {
      setLoadingAction(null)
    }
  }

  const unarchiveForm = async (formId: string) => {
    try {
      setLoadingAction(`unarchive-${formId}`)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ archived: false, isArchived: false })
      })
      if (!response.ok) throw new Error("Failed to unarchive form")
      await loadData()
    } catch (err) {
      console.error("Error unarchiving form:", err)
      alert("Failed to unarchive form")
    } finally {
      setLoadingAction(null)
    }
  }

  const deleteForm = async (categoryId: any, formId: any) => {
    if (!confirm("Are you sure you want to delete this form?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete form")
      }

      await loadData()
    } catch (err) {
      console.error("Error deleting form:", err)
      alert("Failed to delete form")
    }
  }

  const deleteCategory = async (categoryId: any) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/categories/${categoryId}?type=form`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete category")
      }

      await loadData()
    } catch (err) {
      console.error("Error deleting category:", err)
      alert("Failed to delete category")
    }
  }

  const startEditCategory = (categoryId: string, currentTitle: string) => {
    setEditingCategory(categoryId)
    setEditTitle(currentTitle)
  }

  const saveEditCategory = async (categoryId: string) => {
    if (!editTitle.trim()) return

    try {
      const token = localStorage.getItem("token")

      await fetch(`/api/categories/${categoryId}?type=form`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editTitle.trim() })
      })

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId ? { ...cat, title: editTitle.trim() } : cat
        )
      )
    } catch (err) {
      console.error("Error updating category:", err)
    }

    setEditingCategory(null)
    setEditTitle("")
  }

  const addCategory = async () => {
    if (!newCategoryTitle.trim()) {
      alert("Please enter a category name")
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryTitle, type: "form" })
      })

      if (!response.ok) {
        throw new Error("Failed to add category")
      }

      setNewCategoryTitle("")
      setShowAddCategory(false)
      await loadData()
    } catch (err) {
      console.error("Error adding category:", err)
      alert("Failed to add category")
    }
  }

  const addFormToCategory = async (categoryId: any) => {
    if (!newFormData.title.trim()) {
      alert("Please enter a form title")
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newFormData.title,
          version: newFormData.version || "v1.0",
          location: newFormData.location || "N/A",
          issueDate: newFormData.issueDate,
          category: categoryId
        })
      })

      if (!response.ok) {
        throw new Error("Failed to add form")
      }

      setAddingFormToCategory(null)
      setNewFormData({
        title: "",
        version: "",
        location: "",
        issueDate: new Date().toISOString().split('T')[0]
      })
      await loadData()
    } catch (err) {
      console.error("Error adding form:", err)
      alert("Failed to add form")
    }
  }

  const sortForms = (forms: any[]) => {
    const sorted = [...forms]
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
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Forms
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage your organizational forms and templates
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
            <Link href="/forms/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Form
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
              Active ({categories.length})
            </button>
            <button
              className="px-6 py-3 font-semibold border-b-2 transition-all"
              style={{
                borderColor: showArchived ? COLORS.primary : "transparent",
                color: showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(true)}
            >
              Archived ({archivedCategories.length})
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {(showArchived ? archivedCategories : categories).map((category) => {
            const currentItemView = categoryItemView[category.id] ?? (showArchived ? "archived" : "active")
            const currentForms =
              currentItemView === "archived"
                ? (category.archivedForms || [])
                : currentItemView === "completed"
                  ? (category.completedForms || [])
                  : currentItemView === "highlighted"
                    ? (category.highlightedForms || [])
                    : (category.forms || [])
            const sortedForms = sortForms(currentForms)
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
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                    <span className="px-3 py-1 rounded-full text-base font-medium bg-white bg-opacity-20">
                      {currentForms.length} forms
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
                        if (isViewingArchivedItems) {
                          setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))
                        }
                        setAddingFormToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                      title="Add Form"
                      style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    {showArchived ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          unarchiveCategory(category.id)
                        }}
                        className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                        title="Unarchive Category"
                        style={{ background: COLORS.bgWhite, color: COLORS.green600 }}
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          archiveCategory(category.id)
                        }}
                        className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                        title="Archive Category"
                        style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                    )}
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

                {/* Forms List */}
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
                        Active ({(category.forms || []).length})
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
                        Archived ({(category.archivedForms || []).length})
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
                        Completed ({(category.completedForms || []).length})
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
                        Highlighted ({(category.highlightedForms || []).length})
                      </button>
                    </div>
                    {/* Add Form Form */}
                    {addingFormToCategory === category.id && currentItemView === "active" && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add New Form
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Title *
                            </label>
                            <input
                              type="text"
                              value={newFormData.title}
                              onChange={(e) => setNewFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter form title..."
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                              style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Version
                            </label>
                            <input
                              type="text"
                              value={newFormData.version}
                              onChange={(e) => setNewFormData(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g., v1.0"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                              style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Location
                            </label>
                            <input
                              type="text"
                              value={newFormData.location}
                              onChange={(e) => setNewFormData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="e.g., HR"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                              style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => addFormToCategory(category.id)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.primary, color: COLORS.textWhite }}
                          >
                            Add Form
                          </button>
                          <button
                            onClick={() => setAddingFormToCategory(null)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {sortedForms.length === 0 ? (
                      <div className="text-center py-12">
                        <FileBox className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>
                          {isViewingArchivedItems
                            ? "No archived forms in this category"
                            : currentItemView === "completed"
                              ? "No completed forms in this category"
                              : currentItemView === "highlighted"
                                ? "No highlighted forms in this category"
                                : "No forms in this category"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedForms.map((form) => (
                          <div
                            key={form.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: form.paused ? `${COLORS.warning}05` : form.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-50 h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200">
                              <GripVertical className="w-5 h-5" style={{ color: "#9CA3AF" }} />
                            </button>
                            <div className="flex-1">
                              <Link
                                href={`/forms/${form.id}`}
                                className="font-semibold hover:underline text-lg"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {form.title}
                              </Link>
                              <div className="flex gap-4 text-sm mt-1.5" style={{ color: COLORS.textSecondary }}>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Version:</span> {form.version}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Issued: {form.issueDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Location:</span> {form.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Actions */}
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => toggleHighlight(category.id, form.id)} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: form.highlighted ? "#EAB308" : "#D1D5DB" }}><Star className="w-5 h-5" /></button>
                                <button onClick={() => toggleApprove(category.id, form.id)} title={form.approved ? "Mark as Incomplete" : "Mark as Completed"} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: form.approved ? "#22C55E" : "#D1D5DB" }}><Check className="w-5 h-5" /></button>
                                <button onClick={() => togglePause(category.id, form.id)} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: form.paused ? "#F59E0B" : "#D1D5DB" }}><Pause className="w-5 h-5" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`/forms/${form.id}/edit`}><button className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#3B82F6" }}><Edit className="w-5 h-5" /></button></Link>
                                <button className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#6B7280" }}><Copy className="w-5 h-5" /></button>
                                <button className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#3B82F6" }}><Download className="w-5 h-5" /></button>
                                {!isViewingArchivedItems ? (
                                  <button onClick={() => archiveForm(form.id)} disabled={loadingAction === `archive-${form.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#F97316", opacity: loadingAction === `archive-${form.id}` ? 0.6 : 1 }}><Archive className="w-5 h-5" /></button>
                                ) : (
                                  <button onClick={() => unarchiveForm(form.id)} disabled={loadingAction === `unarchive-${form.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#22C55E", opacity: loadingAction === `unarchive-${form.id}` ? 0.6 : 1 }}><Archive className="w-5 h-5" /></button>
                                )}
                                <button onClick={() => deleteForm(category.id, form.id)} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#F97316" }}><Trash2 className="w-5 h-5" /></button>
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