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
  Pause,
  Calendar,
  Type,
  ArrowUpDown,
  Copy,
  Download,
  Bot,
  FileText,
  Folder,
  Printer,
  Star,
  type LucideIcon,
} from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useAuth } from "@/contexts/auth-context"
import { moduleKeyForSlug } from "@/lib/platform/plans"
import { readModulePageCache, writeModulePageCache } from "@/lib/client/module-page-cache"

type SortType = "name" | "date"
type FieldType = "text" | "number" | "date" | "textarea" | "select" | "checkbox"

type CategoryItemViewTab =
  | "active"
  | "archived"
  | "completed"
  | "highlighted"
  | "audit_nt"
  | "audit_ip"
  | "audit_done"

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
  /** REST segment when it differs from the route slug (e.g. module `manual` → `/api/manuals`). */
  apiModuleSlug?: string
  title: string
  description: string
  itemLabel: string
  icon: LucideIcon
  newItemHref: string
  itemHrefPrefix: string
  /** e.g. "/audit-schedule" → Workflow link `/audit-schedule/:id/workflow` (shown next to titles for all roles) */
  workflowHrefPrefix?: string
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
  apiModuleSlug,
  title,
  description,
  itemLabel,
  icon: Icon,
  newItemHref,
  itemHrefPrefix,
  workflowHrefPrefix,
  categoryType,
  titleFieldKey = "title",
  dateFieldKey = "issueDate",
  formFields = defaultFields,
  listFieldKeys,
}: DynamicModulePageProps) {
  const apiPath = apiModuleSlug ?? moduleSlug
  const { isEmployee, isModuleEnabled } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [archivedCategories, setArchivedCategories] = useState<any[]>([])
  const [categoryItemView, setCategoryItemView] = useState<Record<string, CategoryItemViewTab>>({})
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

  const platformKey = moduleKeyForSlug(moduleSlug)
  const moduleAllowed = !platformKey || isModuleEnabled(platformKey)
  if (!moduleAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-lg w-full rounded-2xl border bg-white p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Module not enabled</h2>
          <p className="text-sm text-gray-600">
            This module is not enabled for your subscription plan. Please contact your administrator to enable it.
          </p>
        </div>
      </div>
    )
  }
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
  }, [cacheKey, isEmployee, moduleSlug, effectiveCategoryType, apiPath])

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
        fetch(`/api/${apiPath}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }),
        !isEmployee
          ? fetch(`/api/${apiPath}/archived/all`, {
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
          if (!next[cat.id]) next[cat.id] = moduleSlug === "audit-schedule" ? "audit_nt" : "active"
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
      const response = await fetch(`/api/${apiPath}/${itemId}`, {
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
      const response = await fetch(`/api/${apiPath}/${itemId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
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

      const response = await fetch(`/api/${apiPath}`, {
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
        const response = await fetch(`/api/${apiPath}/${item.id}`, {
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
      const response = await fetch(`/api/${apiPath}`, {
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
      const response = await fetch(`/api/${apiPath}/ai`, {
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

  const isAuditSchedule = moduleSlug === "audit-schedule"

  const normalizeAuditCategoryView = (view: CategoryItemViewTab): CategoryItemViewTab => {
    if (!isAuditSchedule) return view
    if (view === "active" || view === "highlighted") return "audit_nt"
    if (view === "completed") return "audit_done"
    return view
  }

  const mergeLiveAuditItems = (category: any) => {
    const raw = [...(category.items || []), ...(category.completedItems || [])]
    const map = new Map<string, any>()
    raw.forEach((i: any) => map.set(String(i.id), i))
    return Array.from(map.values())
  }

  const filterAuditTabItems = (category: any, tabKey: string) => {
    if (tabKey === "archived") return category.archivedItems || []
    const merged = mergeLiveAuditItems(category)
    return merged.filter((item: any) => {
      const s = String(item.status ?? "Scheduled").trim()
      if (tabKey === "audit_nt") return s === "Scheduled" || s === ""
      if (tabKey === "audit_ip") return s === "In Progress"
      if (tabKey === "audit_done") return s === "Completed" || Boolean(item.approved)
      return true
    })
  }

  const formatPlannedMonthYear = (value?: string) => {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const visibleCategories = showArchived ? archivedCategories : categories

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#f7f8fb 0%,#f3f5f9 100%)" }}>
      <div className="mx-auto p-4 sm:p-6">

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: COLORS.purple50,
                color: COLORS.purple700,
                border: `1px solid ${COLORS.purple200}`,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
                {title}
              </h1>
              {description.trim() ? (
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEmployee ? (
              <button type="button" onClick={() => setShowAddCategory(!showAddCategory)} className="ui-btn ui-btn-secondary">
                <Plus className="h-4 w-4" /> Add Category
              </button>
            ) : null}
            {!isEmployee ? (
              <button
                type="button"
                onClick={() => {
                  const firstCategoryId = allCategoryOptions[0]?.id || ""
                  setSelectedCategoryId(firstCategoryId)
                  const firstItem =
                    allItemsForAi.find((i: any) => i.categoryId === firstCategoryId) || allItemsForAi[0]
                  setSelectedItemId(firstItem?.id || "")
                  setAiQuestion("")
                  setAiReply("")
                  setShowAskMe(true)
                }}
                className="ui-btn ui-btn-secondary"
              >
                <Bot className="h-4 w-4" /> Ask Me
              </button>
            ) : null}
            <Link href={newItemHref} className="ui-btn ui-btn-primary">
              <Plus className="h-4 w-4" /> Add New
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
              <button onClick={addCategory} type="button" className="ui-btn ui-btn-primary ui-btn-lg">
                Create
              </button>
              <button type="button" onClick={() => { setShowAddCategory(false); setNewCategoryTitle("") }} className="ui-btn ui-btn-secondary ui-btn-lg">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Active / Archived (category list) ── */}
        {!isEmployee ? (
          <div className="mb-5 flex min-h-[2.75rem] flex-wrap items-center gap-3">
            <div className="inline-flex gap-1 rounded-xl p-1" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
              <button
                type="button"
                onClick={() => setShowArchived(false)}
                className={!showArchived ? "ui-btn-segment-active" : "ui-btn-segment-inactive"}
              >
                Active
              </button>
              <button type="button" onClick={() => setShowArchived(true)} className={showArchived ? "ui-btn-segment-active" : "ui-btn-segment-inactive"}>
                Archived
              </button>
            </div>
          </div>
        ) : null}

        {/* ── Category List ── */}
        <div className="space-y-4">
          {visibleCategories.map((category) => {
            const rawCategoryView: CategoryItemViewTab =
              categoryItemView[category.id] ?? (isAuditSchedule ? "audit_nt" : "active")
            const currentItemView = normalizeAuditCategoryView(rawCategoryView)

            let currentItems: any[]
            if (
              isAuditSchedule &&
              (currentItemView === "audit_nt" ||
                currentItemView === "audit_ip" ||
                currentItemView === "audit_done")
            ) {
              currentItems = filterAuditTabItems(category, currentItemView)
            } else if (currentItemView === "archived") {
              currentItems = category.archivedItems || []
            } else if (currentItemView === "completed") {
              currentItems = category.completedItems || []
            } else if (currentItemView === "highlighted") {
              currentItems = category.highlightedItems || []
            } else {
              currentItems = category.items || []
            }
            const sortedItems = sortItems(currentItems)
            const isViewingArchivedItems = currentItemView === "archived"
            const isExpanded = expandedCategories.includes(category.id)

            return (
              <div key={category.id} className="mb-6 overflow-hidden rounded-xl border bg-white shadow-sm" style={{ borderColor: COLORS.border }}>

                {/* Category Header */}
                <div
                  className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5 text-white transition-[filter] hover:brightness-[1.03]"
                  style={{ background: COLORS.brandCategoryBarGradient }}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
                    <span className="truncate font-semibold tracking-tight">{category.title}</span>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {!showArchived && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSortType("name")
                            setSortDirection((d) => (sortType === "name" ? (d === "asc" ? "desc" : "asc") : "asc"))
                          }}
                          className="ui-row-action ui-row-action--copy shrink-0"
                          title="Sort by Name"
                        >
                          <ArrowUpDown className="h-3 w-3" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortType("date")
                            setSortDirection((d) => (sortType === "date" ? (d === "asc" ? "desc" : "asc") : "asc"))
                          }}
                          className="ui-row-action ui-row-action--download shrink-0"
                          title="Sort by Date"
                        >
                          <Calendar className="h-3 w-3" strokeWidth={2} />
                        </button>
                      </>
                    )}
                    
                    {!isEmployee ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCategory(category.id)
                          setEditTitle(category.title)
                        }}
                        className="ui-row-action ui-row-action--edit shrink-0"
                        title="Edit Category"
                      >
                        <Edit className="h-3 w-3" strokeWidth={2} />
                      </button>
                    ) : null}
                    {!showArchived ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isViewingArchivedItems) setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))
                          setAddingItemToCategory(category.id)
                          if (!expandedCategories.includes(category.id)) setExpandedCategories([category.id])
                        }}
                        className="ui-row-action ui-row-action--add shrink-0"
                        title="Add Item"
                      >
                        <Plus className="h-3 w-3" strokeWidth={2} />
                      </button>
                    ) : null}
                    {!isEmployee ? (
                      showArchived ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            unarchiveCategory(category.id)
                          }}
                          className="ui-row-action ui-row-action--archive shrink-0"
                          title="Unarchive Category"
                        >
                          <Archive className="h-3 w-3" strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            archiveCategory(category.id)
                          }}
                          className="ui-row-action ui-row-action--archive shrink-0"
                          title="Archive Category"
                        >
                          <Archive className="h-3 w-3" strokeWidth={2} />
                        </button>
                      )
                    ) : null}
                    {!isEmployee ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCategory(category.id)
                        }}
                        className="ui-row-action ui-row-action--destructive shrink-0"
                        title="Delete Category"
                      >
                        <X className="h-3 w-3" strokeWidth={2.25} />
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
                      <button type="button" onClick={() => saveEditCategory(category.id)} className="ui-btn ui-btn-primary ui-btn-lg">
                        <Check className="h-4 w-4" />
                        Save
                      </button>
                      <button type="button" onClick={() => { setEditingCategory(null); setEditTitle("") }} className="ui-btn ui-btn-secondary ui-btn-lg">
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded Body */}
                {isExpanded ? (
                  <div className="border-t bg-white px-4 py-5 sm:px-5">

                    {/* Sub-tabs + count */}
                    <div className="mb-5 flex min-h-[2.75rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {isAuditSchedule ? (
                          <>
                            {(
                              [
                                { view: "audit_nt" as const, label: "Audits not yet started" },
                                { view: "audit_ip" as const, label: "Audits currently in progress" },
                                { view: "audit_done" as const, label: "Completed Audits" },
                              ] as const
                            ).map(({ view, label }) => {
                              const count = filterAuditTabItems(category, view).length
                              const active = currentItemView === view
                              return (
                                <button
                                  key={view}
                                  type="button"
                                  onClick={() =>
                                    setCategoryItemView((prev) => ({ ...prev, [category.id]: view }))
                                  }
                                  className={active ? "ui-btn-audit-active" : "ui-btn-audit-idle"}
                                >
                                  {label}
                                  <span className={active ? " ml-1.5 opacity-90" : " ml-1.5 opacity-70"}>({count})</span>
                                </button>
                              )
                            })}
                            {!isEmployee ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))
                                }
                                className={currentItemView === "archived" ? "ui-btn-audit-active" : "ui-btn-audit-idle"}
                              >
                                Archived
                                <span
                                  className={
                                    currentItemView === "archived" ? " ml-1.5 opacity-90" : " ml-1.5 opacity-70"
                                  }
                                >
                                  ({category.archivedItems?.length ?? 0})
                                </span>
                              </button>
                            ) : null}
                          </>
                        ) : (
                          (["active", "archived", "completed", "highlighted"] as const)
                            .filter((v) => v !== "archived" || !isEmployee)
                            .filter((v) => v !== "highlighted" || !isEmployee)
                            .map((view) => {
                              const count =
                                view === "archived"
                                  ? (category.archivedItems || []).length
                                  : view === "completed"
                                    ? (category.completedItems || []).length
                                    : view === "highlighted"
                                      ? (category.highlightedItems || []).length
                                      : (category.items || []).length
                              const label =
                                view === "archived"
                                  ? "Archived"
                                  : view === "completed"
                                    ? "Done"
                                    : view === "highlighted"
                                      ? "Starred"
                                      : "Active"
                              return (
                                <button
                                  key={view}
                                  type="button"
                                  onClick={() =>
                                    setCategoryItemView((prev) => ({ ...prev, [category.id]: view }))
                                  }
                                  className={currentItemView === view ? "ui-btn-pill-on" : "ui-btn-pill-off"}
                                >
                                  {label} ({count})
                                </button>
                              )
                            })
                        )}
                      </div>
                      <div className="text-xs sm:text-sm flex items-center whitespace-nowrap tabular-nums" style={{ color: COLORS.textSecondary }}>
                        Showing {sortedItems.length} result{sortedItems.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    {/* Add Item Form */}
                    {addingItemToCategory === category.id &&
                    (isAuditSchedule ? currentItemView !== "archived" : currentItemView === "active") ? (
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
                          <button type="button" onClick={() => addItemToCategory(category.id)} className="ui-btn ui-btn-primary ui-btn-lg">
                            Add {itemLabel}
                          </button>
                          <button type="button" onClick={() => setAddingItemToCategory(null)} className="ui-btn ui-btn-secondary ui-btn-lg">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Empty State */}
                    {sortedItems.length === 0 ? (
                      <div
                        className="rounded-2xl px-6 py-12 text-center"
                        style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}` }}
                      >
                        <Icon className="mx-auto mb-3 h-10 w-10" style={{ color: COLORS.textLight }} />
                        <div className="mb-1 text-base font-semibold" style={{ color: COLORS.textPrimary }}>
                          {isViewingArchivedItems
                            ? `No archived ${itemLabel.toLowerCase()}s`
                            : isAuditSchedule
                              ? "No audits match this tab."
                              : currentItemView === "completed"
                                ? `No completed ${itemLabel.toLowerCase()}s`
                                : currentItemView === "highlighted"
                                  ? `No starred ${itemLabel.toLowerCase()}s`
                                  : `No ${itemLabel.toLowerCase()}s in this category`}
                        </div>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {isAuditSchedule
                            ? "Use the + button in the category bar to add an audit, or switch to another tab."
                            : "Use the + button to add the first one."}
                        </p>
                      </div>
                    ) : isAuditSchedule ? (
                      <>
                        {!isEmployee ? (
                          <div className="mb-4 flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              title="Print list"
                              onClick={() => window.print()}
                              className="ui-row-action ui-row-action--archive ui-row-action--lg"
                            >
                              <Printer className="h-3 w-3" aria-hidden />
                            </button>
                            <button
                              type="button"
                              title="Export (use print to PDF)"
                              onClick={() => window.print()}
                              className="ui-row-action ui-row-action--download ui-row-action--lg"
                            >
                              <Download className="h-3 w-3" aria-hidden />
                            </button>
                            <button type="button" title="Table view" className="ui-row-action ui-row-action--edit ui-row-action--active ui-row-action--lg">
                              <Type className="h-3 w-3" aria-hidden />
                            </button>
                          </div>
                        ) : null}
                        <div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-left text-[0.9375rem]">
                              <thead>
                                <tr className="border-b-2 border-slate-800 bg-white">
                                  <th
                                    scope="col"
                                    className="w-14 px-3 py-4 text-center text-[0.65rem] font-bold uppercase tracking-wider text-slate-600"
                                  >
                                    <span className="sr-only">Record</span>
                                    <FileText className="mx-auto h-4 w-4 text-slate-500" aria-hidden />
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                                  >
                                    Title
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-600"
                                  >
                                    Planned start
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                                  >
                                    Actual start
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                                  >
                                    Auditor
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-4 text-xs font-bold uppercase tracking-wide text-slate-600"
                                  >
                                    Follow up
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-3 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-600"
                                  >
                                    Completed
                                  </th>
                                  <th
                                    scope="col"
                                    className="w-[8.5rem] px-3 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-600"
                                  >
                                    &nbsp;
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortedItems.map((item: any) => {
                                  const planned = item?.[dateFieldKey]
                                  const actualRaw = item?.actualStart ?? item?.actualStartedAt ?? item?.actualStartDate
                                  const followRaw = item?.followUp ?? item?.followUpDate
                                  const done =
                                    Boolean(item.approved) || String(item.status ?? "").trim() === "Completed"
                                  return (
                                    <tr
                                      key={item.id}
                                      className="border-b border-slate-200 transition-colors hover:bg-slate-50/80"
                                    >
                                      <td className="px-3 py-4 text-center align-middle">
                                        <FileText className="mx-auto h-5 w-5 text-slate-400" aria-hidden />
                                      </td>
                                      <td className="px-4 py-4 align-middle font-medium text-slate-800">
                                        <div className="flex flex-col gap-1">
                                          <Link
                                            href={`${itemHrefPrefix}/${item.id}`}
                                            className="text-[0.9375rem] font-semibold text-slate-900 hover:underline"
                                          >
                                            {getItemTitle(item)}
                                          </Link>
                                          {workflowHrefPrefix ? (
                                            <Link
                                              href={`${workflowHrefPrefix}/${item.id}/workflow`}
                                              className="text-xs font-semibold text-violet-600 hover:underline"
                                            >
                                              Workflow
                                            </Link>
                                          ) : null}
                                        </div>
                                      </td>
                                      <td className="px-3 py-4 text-center align-middle">
                                        {planned ? (
                                          <span className="inline-flex min-h-[2.25rem] min-w-[5.75rem] items-center justify-center rounded bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm">
                                            {formatPlannedMonthYear(planned)}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">—</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-4 align-middle text-slate-700">
                                        {actualRaw
                                          ? String(actualRaw).includes("T") || String(actualRaw).match(/^\d{4}-\d{2}-\d{2}$/)
                                            ? formatDisplayDate(String(actualRaw))
                                            : String(actualRaw)
                                          : "—"}
                                      </td>
                                      <td className="px-3 py-4 align-middle text-slate-700">
                                        {String(item.auditor ?? "—")}
                                      </td>
                                      <td className="px-3 py-4 align-middle text-slate-700">
                                        {followRaw ? formatDisplayDate(String(followRaw)) : "—"}
                                      </td>
                                      <td className="px-3 py-4 text-center align-middle">
                                        {done ? (
                                          <span className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-emerald-700">
                                            <Check className="h-4 w-4 shrink-0" aria-hidden />
                                            <span className="hidden sm:inline">Yes</span>
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">—</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-4 align-middle">
                                        {!isEmployee ? (
                                          <div className="flex justify-end gap-1.5">
                                            <Link
                                              href={`${itemHrefPrefix}/${item.id}/edit`}
                                              title="Edit"
                                              className="ui-row-action ui-row-action--edit ui-row-action--lg"
                                            >
                                              <Edit className="h-3 w-3" aria-hidden />
                                            </Link>
                                            {isViewingArchivedItems ? (
                                              <button
                                                type="button"
                                                title="Restore from archive"
                                                onClick={() =>
                                                  updateItem(
                                                    item.id,
                                                    { archived: false, isArchived: false },
                                                    "unarchive"
                                                  )
                                                }
                                                disabled={loadingAction === `unarchive-${item.id}`}
                                                className="ui-row-action ui-row-action--archive ui-row-action--lg"
                                              >
                                                <Archive className="h-3 w-3" aria-hidden />
                                              </button>
                                            ) : (
                                              <Link
                                                href={`${itemHrefPrefix}/${item.id}/documents`}
                                                title="Documents"
                                                className="ui-row-action ui-row-action--files ui-row-action--lg"
                                              >
                                                <Folder className="h-3 w-3" aria-hidden />
                                              </Link>
                                            )}
                                            <button
                                              type="button"
                                              title="Delete"
                                              onClick={() => deleteItem(item.id)}
                                              className="ui-row-action ui-row-action--destructive ui-row-action--lg"
                                            >
                                              <X className="h-3 w-3 stroke-[2.5]" aria-hidden />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex justify-end">
                                            <Link
                                              href={`${itemHrefPrefix}/${item.id}`}
                                              className="text-sm font-semibold text-blue-600 hover:underline"
                                            >
                                              View
                                            </Link>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Standard module table */
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left">
                            <thead className="bg-gray-50">
                              <tr style={{ color: COLORS.textPrimary }}>
                                <th className="pl-4 pr-0 py-3 text-base font-medium">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded cursor-pointer"
                                    checked={
                                      sortedItems.length > 0 &&
                                      sortedItems.every((i: any) =>
                                        selectedItems[category.id]?.has(i.id)
                                      )
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItems((prev) => ({
                                          ...prev,
                                          [category.id]: new Set(sortedItems.map((i: any) => i.id)),
                                        }))
                                      } else {
                                        setSelectedItems((prev) => ({ ...prev, [category.id]: new Set() }))
                                      }
                                    }}
                                  />
                                </th>
                                <th className="pl-0 pr-4 py-3 text-base font-medium">{itemLabel}</th>
                                {displayKeys.slice(0, -1).map((key) => (
                                  <th key={key} className="px-4 py-3 text-base font-medium">
                                    {fieldLabelMap[key] || key}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-base font-medium">
                                  {displayKeys.length > 0
                                    ? fieldLabelMap[displayKeys[displayKeys.length - 1]] ||
                                      displayKeys[displayKeys.length - 1]
                                    : "Location"}
                                </th>
                                <th className="px-4 py-3 text-base font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sortedItems.map((item: any) => {
                                return (
                                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="pl-4 pr-0 py-3 align-middle">
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded cursor-pointer"
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
                                    <td className="pl-0 pr-4 py-3 align-middle">
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-violet-100 bg-violet-50/90"
                                          style={{ minWidth: "32px" }}
                                        >
                                          <Icon className="h-4 w-4 text-violet-700" aria-hidden />
                                        </div>
                                        <Link
                                          href={`${itemHrefPrefix}/${item.id}`}
                                          className="text-base font-medium text-slate-800 hover:text-violet-700 hover:underline"
                                        >
                                          {getItemTitle(item)}
                                        </Link>
                                        {workflowHrefPrefix ? (
                                          <Link
                                            href={`${workflowHrefPrefix}/${item.id}/workflow`}
                                            className="ml-2 text-xs font-semibold text-violet-600 hover:underline whitespace-nowrap"
                                          >
                                            Workflow
                                          </Link>
                                        ) : null}
                                      </div>
                                    </td>
                                    {displayKeys.slice(0, -1).map((key) => (
                                      <td
                                        key={key}
                                        className="px-4 py-3 align-middle text-base"
                                        style={{ color: COLORS.textPrimary }}
                                      >
                                        {key.toLowerCase().includes("date") ? (
                                          formatDisplayDate(item?.[key])
                                        ) : (
                                          String(item?.[key] ?? "—")
                                        )}
                                      </td>
                                    ))}
                                    <td
                                      className="px-4 py-3 align-middle text-base"
                                      style={{ color: COLORS.textPrimary }}
                                    >
                                      {displayKeys.length > 0
                                        ? String(item?.[displayKeys[displayKeys.length - 1]] ?? "—")
                                        : item.location || "—"}
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                      {!isEmployee && (
                                        <div className="flex flex-wrap justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateItem(item.id, { highlighted: !item.highlighted }, "highlight")
                                            }
                                            className={`ui-row-action ui-row-action--star ${item.highlighted ? "ui-row-action--active" : ""}`}
                                            title={item.highlighted ? "Remove Highlight" : "Highlight"}
                                          >
                                            <Star
                                              className="h-3 w-3"
                                              strokeWidth={2}
                                              fill={item.highlighted ? "currentColor" : "none"}
                                            />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateItem(item.id, { approved: !item.approved }, "approve")
                                            }
                                            className={`ui-row-action ui-row-action--done ${item.approved ? "ui-row-action--active" : ""}`}
                                            title={item.approved ? "Mark as Incomplete" : "Mark as Completed"}
                                          >
                                            <Check className="h-3 w-3" strokeWidth={2.5} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => updateItem(item.id, { paused: !item.paused }, "pause")}
                                            className={`ui-row-action ui-row-action--pause ${item.paused ? "ui-row-action--active" : ""}`}
                                            title={item.paused ? "Resume" : "Pause"}
                                          >
                                            <Pause className="h-3 w-3" strokeWidth={2} />
                                          </button>
                                          <Link
                                            href={`${itemHrefPrefix}/${item.id}/edit`}
                                            className="ui-row-action ui-row-action--edit"
                                            title="Edit"
                                          >
                                            <Edit className="h-3 w-3" strokeWidth={2} />
                                          </Link>
                                          <button
                                            type="button"
                                            onClick={() => copyItem(category.id, item)}
                                            disabled={loadingAction === `copy-${item.id}`}
                                            className="ui-row-action ui-row-action--copy"
                                            title="Duplicate"
                                          >
                                            <Copy className="h-3 w-3" strokeWidth={2} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => downloadItem(item)}
                                            disabled={loadingAction === `download-${item.id}`}
                                            className="ui-row-action ui-row-action--download"
                                            title="Download"
                                          >
                                            <Download className="h-3 w-3" strokeWidth={2} />
                                          </button>
                                          {!isViewingArchivedItems ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateItem(item.id, { archived: true, isArchived: true }, "archive")
                                              }
                                              disabled={loadingAction === `archive-${item.id}`}
                                              className="ui-row-action ui-row-action--archive"
                                              title="Archive"
                                            >
                                              <Archive className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateItem(
                                                  item.id,
                                                  { archived: false, isArchived: false },
                                                  "unarchive"
                                                )
                                              }
                                              disabled={loadingAction === `unarchive-${item.id}`}
                                              className="ui-row-action ui-row-action--archive"
                                              title="Unarchive"
                                            >
                                              <Archive className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => deleteItem(item.id)}
                                            className="ui-row-action ui-row-action--destructive"
                                            title="Delete"
                                          >
                                            <Trash2 className="h-3 w-3" strokeWidth={2.25} />
                                          </button>
                                        </div>
                                      )}
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
                  <Bot className="w-5 h-5" style={{ color: COLORS.purple700 }} />
                  <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                    {title} AI Assistant
                  </h3>
                </div>
                <button type="button" onClick={() => setShowAskMe(false)} className="ui-btn ui-btn-muted">
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
                  <button type="button" onClick={handleSummarizeAllTasks} disabled={aiLoading} className="ui-btn ui-btn-primary">
                    {aiLoading
                      ? "Generating..."
                      : selectedCategoryId
                        ? "Generate Summary (Selected Category)"
                        : "Generate Summary (All Tasks)"}
                  </button>
                  <button type="button" onClick={handleAskSelectedTask} disabled={aiLoading} className="ui-btn ui-btn-outline disabled:opacity-70">
                    Ask Selected {itemLabel}
                  </button>
                  <button type="button" onClick={() => { setAiQuestion(""); setAiReply("") }} className="ui-btn ui-btn-muted">
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

