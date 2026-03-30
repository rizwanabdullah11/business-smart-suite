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
  Bot,
  type LucideIcon,
} from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useAuth } from "@/contexts/auth-context"
import { readModulePageCache, writeModulePageCache } from "@/lib/client/module-page-cache"

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
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({})
  const [showAskMe, setShowAskMe] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedItemId, setSelectedItemId] = useState("")
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiReply, setAiReply] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const effectiveCategoryType = categoryType || moduleSlug
  const cacheKey = `${moduleSlug}:${effectiveCategoryType}`

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
    const cached = readModulePageCache(cacheKey)
    if (cached) {
      setCategories(cached.categories)
      setArchivedCategories(cached.archivedCategories)
      setCategoryItemView(cached.categoryItemView)
      setExpandedCategories(cached.expandedCategories || [])
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when role resolves
  }, [cacheKey, isEmployee, moduleSlug, effectiveCategoryType])

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

      const [catRes, archivedCatRes, itemsRes, archivedRes] = await Promise.all([
        fetch(`/api/categories?type=${effectiveCategoryType}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }),
        !isEmployee
          ? fetch(`/api/categories?type=${effectiveCategoryType}&archived=true`, {
              credentials: "include",
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
        fetch(`/api/${moduleSlug}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }),
        !isEmployee
          ? fetch(`/api/${moduleSlug}/archived/all`, {
              credentials: "include",
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ])
      const activeCategoriesData = await catRes.json()
      const archivedCategoriesData = archivedCatRes && archivedCatRes.ok ? await archivedCatRes.json() : []
      const categoryMap = new Map<string, any>()
      ;[...(Array.isArray(activeCategoriesData) ? activeCategoriesData : []), ...(Array.isArray(archivedCategoriesData) ? archivedCategoriesData : [])]
        .forEach((cat: any) => {
          if (cat?._id) categoryMap.set(String(cat._id), cat)
        })
      const categoriesData = Array.from(categoryMap.values())

      const itemsData = await itemsRes.json()
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
      setExpandedCategories(() => {
        const nextExpanded: string[] = []
        writeModulePageCache(cacheKey, {
          categories: merged,
          archivedCategories: mergedArchived,
          categoryItemView,
          expandedCategories: nextExpanded,
        })
        return nextExpanded
      })
      setCategoryItemView((prev) => {
        const next = { ...prev }
        allCategories.forEach((cat: any) => {
          if (!next[cat.id]) next[cat.id] = "active"
        })
        writeModulePageCache(cacheKey, {
          categories: merged,
          archivedCategories: mergedArchived,
          categoryItemView: next,
          expandedCategories,
        })
        return next
      })
    } catch (err) {
      console.error("Error loading module data:", err)
    }
  }

  useEffect(() => {
    writeModulePageCache(cacheKey, {
      categories,
      archivedCategories,
      categoryItemView,
      expandedCategories,
    })
  }, [archivedCategories, cacheKey, categories, categoryItemView, expandedCategories])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => (prev.includes(categoryId) ? [] : [categoryId]))
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

  const fieldLabelMap = Object.fromEntries(formFields.map((f) => [f.key, f.label]))

  const formatDisplayDate = (value?: string) => {
    if (!value) return "—"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString("en-GB")
  }

  const getItemStatusTone = (item: any) => {
    if (item.paused) return { label: "Paused", bg: "#fffaf3", color: "#c2410c", border: "#fed7aa" }
    if (item.approved) return { label: "Done", bg: "#f4fcf6", color: "#047857", border: "#a7f3d0" }
    if (item.highlighted) return { label: "Starred", bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" }
    return { label: "Active", bg: "#f8fafc", color: "#475569", border: "#e2e8f0" }
  }

  const visibleCategories = showArchived ? archivedCategories : categories

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#f7f8fb 0%,#f3f5f9 100%)" }}>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe" }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>{title}</h1>
              </div>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>{description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEmployee ? (
              <button type="button" onClick={() => setShowAddCategory(!showAddCategory)} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
                <Plus className="h-4 w-4" /> Add Category
              </button>
            ) : null}
            {!isEmployee ? (
              <button type="button" onClick={() => setShowArchived(!showArchived)} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
                <Archive className="h-4 w-4" /> {showArchived ? "Show Active" : "Show Archived"}
              </button>
            ) : null}
            {!isEmployee ? (
              <button type="button" onClick={() => { const firstCategoryId = allCategoryOptions[0]?.id || ""; setSelectedCategoryId(firstCategoryId); const firstItem = allItemsForAi.find((i: any) => i.categoryId === firstCategoryId) || allItemsForAi[0]; setSelectedItemId(firstItem?.id || ""); setAiQuestion(""); setAiReply(""); setShowAskMe(true) }} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>
                <Bot className="h-4 w-4" /> Ask Me
              </button>
            ) : null}
            <Link href={newItemHref}>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ background: "#111827", color: "#fff", border: "1px solid #111827" }}>
                <Plus className="h-4 w-4" /> Add New
              </button>
            </Link>
          </div>
        </div>

        {/* ── Add Category Form ── */}
        {showAddCategory && !isEmployee && (
          <div className="mb-5 rounded-2xl p-5 shadow-sm" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>Create New Category</h3>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>Add a new group to keep related items together.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="text" value={newCategoryTitle} onChange={(e) => setNewCategoryTitle(e.target.value)} placeholder="Enter category name" className="flex-1 rounded-xl px-4 py-3 outline-none focus:ring-2" style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} onKeyDown={(e) => e.key === "Enter" && addCategory()} />
              <button onClick={addCategory} className="rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: "#111827", color: "#fff" }}>Create</button>
              <button onClick={() => { setShowAddCategory(false); setNewCategoryTitle("") }} className="rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── Tabs + Sort ── */}
        {!isEmployee ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl p-1" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
              <button type="button" onClick={() => setShowArchived(false)} className="rounded-lg px-4 py-2 text-sm font-semibold transition-all" style={{ background: !showArchived ? COLORS.purple700 : "transparent", color: !showArchived ? COLORS.textWhite : COLORS.textSecondary }}>Active</button>
              <button type="button" onClick={() => setShowArchived(true)} className="rounded-lg px-4 py-2 text-sm font-semibold transition-all" style={{ background: showArchived ? COLORS.purple700 : "transparent", color: showArchived ? COLORS.textWhite : COLORS.textSecondary }}>Archived</button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span style={{ color: COLORS.textSecondary }}>Sort by</span>
              <button type="button" onClick={() => { setSortType("name"); setSortDirection((d) => sortType === "name" ? (d === "asc" ? "desc" : "asc") : "asc") }} className="rounded-lg px-3 py-2 font-semibold" style={{ background: sortType === "name" ? COLORS.purple50 : COLORS.bgWhite, color: sortType === "name" ? COLORS.purple700 : COLORS.textPrimary, border: `1px solid ${sortType === "name" ? COLORS.purple200 : COLORS.border}` }}>
                Name {sortType === "name" ? (sortDirection === "asc" ? "A-Z" : "Z-A") : ""}
              </button>
              <button type="button" onClick={() => { setSortType("date"); setSortDirection((d) => sortType === "date" ? (d === "asc" ? "desc" : "asc") : "asc") }} className="rounded-lg px-3 py-2 font-semibold" style={{ background: sortType === "date" ? COLORS.purple50 : COLORS.bgWhite, color: sortType === "date" ? COLORS.purple700 : COLORS.textPrimary, border: `1px solid ${sortType === "date" ? COLORS.purple200 : COLORS.border}` }}>
                Date {sortType === "date" ? (sortDirection === "asc" ? "Old-New" : "New-Old") : ""}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-5 flex justify-end">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span style={{ color: COLORS.textSecondary }}>Sort by</span>
              <button type="button" onClick={() => setSortType("name")} className="rounded-lg px-3 py-2 font-semibold" style={{ background: sortType === "name" ? COLORS.purple50 : COLORS.bgWhite, color: sortType === "name" ? COLORS.purple700 : COLORS.textPrimary, border: `1px solid ${sortType === "name" ? COLORS.purple200 : COLORS.border}` }}>Name</button>
              <button type="button" onClick={() => setSortType("date")} className="rounded-lg px-3 py-2 font-semibold" style={{ background: sortType === "date" ? COLORS.purple50 : COLORS.bgWhite, color: sortType === "date" ? COLORS.purple700 : COLORS.textPrimary, border: `1px solid ${sortType === "date" ? COLORS.purple200 : COLORS.border}` }}>Date</button>
            </div>
          </div>
        )}

        {/* ── Category List ── */}
        <div className="space-y-4">
          {visibleCategories.map((category) => {
            const currentItemView = categoryItemView[category.id] ?? "active"
            const currentItems = currentItemView === "archived" ? (category.archivedItems || []) : currentItemView === "completed" ? (category.completedItems || []) : currentItemView === "highlighted" ? (category.highlightedItems || []) : (category.items || [])
            const sortedItems = sortItems(currentItems)
            const isViewingArchivedItems = currentItemView === "archived"
            const isExpanded = expandedCategories.includes(category.id)

            return (
              <div key={category.id} className="overflow-hidden rounded-2xl" style={{ background: COLORS.bgWhite, border: "1px solid #ececf3", boxShadow: "0 10px 30px rgba(31,41,55,0.05)" }}>

                {/* Category Header */}
                <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ background: "#341746", color: "#fff" }}>
                  <button type="button" onClick={() => toggleCategory(category.id)} className="flex items-center gap-3 text-left">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,0.14)" }}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-base font-semibold">{category.title}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{currentItems.length} {itemLabel.toLowerCase()}{currentItems.length === 1 ? "" : "s"} in view</div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <div className="mr-1 flex h-7 w-5 items-center justify-center opacity-50">
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><circle cx="3" cy="2" r="1.5"/><circle cx="9" cy="2" r="1.5"/><circle cx="3" cy="7" r="1.5"/><circle cx="9" cy="7" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="9" cy="12" r="1.5"/></svg>
                    </div>
                    <div className="h-6 w-6 rounded" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.4)" }} />
                    {!isEmployee ? (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setEditingCategory(category.id); setEditTitle(category.title) }} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#22c55e" }} title="Edit Category">
                        <Edit className="h-3.5 w-3.5 text-white" />
                      </button>
                    ) : null}
                    {!showArchived ? (
                      <button type="button" onClick={(e) => { e.stopPropagation(); if (isViewingArchivedItems) setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" })); setAddingItemToCategory(category.id); if (!expandedCategories.includes(category.id)) setExpandedCategories([category.id]) }} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#22c55e" }} title="Add Item">
                        <Plus className="h-3.5 w-3.5 text-white" />
                      </button>
                    ) : null}
                    {!isEmployee ? (
                      showArchived ? (
                        <button type="button" onClick={(e) => { e.stopPropagation(); unarchiveCategory(category.id) }} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#f59e0b" }} title="Unarchive Category">
                          <Archive className="h-3.5 w-3.5 text-white" />
                        </button>
                      ) : (
                        <button type="button" onClick={(e) => { e.stopPropagation(); archiveCategory(category.id) }} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#f59e0b" }} title="Archive Category">
                          <Archive className="h-3.5 w-3.5 text-white" />
                        </button>
                      )
                    ) : null}
                    {!isEmployee ? (
                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteCategory(category.id) }} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#ef4444" }} title="Delete Category">
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Edit Category */}
                {editingCategory === category.id && (
                  <div className="border-b px-4 py-4" style={{ background: COLORS.bgGrayLight, borderColor: COLORS.border }}>
                    <div className="mb-3 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>Rename Category</div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="flex-1 rounded-xl px-4 py-3 outline-none transition-all focus:ring-2" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }} onKeyDown={(e) => e.key === "Enter" && saveEditCategory(category.id)} autoFocus />
                      <button onClick={() => saveEditCategory(category.id)} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: COLORS.purple700, color: COLORS.textWhite }}><Check className="h-4 w-4" />Save</button>
                      <button onClick={() => { setEditingCategory(null); setEditTitle("") }} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}><X className="h-4 w-4" />Cancel</button>
                    </div>
                  </div>
                )}

                {/* Expanded Body */}
                {isExpanded ? (
                  <div className="p-4 sm:p-5">

                    {/* Sub-tabs + count */}
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {(["active","archived","completed","highlighted"] as const).filter((v) => v !== "archived" || !isEmployee).filter((v) => v !== "highlighted" || !isEmployee).map((view) => {
                          const count = view === "archived" ? (category.archivedItems || []).length : view === "completed" ? (category.completedItems || []).length : view === "highlighted" ? (category.highlightedItems || []).length : (category.items || []).length
                          const label = view === "archived" ? "Archived" : view === "completed" ? "Done" : view === "highlighted" ? "Starred" : "Active"
                          return (
                            <button key={view} type="button" onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: view }))} className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: currentItemView === view ? "#faf5ff" : COLORS.bgWhite, color: currentItemView === view ? COLORS.purple700 : COLORS.textSecondary, border: `1px solid ${currentItemView === view ? COLORS.purple200 : "#ececf3"}` }}>
                              {label} ({count})
                            </button>
                          )
                        })}
                      </div>
                      <div className="text-xs sm:text-sm" style={{ color: COLORS.textSecondary }}>Showing {sortedItems.length} result{sortedItems.length === 1 ? "" : "s"}</div>
                    </div>

                    {/* Add Item Form */}
                    {addingItemToCategory === category.id && currentItemView === "active" ? (
                      <div className="mb-5 rounded-2xl p-5" style={{ background: COLORS.bgGrayLight, border: `1px dashed ${COLORS.borderHover}` }}>
                        <div className="mb-4">
                          <h3 className="text-base font-semibold" style={{ color: COLORS.textPrimary }}>Add New {itemLabel}</h3>
                          <p className="text-sm" style={{ color: COLORS.textSecondary }}>Create a new entry in this category.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {formFields.map((field) => (
                            <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                              <label className="mb-2 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{field.label}{field.required ? " *" : ""}</label>
                              {renderInputField(field)}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button onClick={() => addItemToCategory(category.id)} className="rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: "#111827", color: "#fff" }}>Add {itemLabel}</button>
                          <button onClick={() => setAddingItemToCategory(null)} className="rounded-xl px-5 py-3 text-sm font-semibold" style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}>Cancel</button>
                        </div>
                      </div>
                    ) : null}

                    {/* Empty State */}
                    {sortedItems.length === 0 ? (
                      <div className="rounded-2xl px-6 py-12 text-center" style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}` }}>
                        <Icon className="mx-auto mb-3 h-10 w-10" style={{ color: COLORS.textLight }} />
                        <div className="mb-1 text-base font-semibold" style={{ color: COLORS.textPrimary }}>
                          {isViewingArchivedItems ? `No archived ${itemLabel.toLowerCase()}s` : currentItemView === "completed" ? `No completed ${itemLabel.toLowerCase()}s` : currentItemView === "highlighted" ? `No starred ${itemLabel.toLowerCase()}s` : `No ${itemLabel.toLowerCase()}s in this category`}
                        </div>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>Use the + button to add the first one.</p>
                      </div>
                    ) : (
                      /* Table */
                      <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid #efeff5", background: "#fcfcff" }}>
                        <div className="overflow-x-auto p-3">
                          <table className="min-w-full text-left">
                            <thead style={{ background: "#fff" }}>
                              <tr style={{ color: "#707685" }}>
                                <th className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wide">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded cursor-pointer"
                                    checked={sortedItems.length > 0 && sortedItems.every((i: any) => selectedItems[category.id]?.has(i.id))}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItems((prev) => ({ ...prev, [category.id]: new Set(sortedItems.map((i: any) => i.id)) }))
                                      } else {
                                        setSelectedItems((prev) => ({ ...prev, [category.id]: new Set() }))
                                      }
                                    }}
                                  />
                                </th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">{itemLabel}</th>
                                {displayKeys.map((key) => (
                                  <th key={key} className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">{fieldLabelMap[key] || key}</th>
                                ))}
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Status</th>
                                <th className="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wide">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedItems.map((item: any, index: number) => {
                                const statusTone = getItemStatusTone(item)
                                return (
                                  <tr key={item.id} style={{ background: item.paused ? "#fffaf2" : item.highlighted ? "#faf7ff" : "#fff", borderTop: index === 0 ? "none" : "1px solid #efeff5", borderBottom: index === sortedItems.length - 1 ? "1px solid #efeff5" : "none" }}>
                                    <td className="px-2 py-1 align-top">
                                      <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 rounded cursor-pointer"
                                        checked={selectedItems[category.id]?.has(item.id) ?? false}
                                        onChange={(e) => {
                                          setSelectedItems((prev) => {
                                            const current = new Set(prev[category.id] ?? [])
                                            if (e.target.checked) current.add(item.id)
                                            else current.delete(item.id)
                                            return { ...prev, [category.id]: current }
                                          })
                                        }}
                                      />
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                      <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "#faf5ff", color: COLORS.purple700, border: `1px solid ${COLORS.purple200}` }}>
                                          <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <Link href={`/task/${moduleSlug}/${item.id}?back=${encodeURIComponent(itemHrefPrefix)}`} className="block text-sm font-semibold hover:underline sm:text-[15px] break-words" style={{ color: COLORS.purple700 }}>
                                            {getItemTitle(item)}
                                          </Link>
                                          {item.fileName ? (
                                            <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#73788a" }}>
                                              <Icon className="h-3 w-3 shrink-0" style={{ color: COLORS.purple700 }} />
                                              <span className="max-w-[160px] truncate" title={item.fileName}>{item.fileName}</span>
                                            </div>
                                          ) : null}
                                          {(item.highlighted || item.paused) ? (
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: "#73788a" }}>
                                              {item.highlighted ? <span>Starred</span> : null}
                                              {item.paused ? <span>Paused</span> : null}
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    </td>
                                    {displayKeys.map((key) => (
                                      <td key={key} className="px-2 py-1 align-top text-sm" style={{ color: COLORS.textPrimary }}>
                                        {key.toLowerCase().includes("date") ? (
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" style={{ color: COLORS.textLight }} />
                                            {formatDisplayDate(item?.[key])}
                                          </div>
                                        ) : (
                                          String(item?.[key] ?? "—")
                                        )}
                                      </td>
                                    ))}
                                    <td className="px-2 py-1 align-top">
                                      <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: statusTone.bg, color: statusTone.color, border: `1px solid ${statusTone.border}` }}>{statusTone.label}</span>
                                    </td>
                                    <td className="px-2 py-1">
                                      <div className="flex items-center justify-end gap-1">
                                        <div className="mr-1 flex h-6 w-5 cursor-move items-center justify-center opacity-30 hover:opacity-60">
                                          <svg width="10" height="14" viewBox="0 0 10 14" fill="#374151"><circle cx="2.5" cy="2" r="1.5"/><circle cx="7.5" cy="2" r="1.5"/><circle cx="2.5" cy="7" r="1.5"/><circle cx="7.5" cy="7" r="1.5"/><circle cx="2.5" cy="12" r="1.5"/><circle cx="7.5" cy="12" r="1.5"/></svg>
                                        </div>
                                        {isEmployee ? (
                                          <>
                                            <button type="button" onClick={() => updateItem(item.id, { approved: !item.approved }, "approve")} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#22c55e" }} title={item.approved ? "Reopen" : "Mark done"}><Check className="h-3.5 w-3.5 text-white" /></button>
                                            <Link href={`${itemHrefPrefix}/${item.id}/edit`}><button type="button" className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#4f46e5" }} title="Edit"><Edit className="h-3.5 w-3.5 text-white" /></button></Link>
                                            <button type="button" onClick={() => downloadItem(item)} disabled={loadingAction === `download-${item.id}`} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:opacity-50" style={{ background: "#6366f1" }} title="Download"><Download className="h-3.5 w-3.5 text-white" /></button>
                                          </>
                                        ) : (
                                          <>
                                            <button type="button" onClick={() => updateItem(item.id, { highlighted: !item.highlighted }, "highlight")} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#f59e0b" }} title={item.highlighted ? "Remove Highlight" : "Highlight"}><Star className={`h-3.5 w-3.5 text-white ${item.highlighted ? "fill-white" : ""}`} /></button>
                                            <button type="button" onClick={() => updateItem(item.id, { approved: !item.approved }, "approve")} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#22c55e" }} title={item.approved ? "Mark as Incomplete" : "Mark as Completed"}><Check className="h-3.5 w-3.5 text-white" /></button>
                                            <button type="button" onClick={() => updateItem(item.id, { paused: !item.paused }, "pause")} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#f97316" }} title={item.paused ? "Resume" : "Pause"}><Pause className="h-3.5 w-3.5 text-white" /></button>
                                            <Link href={`${itemHrefPrefix}/${item.id}/edit`}><button type="button" className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#4f46e5" }} title="Edit"><Edit className="h-3.5 w-3.5 text-white" /></button></Link>
                                            <button type="button" onClick={() => copyItem(category.id, item)} disabled={loadingAction === `copy-${item.id}`} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:opacity-50" style={{ background: "#6366f1" }} title="Duplicate"><Copy className="h-3.5 w-3.5 text-white" /></button>
                                            <button type="button" onClick={() => downloadItem(item)} disabled={loadingAction === `download-${item.id}`} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:opacity-50" style={{ background: "#6366f1" }} title="Download"><Download className="h-3.5 w-3.5 text-white" /></button>
                                            {!isViewingArchivedItems ? (
                                              <button type="button" onClick={() => updateItem(item.id, { archived: true, isArchived: true }, "archive")} disabled={loadingAction === `archive-${item.id}`} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:opacity-50" style={{ background: "#f59e0b" }} title="Archive"><Archive className="h-3.5 w-3.5 text-white" /></button>
                                            ) : (
                                              <button type="button" onClick={() => updateItem(item.id, { archived: false, isArchived: false }, "unarchive")} disabled={loadingAction === `unarchive-${item.id}`} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:opacity-50" style={{ background: "#22c55e" }} title="Unarchive"><Archive className="h-3.5 w-3.5 text-white" /></button>
                                            )}
                                            <button type="button" onClick={() => deleteItem(item.id)} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110" style={{ background: "#ef4444" }} title="Delete"><Trash2 className="h-3.5 w-3.5 text-white" /></button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
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

