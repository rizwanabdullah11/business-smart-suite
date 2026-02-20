"use client"

import { useState } from "react"
import { useEffect } from "react"
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

// // Sample data
// const initialCategories = [
//   {
//     id: "1",
//     title: "General Manuals",
//     manuals: [
//       { id: "1-1", title: "Quality Manual", version: "v2.1", issueDate: "2024-01-15", location: "QMS", highlighted: false, approved: true, paused: false },
//       { id: "1-2", title: "Safety Manual", version: "v3.0", issueDate: "2024-02-01", location: "HSE", highlighted: true, approved: true, paused: false },
//       { id: "1-3", title: "Operations Manual", version: "v4.2", issueDate: "2024-02-05", location: "OPS", highlighted: false, approved: false, paused: false },
//     ]
//   },
//   {
//     id: "2",
//     title: "Technical Documentation",
//     manuals: [
//       { id: "2-1", title: "Technical Specifications", version: "v1.5", issueDate: "2024-01-20", location: "TECH", highlighted: false, approved: true, paused: false },
//       { id: "2-2", title: "Product Manual", version: "v2.3", issueDate: "2024-01-25", location: "PROD", highlighted: false, approved: true, paused: true },
//     ]
//   },
// ]

type SortType = "name" | "date"

export default function ManualPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [archivedCategories, setArchivedCategories] = useState<any[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1"])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [addingManualToCategory, setAddingManualToCategory] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [newManualData, setNewManualData] = useState({
    title: "",
    version: "",
    location: "",
    issueDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token")

      // 1) Get categories
      const catRes = await fetch("http://localhost:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const categoriesData = await catRes.json()

      // 2) Get active manuals
      const manRes = await fetch("http://localhost:5000/api/manuals", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const manualsData = await manRes.json()

      // 3) Get archived manuals
      const archivedRes = await fetch("http://localhost:5000/api/manuals/archived/all", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const archivedData = archivedRes.ok ? await archivedRes.json() : []

      // 4) Merge active manuals inside categories
      const merged = categoriesData
        .filter((cat: any) => !cat.isArchived && !cat.archived)
        .map((cat: any) => ({
          id: cat._id,
          title: cat.name,
          manuals: manualsData
            .filter((m: any) => m.category?._id === cat._id && !m.archived)
            .map((m: any) => ({
              id: m._id,
              title: m.title,
              version: m.version,
              issueDate: m.issueDate,
              location: m.location,
              highlighted: m.highlighted || false,
              approved: m.approved || false,
              paused: m.paused || false
            }))
        }))

      // 5) Merge archived manuals inside archived categories
      const mergedArchived = categoriesData
        .filter((cat: any) => cat.isArchived || cat.archived)
        .map((cat: any) => ({
          id: cat._id,
          title: cat.name,
          manuals: archivedData
            .filter((m: any) => m.category?._id === cat._id)
            .map((m: any) => ({
              id: m._id,
              title: m.title,
              version: m.version,
              issueDate: m.issueDate,
              location: m.location,
              highlighted: m.highlighted || false,
              approved: m.approved || false,
              paused: m.paused || false
            }))
        }))

      setCategories(merged)
      setArchivedCategories(mergedArchived)
    } catch (err) {
      console.log(err)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleHighlight = async (categoryId: string, manualId: string) => {
    try {
      setLoadingAction(`highlight-${manualId}`)
      const token = localStorage.getItem("token")
      const manual = categories
        .find(c => c.id === categoryId)
        ?.manuals.find((m: any) => m.id === manualId)

      if (!manual) return

      const response = await fetch(`http://localhost:5000/api/manuals/${manualId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ highlighted: !manual.highlighted })
      })

      if (!response.ok) throw new Error("Failed to update highlight")

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              manuals: cat.manuals.map((m: any) =>
                m.id === manualId
                  ? { ...m, highlighted: !m.highlighted }
                  : m
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

  const toggleApprove = async (categoryId: string, manualId: string) => {
    try {
      setLoadingAction(`approve-${manualId}`)
      const token = localStorage.getItem("token")
      const manual = categories
        .find(c => c.id === categoryId)
        ?.manuals.find((m: any) => m.id === manualId)

      if (!manual) return

      const response = await fetch(`http://localhost:5000/api/manuals/${manualId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved: !manual.approved })
      })

      if (!response.ok) throw new Error("Failed to update approval")

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              manuals: cat.manuals.map((m: any) =>
                m.id === manualId
                  ? { ...m, approved: !m.approved }
                  : m
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

  const togglePause = async (categoryId: string, manualId: string) => {
    try {
      setLoadingAction(`pause-${manualId}`)
      const token = localStorage.getItem("token")
      const manual = categories
        .find(c => c.id === categoryId)
        ?.manuals.find((m: any) => m.id === manualId)

      if (!manual) return

      const response = await fetch(`http://localhost:5000/api/manuals/${manualId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paused: !manual.paused })
      })

      if (!response.ok) throw new Error("Failed to update pause status")

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              manuals: cat.manuals.map((m: any) =>
                m.id === manualId
                  ? { ...m, paused: !m.paused }
                  : m
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

  const archiveManual = async (categoryId: string, manualId: string) => {
    try {
      setLoadingAction(`archive-${manualId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:5000/api/manuals/${manualId}/archive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Failed to archive manual")

      await loadData()
    } catch (err) {
      console.error("Error archiving manual:", err)
      alert("Failed to archive manual")
    } finally {
      setLoadingAction(null)
    }
  }

  const unarchiveManual = async (categoryId: string, manualId: string) => {
    try {
      setLoadingAction(`unarchive-${manualId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:5000/api/manuals/${manualId}/unarchive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Failed to unarchive manual")

      await loadData()
    } catch (err) {
      console.error("Error unarchiving manual:", err)
      alert("Failed to unarchive manual")
    } finally {
      setLoadingAction(null)
    }
  }

  const archiveCategory = async (categoryId: string) => {
    if (!confirm("Archive this category?")) return

    try {
      setLoadingAction(`archive-category-${categoryId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}/archive`, {
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

      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}/unarchive`, {
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

  const copyManual = async (categoryId: string, manualId: string) => {
    try {
      setLoadingAction(`copy-${manualId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:5000/api/manuals/${manualId}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Failed to copy manual")

      await loadData()
      alert("Manual copied successfully")
    } catch (err) {
      console.error("Error copying manual:", err)
      alert("Failed to copy manual")
    } finally {
      setLoadingAction(null)
    }
  }

  const downloadManual = async (manualId: string, manualTitle: string) => {
    try {
      const token = localStorage.getItem("token")

      // Fetch the manual document
      const response = await fetch(`http://localhost:5000/api/manuals/${manualId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        // If no document endpoint, show message
        alert("No document attached to this manual yet")
        return
      }

      // Create blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = manualTitle.replace(/\s+/g, "_") + ".pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading manual:", err)
      alert("No document available for download")
    }
  }

  const deleteManual = async (categoryId: any, manualId: any) => {
    if (!confirm("Are you sure you want to delete this manual?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:5000/api/manuals/${manualId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to delete manual")
      }

      await loadData()
    } catch (err) {
      console.error("Error deleting manual:", err)
      alert("Failed to delete manual")
    }
  }

  const deleteCategory = async (categoryId: any) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
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

      await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
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

      const response = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newCategoryTitle,
          type: "manual"
        })
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

  const addManualToCategory = async (categoryId: any) => {
    if (!newManualData.title.trim()) {
      alert("Please enter a manual title")
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch("http://localhost:5000/api/manuals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newManualData.title,
          version: newManualData.version || "v1.0",
          location: newManualData.location || "QMS",
          issueDate: newManualData.issueDate,
          category: categoryId
        })
      })

      if (!response.ok) {
        throw new Error("Failed to add manual")
      }

      setAddingManualToCategory(null)
      setNewManualData({
        title: "",
        version: "",
        location: "",
        issueDate: new Date().toISOString().split('T')[0]
      })
      await loadData()
    } catch (err) {
      console.error("Error adding manual:", err)
      alert("Failed to add manual")
    }
  }

  const sortManuals = (manuals: any[]) => {
    const sorted = [...manuals]
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
                Manuals
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage your documentation and manuals
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
            <Link href="/manual/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primaryGradient,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Manual
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
                  background: COLORS.primaryGradient,
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

        {/* Sort Controls */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
            Sort by:
          </span>
          <button
            onClick={() => toggleSort("name")}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2"
            style={{
              background: sortType === "name" ? COLORS.primaryGradient : COLORS.bgWhite,
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
              background: sortType === "date" ? COLORS.primaryGradient : COLORS.bgWhite,
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
          {(showArchived ? archivedCategories : categories).map((category) => {
            const sortedManuals = sortManuals(category.manuals)
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
                      {category.manuals.length} manuals
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
                        setAddingManualToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                      title="Add Manual"
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

                {/* Manuals List */}
                {isExpanded && (
                  <div className="p-5">
                    {/* Add Manual Form */}
                    {addingManualToCategory === category.id && (
                      <div
                        className="mb-8 p-8 rounded-2xl shadow-sm"
                        style={{
                          background: "#F9FAFB",
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <div className="mb-6">
                          <h3 className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
                            Add New Manual
                          </h3>
                          <p className="text-sm text-gray-500 font-medium">Create a new documentation entry in this category</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                              Manual Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newManualData.title}
                              onChange={(e) => setNewManualData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter manual title..."
                              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium shadow-sm"
                              style={{
                                borderColor: COLORS.border,
                                color: COLORS.textPrimary,
                                background: COLORS.bgWhite,
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                              Version
                            </label>
                            <input
                              type="text"
                              value={newManualData.version}
                              onChange={(e) => setNewManualData(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g., v1.0"
                              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium shadow-sm"
                              style={{
                                borderColor: COLORS.border,
                                color: COLORS.textPrimary,
                                background: COLORS.bgWhite,
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                              Location
                            </label>
                            <input
                              type="text"
                              value={newManualData.location}
                              onChange={(e) => setNewManualData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="e.g., QMS"
                              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium shadow-sm"
                              style={{
                                borderColor: COLORS.border,
                                color: COLORS.textPrimary,
                                background: COLORS.bgWhite,
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-base font-bold mb-2.5" style={{ color: COLORS.textPrimary }}>
                              Issue Date
                            </label>
                            <input
                              type="date"
                              value={newManualData.issueDate}
                              onChange={(e) => setNewManualData(prev => ({ ...prev, issueDate: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium shadow-sm"
                              style={{
                                borderColor: COLORS.border,
                                color: COLORS.textPrimary,
                                background: COLORS.bgWhite,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => addManualToCategory(category.id)}
                            className="px-8 py-3.5 rounded-xl font-bold hover:shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            style={{
                              background: COLORS.primaryGradient,
                              color: COLORS.textWhite,
                            }}
                          >
                            Add Manual
                          </button>
                          <button
                            onClick={() => {
                              setAddingManualToCategory(null)
                              setNewManualData({
                                title: "",
                                version: "",
                                location: "",
                                issueDate: new Date().toISOString().split('T')[0]
                              })
                            }}
                            className="px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all"
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

                    {sortedManuals.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>
                          No manuals in this category
                        </p>
                        <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>
                          Click the + button above to add your first manual
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedManuals.map((manual) => (
                          <div
                            key={manual.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: manual.paused ? `${COLORS.orange500}05` : manual.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-100 p-1 rounded">
                              <GripVertical className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1">
                              <Link
                                href={`/manual/${manual.id}`}
                                className="font-bold hover:underline text-xl"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {manual.title}
                              </Link>
                              <div className="flex gap-5 text-base mt-2" style={{ color: COLORS.textSecondary }}>
                                <span className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-400">Version:</span> {manual.version}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-primary" style={{ color: COLORS.primary }} />
                                  {manual.issueDate}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-400">Location:</span> {manual.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Primary Actions */}
                              <div className="flex items-center gap-1 mr-2">
                                <button
                                  onClick={() => toggleHighlight(category.id, manual.id)}
                                  disabled={loadingAction === `highlight-${manual.id}`}
                                  className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `highlight-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  style={{
                                    background: COLORS.bgWhite,
                                    color: manual.highlighted ? "#f59e0b" : "#94a3b8",
                                    borderColor: manual.highlighted ? "#fde047" : "#e2e8f0",
                                  }}
                                  title={manual.highlighted ? "Remove Highlight" : "Highlight"}
                                >
                                  <Star className={`w-5 h-5 ${manual.highlighted ? "fill-current" : ""}`} />
                                </button>
                                <button
                                  onClick={() => toggleApprove(category.id, manual.id)}
                                  disabled={loadingAction === `approve-${manual.id}`}
                                  className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `approve-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  style={{
                                    background: COLORS.bgWhite,
                                    color: manual.approved ? COLORS.emerald600 : "#94a3b8",
                                    borderColor: manual.approved ? COLORS.emerald200 : "#e2e8f0",
                                  }}
                                  title={manual.approved ? "Unapprove" : "Approve"}
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => togglePause(category.id, manual.id)}
                                  disabled={loadingAction === `pause-${manual.id}`}
                                  className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `pause-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  style={{
                                    background: COLORS.bgWhite,
                                    color: manual.paused ? COLORS.orange600 : "#94a3b8",
                                    borderColor: manual.paused ? COLORS.orange200 : "#e2e8f0",
                                  }}
                                  title={manual.paused ? "Resume" : "Pause"}
                                >
                                  <Pause className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Divider */}
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>

                              {/* Secondary Actions */}
                              <div className="flex items-center gap-1">
                                <Link href={`/manual/${manual.id}/edit`}>
                                  <button
                                    className="p-3 rounded-lg transition-all hover:scale-110 shadow-sm border cursor-pointer"
                                    style={{
                                      background: COLORS.bgWhite,
                                      color: COLORS.blue600,
                                      borderColor: COLORS.blue200,
                                    }}
                                    title="Edit"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                </Link>
                                <button
                                  onClick={() => copyManual(category.id, manual.id)}
                                  disabled={loadingAction === `copy-${manual.id}`}
                                  className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `copy-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  style={{
                                    background: COLORS.bgWhite,
                                    color: COLORS.gray600,
                                    borderColor: COLORS.gray200,
                                  }}
                                  title="Duplicate"
                                >
                                  <Copy className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => downloadManual(manual.id, manual.title)}
                                  disabled={loadingAction === `download-${manual.id}`}
                                  className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `download-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  style={{
                                    background: COLORS.bgWhite,
                                    color: COLORS.indigo600,
                                    borderColor: COLORS.indigo200,
                                  }}
                                  title="Download"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                                {!showArchived ? (
                                  <button
                                    onClick={() => archiveManual(category.id, manual.id)}
                                    disabled={loadingAction === `archive-${manual.id}`}
                                    className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `archive-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                    style={{
                                      background: COLORS.bgWhite,
                                      color: COLORS.orange700,
                                      borderColor: COLORS.orange200,
                                    }}
                                    title="Archive"
                                  >
                                    <Archive className="w-5 h-5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => unarchiveManual(category.id, manual.id)}
                                    disabled={loadingAction === `unarchive-${manual.id}`}
                                    className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `unarchive-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                    style={{
                                      background: COLORS.bgWhite,
                                      color: COLORS.emerald600,
                                      borderColor: COLORS.emerald200,
                                    }}
                                    title="Unarchive"
                                  >
                                    <Archive className="w-5 h-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteManual(category.id, manual.id)}
                                  className="p-3 rounded-lg transition-all hover:scale-110 shadow-sm border cursor-pointer"
                                  style={{
                                    background: COLORS.bgWhite,
                                    color: COLORS.pink600,
                                    borderColor: COLORS.pink200,
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
