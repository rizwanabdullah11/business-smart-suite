"use client"

import { useEffect, useMemo, useState } from "react"
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
  Bot,
  type LucideIcon,
} from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useAuth } from "@/contexts/auth-context"

type SortType = "name" | "date"
type FieldType = "text" | "number" | "date" | "textarea" | "select" | "checkbox"

type ModuleField = {
  key: string
  label: string
  type?: FieldType
  placeholder?: string
  options?: string[]
  defaultValue?: string | number | boolean
  required?: boolean
}

type DynamicModulePageProps = {
  moduleSlug: string
  title: string
  description: string
  itemLabel: string
  icon: LucideIcon
  newItemHref: string
  itemHrefPrefix: string
  categoryType?: string
  titleFieldKey?: string
  dateFieldKey?: string
  formFields?: ModuleField[]
  listFieldKeys?: string[]
}

const defaultFields: ModuleField[] = [
  { key: "title", label: "Title", type: "text", required: true, placeholder: "Enter title..." },
  { key: "version", label: "Version", type: "text", defaultValue: "v1.0", placeholder: "e.g., v1.0" },
  { key: "location", label: "Location", type: "text", defaultValue: "N/A", placeholder: "e.g., QMS" },
  { key: "issueDate", label: "Issue Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
]

function toIdString(value: any) {
  if (!value) return null
  if (typeof value === "string") return value
  if (typeof value === "object" && "_id" in value) return String((value as any)._id)
  return String(value)
}

function toFieldValue(field: ModuleField) {
  if (field.defaultValue !== undefined) return field.defaultValue
  if (field.type === "checkbox") return false
  if (field.type === "date") return new Date().toISOString().split("T")[0]
  return ""
}

export default function DynamicModulePage({
  moduleSlug,
  title,
  description,
  itemLabel,
  icon: Icon,
  newItemHref,
  itemHrefPrefix,
  categoryType,
  titleFieldKey = "title",
  dateFieldKey = "issueDate",
  formFields = defaultFields,
  listFieldKeys,
}: DynamicModulePageProps) {
  const { isEmployee } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [archivedCategories, setArchivedCategories] = useState<any[]>([])
  const [categoryItemView, setCategoryItemView] = useState<Record<string, "active" | "archived" | "completed" | "highlighted">>({})
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
  const [newItemData, setNewItemData] = useState<Record<string, any>>({})
  const [showAskMe, setShowAskMe] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedItemId, setSelectedItemId] = useState("")
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiReply, setAiReply] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const effectiveCategoryType = categoryType || moduleSlug

  const defaultNewItemData = useMemo(() => {
    const base: Record<string, any> = {}
    formFields.forEach((field) => {
      base[field.key] = toFieldValue(field)
    })
    if (!base[titleFieldKey]) base[titleFieldKey] = ""
    return base
  }, [formFields, titleFieldKey])

  useEffect(() => {
    setNewItemData(defaultNewItemData)
  }, [defaultNewItemData])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when role resolves
  }, [isEmployee, moduleSlug, effectiveCategoryType])

  const getItemCategoryId = (item: any) => {
    const raw = item?.category?._id || item?.categoryId || item?.category || null
    return toIdString(raw)
  }

  const getItemTitle = (item: any) => String(item?.[titleFieldKey] || item?.title || "")

  const normalizeItem = (item: any) => ({
    ...item,
    id: String(item?._id || item?.id),
    title: String(item?.title || item?.[titleFieldKey] || ""),
  })

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token")

      const catRes = await fetch(`/api/categories?type=${effectiveCategoryType}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      })
      const categoriesData = await catRes.json()
      const itemsRes = await fetch(`/api/${moduleSlug}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      })
      const itemsData = await itemsRes.json()
      const archivedRes =
        !isEmployee &&
        (await fetch(`/api/${moduleSlug}/archived/all`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }))
      const archivedData = !isEmployee && archivedRes && archivedRes.ok ? await archivedRes.json() : []

      const archivedById = new Map<string, any>()
      archivedData.forEach((item: any) => item?._id && archivedById.set(String(item._id), item))
      itemsData
        .filter((item: any) => item?.archived || item?.isArchived)
        .forEach((item: any) => item?._id && archivedById.set(String(item._id), item))

      const archivedItems = Array.from(archivedById.values())

      const allCategories = categoriesData.map((cat: any) => {
        const categoryId = toIdString(cat._id)
        const nonArchivedItems = itemsData
          .filter((i: any) => getItemCategoryId(i) === categoryId && !i.archived && !i.isArchived)
          .map(normalizeItem)
        const activeItems = nonArchivedItems.filter((i: any) => !Boolean(i.approved))
        const categoryArchivedItems = archivedItems
          .filter((i: any) => getItemCategoryId(i) === categoryId)
          .map(normalizeItem)

        return {
          id: categoryId,
          title: cat.name,
          isArchived: Boolean(cat.isArchived),
          archived: Boolean(cat.archived),
          items: activeItems,
          archivedItems: categoryArchivedItems,
          completedItems: nonArchivedItems.filter((i: any) => Boolean(i.approved)),
          highlightedItems: nonArchivedItems.filter((i: any) => Boolean(i.highlighted)),
        }
      })

      const merged = allCategories.filter((cat: any) => !cat.isArchived && !cat.archived)
      // Category should move to archived list only when category itself is archived.
      // Archived tasks remain visible via the inner "Archived" tab per category.
      const mergedArchived = allCategories.filter((cat: any) => cat.isArchived || cat.archived)

      setCategories(merged)
      setArchivedCategories(mergedArchived)
      setExpandedCategories((prev) => (prev.length ? prev : merged.length ? [merged[0].id] : []))
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
    setExpandedCategories((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]))
  }

  const updateItem = async (itemId: string, payload: Record<string, unknown>, actionKey: string) => {
    try {
      setLoadingAction(`${actionKey}-${itemId}`)
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      const response = await fetch(`/api/categories/${categoryId}/archive?type=${effectiveCategoryType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to archive category")
      await loadData()
    } catch {
      alert("Failed to archive category")
    }
  }

  const unarchiveCategory = async (categoryId: string) => {
    if (!confirm("Unarchive this category?")) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/categories/${categoryId}/unarchive?type=${effectiveCategoryType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to unarchive category")
      await loadData()
    } catch {
      alert("Failed to unarchive category")
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}/${itemId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error("Failed to delete item")
      await loadData()
    } catch {
      alert("Failed to delete item")
    }
  }

  const copyItem = async (categoryId: string, item: any) => {
    try {
      setLoadingAction(`copy-${item.id}`)
      const token = localStorage.getItem("token")
      const copyPayload: Record<string, any> = { ...item }
      delete copyPayload.id
      delete copyPayload._id
      delete copyPayload.createdAt
      delete copyPayload.updatedAt
      copyPayload[titleFieldKey] = `${getItemTitle(item)} (Copy)`
      copyPayload.title = copyPayload[titleFieldKey]
      copyPayload.category = categoryId
      copyPayload.categoryId = categoryId
      copyPayload.highlighted = false
      copyPayload.approved = false
      copyPayload.paused = false
      copyPayload.archived = false
      copyPayload.isArchived = false

      const response = await fetch(`/api/${moduleSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(copyPayload),
      })
      if (!response.ok) throw new Error("Failed to copy item")
      await loadData()
    } catch {
      alert("Failed to copy item")
    } finally {
      setLoadingAction(null)
    }
  }

  const downloadItem = async (item: any) => {
    try {
      setLoadingAction(`download-${item.id}`)

      let fileData = item?.fileData
      let fileName = item?.fileName
      let fileType = item?.fileType

      // Re-fetch latest row to ensure we get document fields.
      if (!fileData) {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/${moduleSlug}/${item.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (response.ok) {
          const latest = await response.json()
          fileData = latest?.fileData
          fileName = latest?.fileName
          fileType = latest?.fileType
        }
      }

      if (!fileData) {
        alert("No uploaded document found for this task.")
        return
      }

      const href =
        typeof fileData === "string" && fileData.startsWith("data:")
          ? fileData
          : `data:${fileType || "application/octet-stream"};base64,${String(fileData)}`

      const link = document.createElement("a")
      link.href = href
      link.download = fileName || `${getItemTitle(item)}.file`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Download failed:", err)
      alert("Failed to download file")
    } finally {
      setLoadingAction(null)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/categories/${categoryId}?type=${effectiveCategoryType}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error("Failed to delete category")
      await loadData()
    } catch {
      alert("Failed to delete category")
    }
  }

  const saveEditCategory = async (categoryId: string) => {
    if (!editTitle.trim()) return
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/categories/${categoryId}?type=${effectiveCategoryType}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editTitle.trim() }),
      })
      await loadData()
    } catch {
      alert("Failed to update category")
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategoryTitle, type: effectiveCategoryType }),
      })
      if (!response.ok) throw new Error("Failed to add category")
      setNewCategoryTitle("")
      setShowAddCategory(false)
      await loadData()
    } catch {
      alert("Failed to add category")
    }
  }

  const addItemToCategory = async (categoryId: string) => {
    const titleValue = String(newItemData[titleFieldKey] || "").trim()
    if (!titleValue) {
      alert(`${itemLabel} title is required`)
      return
    }
    try {
      const token = localStorage.getItem("token")
      const payload = { ...newItemData, title: titleValue, category: categoryId, categoryId }
      const response = await fetch(`/api/${moduleSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("Failed to add item")
      setAddingItemToCategory(null)
      setNewItemData(defaultNewItemData)
      await loadData()
    } catch {
      alert("Failed to add item")
    }
  }

  const sortItems = (items: any[]) => {
    const sorted = [...items]
    if (sortType === "name") {
      sorted.sort((a, b) => getItemTitle(a).localeCompare(getItemTitle(b)))
    } else {
      sorted.sort((a, b) => new Date(a?.[dateFieldKey] || 0).getTime() - new Date(b?.[dateFieldKey] || 0).getTime())
    }
    return sortDirection === "asc" ? sorted : sorted.reverse()
  }

  const renderInputField = (field: ModuleField) => {
    const value = newItemData[field.key]
    const commonClass = "w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
    const commonStyle = { borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }

    if (field.type === "textarea") {
      return (
        <textarea
          value={String(value || "")}
          onChange={(e) => setNewItemData((prev) => ({ ...prev, [field.key]: e.target.value }))}
          placeholder={field.placeholder}
          rows={3}
          className={commonClass}
          style={commonStyle}
        />
      )
    }
    if (field.type === "select") {
      return (
        <select
          value={String(value ?? "")}
          onChange={(e) => setNewItemData((prev) => ({ ...prev, [field.key]: e.target.value }))}
          className={commonClass}
          style={commonStyle}
        >
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }
    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setNewItemData((prev) => ({ ...prev, [field.key]: e.target.checked }))}
          />
          <span style={{ color: COLORS.textPrimary }}>{field.label}</span>
        </label>
      )
    }
    return (
      <input
        type={field.type || "text"}
        value={value ?? ""}
        onChange={(e) => setNewItemData((prev) => ({ ...prev, [field.key]: field.type === "number" ? e.target.value : e.target.value }))}
        placeholder={field.placeholder}
        className={commonClass}
        style={commonStyle}
      />
    )
  }

  const displayKeys = listFieldKeys?.length ? listFieldKeys : formFields.map((f) => f.key).filter((k) => k !== titleFieldKey).slice(0, 4)

  const allItemsForAi = useMemo(() => {
    const active = categories.flatMap((cat: any) =>
      (cat.items || []).map((item: any) => ({ ...item, categoryTitle: cat.title, categoryId: cat.id }))
    )
    const archived = archivedCategories.flatMap((cat: any) =>
      (cat.archivedItems || []).map((item: any) => ({
        ...item,
        categoryTitle: `${cat.title} (Archived)`,
        categoryId: cat.id,
      }))
    )
    return [...active, ...archived]
  }, [categories, archivedCategories])

  const allCategoryOptions = useMemo(() => {
    const active = categories.map((cat: any) => ({ id: cat.id, title: cat.title }))
    const archived = archivedCategories
      .filter((cat: any) => !active.some((a: any) => a.id === cat.id))
      .map((cat: any) => ({ id: cat.id, title: `${cat.title} (Archived)` }))
    return [...active, ...archived]
  }, [categories, archivedCategories])

  const filteredItemsForAi = useMemo(() => {
    if (!selectedCategoryId) return allItemsForAi
    return allItemsForAi.filter((item: any) => item.categoryId === selectedCategoryId)
  }, [allItemsForAi, selectedCategoryId])

  useEffect(() => {
    if (!showAskMe) return
    if (!filteredItemsForAi.some((item: any) => item.id === selectedItemId)) {
      setSelectedItemId(filteredItemsForAi[0]?.id || "")
    }
  }, [selectedCategoryId, showAskMe, selectedItemId, filteredItemsForAi])

  useEffect(() => {
    if (!showAskMe) return
    const previousOverflow = document.body.style.overflow
    const previousTouchAction = document.body.style.touchAction
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.touchAction = previousTouchAction
    }
  }, [showAskMe])

  const callModuleAi = async (payload: Record<string, unknown>) => {
    setAiLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/${moduleSlug}/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || "AI request failed")
      setAiReply(result?.answer || "No response")
    } catch (err) {
      console.error("Module AI failed:", err)
      alert("Failed to generate AI response")
    } finally {
      setAiLoading(false)
    }
  }

  const handleSummarizeAllTasks = async () => {
    await callModuleAi({
      action: selectedCategoryId ? "summarize-category" : "summarize-all",
      categoryId: selectedCategoryId || undefined,
    })
  }

  const handleAskSelectedTask = async () => {
    const itemId = selectedItemId
    const question = aiQuestion.trim()

    if (itemId) {
      await callModuleAi({
        action: "ask-one",
        itemId,
        question,
      })
      return
    }

    if (selectedCategoryId) {
      await callModuleAi({
        action: "ask-category",
        categoryId: selectedCategoryId,
        question,
      })
      return
    }

    if (!question) {
      alert(`Please select a category or ${itemLabel.toLowerCase()}, or enter a question.`)
      return
    }

    await callModuleAi({
      action: "summarize-all",
      question,
    })
  }

  const parsedAiRows = useMemo(() => {
    if (!aiReply.trim()) return []
    return aiReply
      .split("\n")
      .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
      .filter(Boolean)
  }, [aiReply])

  const parseAiRow = (line: string) => {
    const cleanLine = line.replace(/\.$/, "").trim()
    const separatorIndex = cleanLine.indexOf(":")
    if (separatorIndex === -1) {
      return { title: cleanLine, details: [] as string[] }
    }
    const title = cleanLine.slice(0, separatorIndex).trim()
    const detailsPart = cleanLine.slice(separatorIndex + 1).trim()
    const details = detailsPart
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean)
    return { title, details }
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
            {!isEmployee ? (
              <button
                type="button"
                onClick={() => {
                  const firstCategoryId = allCategoryOptions[0]?.id || ""
                  setSelectedCategoryId(firstCategoryId)
                  const firstItem =
                    allItemsForAi.find((item: any) => item.categoryId === firstCategoryId) ||
                    allItemsForAi[0]
                  setSelectedItemId(firstItem?.id || "")
                  setAiQuestion("")
                  setAiReply("")
                  setShowAskMe(true)
                }}
                className="px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2"
                style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
              >
                <Bot className="w-4 h-4" /> Ask Me
              </button>
            ) : null}
            <button type="button" onClick={() => setShowAddCategory(!showAddCategory)} className="px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
              <Plus className="w-4 h-4" /> Add Category
            </button>
            {!isEmployee ? (
              <button type="button" onClick={() => setShowArchived(!showArchived)} className="px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
                <Archive className="w-4 h-4" /> {showArchived ? "Show Active" : "Show Archived"}
              </button>
            ) : null}
            <Link href={newItemHref}>
              <button type="button" className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2" style={{ background: COLORS.primaryGradient, color: COLORS.textWhite }}>
                <Plus className="w-4 h-4" /> New {itemLabel}
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

        {!isEmployee ? (
          <div className="mb-6">
            <div className="flex gap-1 border-b-2" style={{ borderColor: COLORS.border }}>
              <button type="button" className="px-6 py-3 font-semibold border-b-2" style={{ borderColor: !showArchived ? COLORS.primary : "transparent", color: !showArchived ? COLORS.primary : COLORS.textSecondary }} onClick={() => setShowArchived(false)}>Active ({categories.length})</button>
              <button type="button" className="px-6 py-3 font-semibold border-b-2" style={{ borderColor: showArchived ? COLORS.primary : "transparent", color: showArchived ? COLORS.primary : COLORS.textSecondary }} onClick={() => setShowArchived(true)}>Archived ({archivedCategories.length})</button>
            </div>
          </div>
        ) : null}

        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Sort by:</span>
          <button onClick={() => setSortType("name")} className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2" style={{ background: sortType === "name" ? COLORS.primaryGradient : COLORS.bgWhite, color: sortType === "name" ? COLORS.textWhite : COLORS.textPrimary, border: `1px solid ${sortType === "name" ? COLORS.primary : COLORS.border}` }}><Type className="w-4 h-4" />Name <ArrowUpDown className={`w-3 h-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} /></button>
          <button onClick={() => setSortType("date")} className="px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2" style={{ background: sortType === "date" ? COLORS.primaryGradient : COLORS.bgWhite, color: sortType === "date" ? COLORS.textWhite : COLORS.textPrimary, border: `1px solid ${sortType === "date" ? COLORS.primary : COLORS.border}` }}><Calendar className="w-4 h-4" />Date</button>
          <button onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))} className="px-3 py-2 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}>Toggle</button>
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
                    {!isEmployee ? (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setEditingCategory(category.id); setEditTitle(category.title) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}><Edit className="w-5 h-5" /></button>
                    ) : null}
                    <button type="button" onClick={(e) => { e.stopPropagation(); if (isViewingArchivedItems) setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" })); setAddingItemToCategory(category.id) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}><Plus className="w-5 h-5" /></button>
                    {!isEmployee ? (
                      showArchived ? (
                        <button type="button" onClick={(e) => { e.stopPropagation(); unarchiveCategory(category.id) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.green600 }}><Archive className="w-5 h-5" /></button>
                      ) : (
                        <button type="button" onClick={(e) => { e.stopPropagation(); archiveCategory(category.id) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}><Archive className="w-5 h-5" /></button>
                      )
                    ) : null}
                    {!isEmployee ? (
                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteCategory(category.id) }} className="p-2.5 rounded-lg shadow-sm border border-white/20" style={{ background: COLORS.bgWhite, color: COLORS.pink600 }}><Trash2 className="w-5 h-5" /></button>
                    ) : null}
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
                    <div className="mb-4 flex gap-2 flex-wrap">
                      <button type="button" onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ background: currentItemView === "active" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "active" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "active" ? COLORS.primary : COLORS.border }}>To do ({(category.items || []).length})</button>
                      {!isEmployee ? (
                        <button type="button" onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ background: currentItemView === "archived" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "archived" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "archived" ? COLORS.primary : COLORS.border }}>Archived ({(category.archivedItems || []).length})</button>
                      ) : null}
                      <button type="button" onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "completed" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ background: currentItemView === "completed" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "completed" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "completed" ? COLORS.primary : COLORS.border }}>Done ({(category.completedItems || []).length})</button>
                      {!isEmployee ? (
                        <button type="button" onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "highlighted" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ background: currentItemView === "highlighted" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "highlighted" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "highlighted" ? COLORS.primary : COLORS.border }}>Starred ({(category.highlightedItems || []).length})</button>
                      ) : null}
                    </div>

                    {addingItemToCategory === category.id && currentItemView === "active" && (
                      <div className="mb-5 p-5 rounded-xl shadow-sm" style={{ background: COLORS.bgGray, border: `2px dashed ${COLORS.border}` }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {formFields.map((field) => (
                            <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                                {field.label}
                                {field.required ? " *" : ""}
                              </label>
                              {renderInputField(field)}
                            </div>
                          ))}
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
                            <button type="button" className="cursor-move hover:bg-gray-50 h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200"><GripVertical className="w-5 h-5" style={{ color: "#9CA3AF" }} /></button>
                            <div className="flex-1 min-w-0">
                              <Link href={`/task/${moduleSlug}/${item.id}?back=${encodeURIComponent(itemHrefPrefix)}`} className="font-semibold hover:underline text-lg" style={{ color: COLORS.textPrimary }}>{getItemTitle(item)}</Link>
                              <div className="flex gap-4 text-sm mt-1.5 flex-wrap" style={{ color: COLORS.textSecondary }}>
                                {displayKeys.map((key) => (
                                  <span key={key}>
                                    <span className="font-medium">{key}:</span> {String(item?.[key] ?? "-")}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {isEmployee ? (
                                <>
                                  <div className="flex items-center gap-1 mr-2">
                                    <button
                                      type="button"
                                      onClick={() => updateItem(item.id, { approved: !item.approved }, "approve")}
                                      className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200"
                                      style={{ color: item.approved ? "#22C55E" : "#D1D5DB" }}
                                      title={item.approved ? "Reopen" : "Mark done"}
                                    >
                                      <Check className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                  <div className="flex items-center gap-1">
                                    <Link href={`${itemHrefPrefix}/${item.id}/edit`}><button type="button" className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#3B82F6" }} title="Edit"><Edit className="w-5 h-5" /></button></Link>
                                    <button type="button" onClick={() => downloadItem(item)} disabled={loadingAction === `download-${item.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#3B82F6", opacity: loadingAction === `download-${item.id}` ? 0.6 : 1 }} title="Download"><Download className="w-5 h-5" /></button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1 mr-2">
                                    <button type="button" onClick={() => updateItem(item.id, { highlighted: !item.highlighted }, "highlight")} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: item.highlighted ? "#EAB308" : "#D1D5DB" }}><Star className={`w-5 h-5 ${item.highlighted ? "fill-current" : ""}`} /></button>
                                    <button type="button" onClick={() => updateItem(item.id, { approved: !item.approved }, "approve")} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: item.approved ? "#22C55E" : "#D1D5DB" }} title={item.approved ? "Mark as Incomplete" : "Mark as Completed"}><Check className="w-5 h-5" /></button>
                                    <button type="button" onClick={() => updateItem(item.id, { paused: !item.paused }, "pause")} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: item.paused ? "#F59E0B" : "#D1D5DB" }}><Pause className="w-5 h-5" /></button>
                                  </div>
                                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                  <div className="flex items-center gap-1">
                                    <Link href={`${itemHrefPrefix}/${item.id}/edit`}><button type="button" className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#3B82F6" }}><Edit className="w-5 h-5" /></button></Link>
                                    <button type="button" onClick={() => copyItem(category.id, item)} disabled={loadingAction === `copy-${item.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#6B7280", opacity: loadingAction === `copy-${item.id}` ? 0.6 : 1 }}><Copy className="w-5 h-5" /></button>
                                    <button type="button" onClick={() => downloadItem(item)} disabled={loadingAction === `download-${item.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#3B82F6", opacity: loadingAction === `download-${item.id}` ? 0.6 : 1 }}><Download className="w-5 h-5" /></button>
                                    {!isViewingArchivedItems ? (
                                      <button type="button" onClick={() => updateItem(item.id, { archived: true, isArchived: true }, "archive")} disabled={loadingAction === `archive-${item.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#F97316" }}><Archive className="w-5 h-5" /></button>
                                    ) : (
                                      <button type="button" onClick={() => updateItem(item.id, { archived: false, isArchived: false }, "unarchive")} disabled={loadingAction === `unarchive-${item.id}`} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#22C55E" }}><Archive className="w-5 h-5" /></button>
                                    )}
                                    <button type="button" onClick={() => deleteItem(item.id)} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-200" style={{ color: "#F97316" }}><Trash2 className="w-5 h-5" /></button>
                                  </div>
                                </>
                              )}
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

        {showAskMe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)" }}>
            <div className="w-full max-w-3xl max-h-[88vh] rounded-2xl shadow-xl overflow-hidden" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
              <div className="p-5 border-b flex items-center justify-between sticky top-0 z-10" style={{ borderColor: COLORS.border, background: COLORS.bgWhite }}>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" style={{ color: COLORS.primary }} />
                  <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                    {title} AI Assistant
                  </h3>
                </div>
                <button onClick={() => setShowAskMe(false)} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: COLORS.bgGray, color: COLORS.textPrimary }}>
                  Close
                </button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(88vh-72px)]">
                <div className="rounded-xl p-3" style={{ background: COLORS.bgGray, border: `1px solid ${COLORS.border}` }}>
                  <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                    Tip: Select a category for focused summary, or keep "All Categories" for a complete overview.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                      Select Category
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                    >
                      <option value="">All Categories</option>
                      {allCategoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                      Select {itemLabel}
                    </label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                    >
                      <option value="">Select {itemLabel.toLowerCase()}...</option>
                      {filteredItemsForAi.map((item: any) => (
                        <option key={item.id} value={item.id}>
                          {getItemTitle(item)} - {item.categoryTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                    Ask Question (optional)
                  </label>
                  <textarea
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder={`Example: summarize this ${itemLabel.toLowerCase()} and key actions`}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSummarizeAllTasks} disabled={aiLoading} className="px-5 py-2.5 rounded-lg font-medium" style={{ background: COLORS.primaryGradient, color: COLORS.textWhite, opacity: aiLoading ? 0.7 : 1 }}>
                    {aiLoading
                      ? "Generating..."
                      : selectedCategoryId
                        ? "Generate Summary (Selected Category)"
                        : "Generate Summary (All Tasks)"}
                  </button>
                  <button onClick={handleAskSelectedTask} disabled={aiLoading} className="px-5 py-2.5 rounded-lg font-medium" style={{ background: COLORS.bgWhite, color: COLORS.primary, border: `1px solid ${COLORS.primary}`, opacity: aiLoading ? 0.7 : 1 }}>
                    Ask Selected {itemLabel}
                  </button>
                  <button onClick={() => { setAiQuestion(""); setAiReply("") }} className="px-5 py-2.5 rounded-lg font-medium" style={{ background: COLORS.bgGray, color: COLORS.textPrimary }}>
                    Clear
                  </button>
                </div>

                {aiReply && (
                  <div className="mt-2 rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}`, background: COLORS.bgGray }}>
                    <div className="px-4 py-2.5 border-b text-sm font-medium" style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}>
                      {selectedCategoryId ? "Selected Category Summary" : "All Categories Summary"}
                    </div>
                    <div className="p-4 overflow-y-auto space-y-3" style={{ maxHeight: "320px" }}>
                      {parsedAiRows.map((line, index) => {
                        const row = parseAiRow(line)
                        return (
                          <div key={`${row.title}-${index}`} className="rounded-lg p-3" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
                            <div className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                              {index + 1}. {row.title || `Entry ${index + 1}`}
                            </div>
                            {row.details.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {row.details.map((detail, detailIndex) => (
                                  <span
                                    key={`${detail}-${detailIndex}`}
                                    className="px-2.5 py-1 rounded-md text-xs"
                                    style={{ background: COLORS.bgGray, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}
                                  >
                                    {detail}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

