"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
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
  Type,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react"
import { COLORS } from "@/constant/colors"

type SortType = "name" | "date"

type DynamicModulePageProps = {
  moduleSlug: string
  title: string
  description: string
  itemLabel: string
  icon: LucideIcon
  newItemHref: string
  itemHrefPrefix: string
}

export default function DynamicModulePage({
  moduleSlug,
  title,
  description,
  itemLabel,
  icon: Icon,
  newItemHref,
  itemHrefPrefix,
}: DynamicModulePageProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [archivedCategories, setArchivedCategories] = useState<any[]>([])
  const [categoryItemView, setCategoryItemView] = useState<
    Record<string, "active" | "archived" | "completed" | "highlighted">
  >({})
  const [showArchived, setShowArchived] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [addingItemToCategory, setAddingItemToCategory] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [newItemData, setNewItemData] = useState({
    title: "",
    version: "",
    location: "",
    issueDate: new Date().toISOString().split("T")[0],
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

      const catRes = await fetch(`/api/categories?type=${moduleSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const categoriesData = await catRes.json()

      const itemsRes = await fetch(`/api/${moduleSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const itemsData = await itemsRes.json()

      const archivedRes = await fetch(`/api/${moduleSlug}/archived/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const archivedData = archivedRes.ok ? await archivedRes.json() : []

      const archivedById = new Map<string, any>()
      archivedData.forEach((item: any) => {
        if (item?._id) archivedById.set(String(item._id), item)
      })
      itemsData
        .filter((item: any) => item?.archived || item?.isArchived)
        .forEach((item: any) => {
          if (item?._id) archivedById.set(String(item._id), item)
        })
      const archivedItems = Array.from(archivedById.values())

      const allCategories = categoriesData.map((cat: any) => {
        const categoryId = toIdString(cat._id)
        const activeItems = itemsData
          .filter((i: any) => getItemCategoryId(i) === categoryId && !i.archived && !i.isArchived)
          .map((i: any) => ({
            id: i._id,
            title: i.title,
            version: i.version,
            issueDate: i.issueDate,
            location: i.location,
            highlighted: i.highlighted || false,
            approved: i.approved || false,
            paused: i.paused || false,
          }))

        const categoryArchivedItems = archivedItems
          .filter((i: any) => getItemCategoryId(i) === categoryId)
          .map((i: any) => ({
            id: i._id,
            title: i.title,
            version: i.version,
            issueDate: i.issueDate,
            location: i.location,
            highlighted: i.highlighted || false,
            approved: i.approved || false,
            paused: i.paused || false,
          }))

        return {
          id: categoryId,
          title: cat.name,
          isArchived: Boolean(cat.isArchived),
          archived: Boolean(cat.archived),
          items: activeItems,
          archivedItems: categoryArchivedItems,
          completedItems: activeItems.filter((i: any) => Boolean(i.approved)),
          highlightedItems: activeItems.filter((i: any) => Boolean(i.highlighted)),
        }
      })

      const merged = allCategories.filter((cat: any) => !cat.isArchived && !cat.archived)
      const mergedArchived = allCategories.filter(
        (cat: any) => cat.archivedItems.length > 0 || cat.isArchived || cat.archived
      )

      setCategories(merged)
      setArchivedCategories(mergedArchived)
      setExpandedCategories(merged.length ? [merged[0].id] : [])
      setCategoryItemView((prev) => {
        const next = { ...prev }
        allCategories.forEach((cat: any) => {
          if (!next[cat.id]) next[cat.id] = "active"
        })
        return next
      })
    } catch (err) {
      console.error("Error loading module data:", err)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
  }

  const updateItem = async (itemId: string, payload: Record<string, unknown>, actionKey: string) => {
    try {
      setLoadingAction(`${actionKey}-${itemId}`)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("Failed to update item")
      await loadData()
    } catch (err) {
      console.error("Update item failed:", err)
      alert("Failed to update item")
    } finally {
      setLoadingAction(null)
    }
  }

  const archiveCategory = async (categoryId: string) => {
    if (!confirm("Archive this category?")) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/categories/${categoryId}/archive?type=${moduleSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to archive category")
      await loadData()
    } catch (err) {
      console.error("Archive category failed:", err)
      alert("Failed to archive category")
    }
  }

  const unarchiveCategory = async (categoryId: string) => {
    if (!confirm("Unarchive this category?")) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/categories/${categoryId}/unarchive?type=${moduleSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to unarchive category")
      await loadData()
    } catch (err) {
      console.error("Unarchive category failed:", err)
      alert("Failed to unarchive category")
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to delete item")
      await loadData()
    } catch (err) {
      console.error("Delete item failed:", err)
      alert("Failed to delete item")
    }
  }

  const copyItem = async (categoryId: string, item: any) => {
    try {
      setLoadingAction(`copy-${item.id}`)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `${item.title} (Copy)`,
          version: item.version || "v1.0",
          location: item.location || "N/A",
          issueDate: item.issueDate || new Date().toISOString().split("T")[0],
          category: categoryId,
          highlighted: false,
          approved: false,
          paused: false,
        }),
      })
      if (!response.ok) throw new Error("Failed to copy item")
      await loadData()
    } catch (err) {
      console.error("Copy item failed:", err)
      alert("Failed to copy item")
    } finally {
      setLoadingAction(null)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/categories/${categoryId}?type=${moduleSlug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to delete category")
      await loadData()
    } catch (err) {
      console.error("Delete category failed:", err)
      alert("Failed to delete category")
    }
  }

  const saveEditCategory = async (categoryId: string) => {
    if (!editTitle.trim()) return
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/categories/${categoryId}?type=${moduleSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editTitle.trim() }),
      })
      await loadData()
    } catch (err) {
      console.error("Edit category failed:", err)
    }
    setEditingCategory(null)
    setEditTitle("")
  }

  const addCategory = async () => {
    if (!newCategoryTitle.trim()) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryTitle, type: moduleSlug }),
      })
      if (!response.ok) throw new Error("Failed to add category")
      setNewCategoryTitle("")
      setShowAddCategory(false)
      await loadData()
    } catch (err) {
      console.error("Add category failed:", err)
      alert("Failed to add category")
    }
  }

  const addItemToCategory = async (categoryId: string) => {
    if (!newItemData.title.trim()) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newItemData.title,
          version: newItemData.version || "v1.0",
          location: newItemData.location || "N/A",
          issueDate: newItemData.issueDate,
          category: categoryId,
        }),
      })
      if (!response.ok) throw new Error("Failed to add item")
      setAddingItemToCategory(null)
      setNewItemData({
        title: "",
        version: "",
        location: "",
        issueDate: new Date().toISOString().split("T")[0],
      })
      await loadData()
    } catch (err) {
      console.error("Add item failed:", err)
      alert("Failed to add item")
    }
  }

  const sortItems = (items: any[]) => {
    const sorted = [...items]
    if (sortType === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      sorted.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime())
    }
    return sortDirection === "asc" ? sorted : sorted.reverse()
  }

  const toggleSort = (type: SortType) => {
    if (sortType === type) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortType(type)
      setSortDirection("asc")
    }
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgGray }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:shadow-md" style={{ backgroundColor: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>{title}</h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>{description}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAddCategory(!showAddCategory)} className="px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
              <Plus className="w-4 h-4" /> Add Category
            </button>
            <button onClick={() => setShowArchived(!showArchived)} className="px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
              <Archive className="w-4 h-4" /> {showArchived ? "Show Active" : "Show Archived"}
            </button>
            <Link href={newItemHref}>
              <button className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2" style={{ background: COLORS.primaryGradient, color: COLORS.textWhite }}>
                <Plus className="w-4 h-4" /> Add New {itemLabel}
              </button>
            </Link>
          </div>
        </div>

        {showAddCategory && (
          <div className="mb-6 p-5 rounded-xl shadow-sm" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
            <div className="flex gap-3">
              <input type="text" value={newCategoryTitle} onChange={(e) => setNewCategoryTitle(e.target.value)} placeholder="Enter category name..." className="flex-1 px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: COLORS.border, color: COLORS.textPrimary }} />
              <button onClick={addCategory} className="px-6 py-2.5 rounded-lg font-medium" style={{ background: COLORS.primary, color: COLORS.textWhite }}>Create</button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex gap-1 border-b-2" style={{ borderColor: COLORS.border }}>
            <button className="px-6 py-3 font-semibold border-b-2" style={{ borderColor: !showArchived ? COLORS.primary : "transparent", color: !showArchived ? COLORS.primary : COLORS.textSecondary }} onClick={() => setShowArchived(false)}>Active ({categories.length})</button>
            <button className="px-6 py-3 font-semibold border-b-2" style={{ borderColor: showArchived ? COLORS.primary : "transparent", color: showArchived ? COLORS.primary : COLORS.textSecondary }} onClick={() => setShowArchived(true)}>Archived ({archivedCategories.length})</button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Sort by:</span>
          <button onClick={() => toggleSort("name")} className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2" style={{ background: sortType === "name" ? COLORS.primaryGradient : COLORS.bgWhite, color: sortType === "name" ? COLORS.textWhite : COLORS.textPrimary, border: `1px solid ${sortType === "name" ? COLORS.primary : COLORS.border}` }}>
            <Type className="w-4 h-4" /> Name {sortType === "name" && <ArrowUpDown className={`w-3 h-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />}
          </button>
          <button onClick={() => toggleSort("date")} className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2" style={{ background: sortType === "date" ? COLORS.primaryGradient : COLORS.bgWhite, color: sortType === "date" ? COLORS.textWhite : COLORS.textPrimary, border: `1px solid ${sortType === "date" ? COLORS.primary : COLORS.border}` }}>
            <Calendar className="w-4 h-4" /> Date {sortType === "date" && <ArrowUpDown className={`w-3 h-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} />}
          </button>
        </div>

        <div className="space-y-4">
          {(showArchived ? archivedCategories : categories).map((category) => {
            const currentItemView = categoryItemView[category.id] ?? (showArchived ? "archived" : "active")
            const currentItems = currentItemView === "archived" ? (category.archivedItems || []) : currentItemView === "completed" ? (category.completedItems || []) : currentItemView === "highlighted" ? (category.highlightedItems || []) : (category.items || [])
            const sortedItems = sortItems(currentItems)
            const isViewingArchivedItems = currentItemView === "archived"
            const isExpanded = expandedCategories.includes(category.id)

            return (
              <div key={category.id} className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
                <div className="p-5 flex items-center justify-between cursor-pointer" style={{ background: COLORS.primaryGradient, color: COLORS.textWhite }} onClick={() => toggleCategory(category.id)}>
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                    <span className="px-3 py-1 rounded-full text-base font-medium bg-white bg-opacity-20">{currentItems.length} {itemLabel.toLowerCase()}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditingCategory(category.id); setEditTitle(category.title) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}><Edit className="w-5 h-5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); if (isViewingArchivedItems) setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" })); setAddingItemToCategory(category.id) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}><Plus className="w-5 h-5" /></button>
                    {showArchived ? (
                      <button onClick={(e) => { e.stopPropagation(); unarchiveCategory(category.id) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.green600 }}><Archive className="w-5 h-5" /></button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); archiveCategory(category.id) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}><Archive className="w-5 h-5" /></button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(category.id) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.pink600 }}><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>

                {editingCategory === category.id && (
                  <div className="p-5" style={{ background: COLORS.bgGray, borderBottom: `1px solid ${COLORS.border}` }}>
                    <div className="flex gap-3">
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }} />
                      <button onClick={() => saveEditCategory(category.id)} className="px-6 py-2.5 rounded-lg font-medium flex items-center gap-2" style={{ background: COLORS.primary, color: COLORS.textWhite }}><Check className="w-4 h-4" />Save</button>
                      <button onClick={() => { setEditingCategory(null); setEditTitle("") }} className="px-6 py-2.5 rounded-lg font-medium flex items-center gap-2" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}><X className="w-4 h-4" />Cancel</button>
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="p-5">
                    <div className="mb-4 flex gap-2">
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ background: currentItemView === "active" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "active" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "active" ? COLORS.primary : COLORS.border }}>Active ({(category.items || []).length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ background: currentItemView === "archived" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "archived" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "archived" ? COLORS.primary : COLORS.border }}>Archived ({(category.archivedItems || []).length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "completed" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ background: currentItemView === "completed" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "completed" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "completed" ? COLORS.primary : COLORS.border }}>Completed ({(category.completedItems || []).length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "highlighted" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ background: currentItemView === "highlighted" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "highlighted" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "highlighted" ? COLORS.primary : COLORS.border }}>Highlighted ({(category.highlightedItems || []).length})</button>
                    </div>

                    {addingItemToCategory === category.id && currentItemView === "active" && (
                      <div className="mb-5 p-5 rounded-xl shadow-sm" style={{ background: COLORS.bgGray, border: `2px dashed ${COLORS.border}` }}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <input type="text" value={newItemData.title} onChange={(e) => setNewItemData((prev) => ({ ...prev, title: e.target.value }))} placeholder={`Enter ${itemLabel.toLowerCase()} title...`} className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400" style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }} />
                          <input type="text" value={newItemData.version} onChange={(e) => setNewItemData((prev) => ({ ...prev, version: e.target.value }))} placeholder="e.g., v1.0" className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400" style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }} />
                          <input type="text" value={newItemData.location} onChange={(e) => setNewItemData((prev) => ({ ...prev, location: e.target.value }))} placeholder="e.g., QMS" className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400" style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }} />
                          <input type="date" value={newItemData.issueDate} onChange={(e) => setNewItemData((prev) => ({ ...prev, issueDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }} />
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => addItemToCategory(category.id)} className="px-6 py-2.5 rounded-lg font-medium" style={{ background: COLORS.primary, color: COLORS.textWhite }}>Add {itemLabel}</button>
                          <button onClick={() => setAddingItemToCategory(null)} className="px-6 py-2.5 rounded-lg font-medium" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {sortedItems.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>
                          {isViewingArchivedItems ? `No archived ${itemLabel.toLowerCase()}s in this category` : currentItemView === "completed" ? `No completed ${itemLabel.toLowerCase()}s in this category` : currentItemView === "highlighted" ? `No highlighted ${itemLabel.toLowerCase()}s in this category` : `No ${itemLabel.toLowerCase()}s in this category`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedItems.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all" style={{ background: item.paused ? `${COLORS.warning}05` : item.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
                            <button className="cursor-move hover:bg-gray-50 h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200"><GripVertical className="w-5 h-5" style={{ color: "#9CA3AF" }} /></button>
                            <div className="flex-1">
                              <Link href={`${itemHrefPrefix}/${item.id}`} className="font-semibold hover:underline text-lg" style={{ color: COLORS.textPrimary }}>{item.title}</Link>
                              <div className="flex gap-4 text-sm mt-1.5" style={{ color: COLORS.textSecondary }}>
                                <span><span className="font-medium">Version:</span> {item.version}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.issueDate}</span>
                                <span><span className="font-medium">Location:</span> {item.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => updateItem(item.id, { highlighted: !item.highlighted }, "highlight")} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: item.highlighted ? "#EAB308" : "#D1D5DB" }}><Star className={`w-5 h-5 ${item.highlighted ? "fill-current" : ""}`} /></button>
                                <button onClick={() => updateItem(item.id, { approved: !item.approved }, "approve")} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: item.approved ? "#22C55E" : "#D1D5DB" }} title={item.approved ? "Mark as Incomplete" : "Mark as Completed"}><Check className="w-5 h-5" /></button>
                                <button onClick={() => updateItem(item.id, { paused: !item.paused }, "pause")} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: item.paused ? "#F59E0B" : "#D1D5DB" }}><Pause className="w-5 h-5" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`${itemHrefPrefix}/${item.id}/edit`}><button className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#3B82F6" }}><Edit className="w-5 h-5" /></button></Link>
                                <button onClick={() => copyItem(category.id, item)} disabled={loadingAction === `copy-${item.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#6B7280", opacity: loadingAction === `copy-${item.id}` ? 0.6 : 1 }}><Copy className="w-5 h-5" /></button>
                                <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#3B82F6" }}><Download className="w-5 h-5" /></button>
                                {!isViewingArchivedItems ? (
                                  <button onClick={() => updateItem(item.id, { archived: true, isArchived: true }, "archive")} disabled={loadingAction === `archive-${item.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#F97316" }}><Archive className="w-5 h-5" /></button>
                                ) : (
                                  <button onClick={() => updateItem(item.id, { archived: false, isArchived: false }, "unarchive")} disabled={loadingAction === `unarchive-${item.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#22C55E" }}><Archive className="w-5 h-5" /></button>
                                )}
                                <button onClick={() => deleteItem(item.id)} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#F97316" }}><Trash2 className="w-5 h-5" /></button>
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

