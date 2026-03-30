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
  Star,
  Pause,
  Calendar,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ArrowLeft,
  Bot,
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"
import { useAuth } from "@/contexts/auth-context"
import { readModulePageCache, writeModulePageCache } from "@/lib/client/module-page-cache"

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
  const { isEmployee } = useAuth()
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
  const [addingManualToCategory, setAddingManualToCategory] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [newManualData, setNewManualData] = useState({
    title: "",
    version: "",
    location: "",
    issueDate: new Date().toISOString().split('T')[0]
  })
  const [showAskMe, setShowAskMe] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiReply, setAiReply] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedManualId, setSelectedManualId] = useState("")
  const cacheKey = `manual:manual`

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

      const [catRes, archivedCatRes, manRes, archivedRes] = await Promise.all([
        fetch("/api/categories?type=manual", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        !isEmployee
          ? fetch("/api/categories?type=manual&archived=true", {
              credentials: "include",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : Promise.resolve(null),
        fetch("/api/manuals", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        !isEmployee
          ? fetch("/api/manuals/archived/all", {
              credentials: "include",
              headers: {
                Authorization: `Bearer ${token}`,
              },
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

      const manualsData = await manRes.json()
      const archivedData = archivedRes && archivedRes.ok ? await archivedRes.json() : []
      const archivedById = new Map<string, any>()
      archivedData.forEach((item: any) => {
        if (item?._id) archivedById.set(String(item._id), item)
      })
      manualsData
        .filter((item: any) => item?.archived || item?.isArchived)
        .forEach((item: any) => {
          if (item?._id) archivedById.set(String(item._id), item)
        })
      const archivedManuals = Array.from(archivedById.values())

      const allCategories = categoriesData.map((cat: any) => {
        const categoryId = toIdString(cat._id)
        const nonArchivedManuals = manualsData
          .filter((m: any) => getItemCategoryId(m) === categoryId && !m.archived && !m.isArchived)
          .map((m: any) => ({
            id: m._id,
            title: m.title,
            version: m.version,
            issueDate: m.issueDate,
            location: m.location,
            fileData: m.fileData,
            fileName: m.fileName,
            fileType: m.fileType,
            fileSize: m.fileSize,
            highlighted: m.highlighted || false,
            approved: m.approved || false,
            paused: m.paused || false,
          }))
        const activeManuals = nonArchivedManuals.filter((m: any) => !Boolean(m.approved))

        const categoryArchivedManuals = archivedManuals
          .filter((m: any) => getItemCategoryId(m) === categoryId)
          .map((m: any) => ({
            id: m._id,
            title: m.title,
            version: m.version,
            issueDate: m.issueDate,
            location: m.location,
            fileData: m.fileData,
            fileName: m.fileName,
            fileType: m.fileType,
            fileSize: m.fileSize,
            highlighted: m.highlighted || false,
            approved: m.approved || false,
            paused: m.paused || false,
          }))

        return {
          id: categoryId,
          title: cat.name,
          isArchived: Boolean(cat.isArchived),
          archived: Boolean(cat.archived),
          manuals: activeManuals,
          archivedManuals: categoryArchivedManuals,
            completedManuals: nonArchivedManuals.filter((m: any) => Boolean(m.approved)),
            highlightedManuals: nonArchivedManuals.filter((m: any) => Boolean(m.highlighted)),
        }
      })

      const merged = allCategories.filter((cat: any) => !cat.isArchived && !cat.archived)
      // Category should move to archived list only when category itself is archived.
      // Archived manuals remain available inside each category's inner "Archived" tab.
      const mergedArchived = allCategories.filter(
        (cat: any) => cat.isArchived || cat.archived
      )

      setCategories(merged)
      setArchivedCategories(mergedArchived)
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
      console.log(err)
    }
  }

  useEffect(() => {
    const cached = readModulePageCache(cacheKey)
    if (cached) {
      setCategories(cached.categories)
      setArchivedCategories(cached.archivedCategories)
      setCategoryItemView(cached.categoryItemView)
      setExpandedCategories(
        cached.expandedCategories?.length ? [cached.expandedCategories[0]] : ["1"]
      )
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmployee])

  useEffect(() => {
    writeModulePageCache(cacheKey, {
      categories,
      archivedCategories,
      categoryItemView,
      expandedCategories,
    })
  }, [archivedCategories, categories, categoryItemView, expandedCategories])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => (prev.includes(categoryId) ? [] : [categoryId]))
  }

  const toggleHighlight = async (_categoryId: string, manualId: string, currentHighlighted: boolean) => {
    try {
      setLoadingAction(`highlight-${manualId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/manuals/${manualId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ highlighted: !currentHighlighted })
      })

      if (!response.ok) throw new Error("Failed to update highlight")
      await loadData()
    } catch (err) {
      console.error("Error toggling highlight:", err)
      alert("Failed to update highlight status")
    } finally {
      setLoadingAction(null)
    }
  }

  const toggleApprove = async (_categoryId: string, manualId: string, currentApproved: boolean) => {
    try {
      setLoadingAction(`approve-${manualId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/manuals/${manualId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved: !currentApproved })
      })

      if (!response.ok) throw new Error("Failed to update completed status")
      await loadData()
    } catch (err) {
      console.error("Error toggling approve:", err)
      alert("Failed to update completed status")
    } finally {
      setLoadingAction(null)
    }
  }

  const togglePause = async (_categoryId: string, manualId: string, currentPaused: boolean) => {
    try {
      setLoadingAction(`pause-${manualId}`)
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/manuals/${manualId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paused: !currentPaused })
      })

      if (!response.ok) throw new Error("Failed to update pause status")
      await loadData()
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

      const response = await fetch(`/api/manuals/${manualId}/archive`, {
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

      const response = await fetch(`/api/manuals/${manualId}/unarchive`, {
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

      const response = await fetch(`/api/categories/${categoryId}/archive?type=manual`, {
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

      const response = await fetch(`/api/categories/${categoryId}/unarchive?type=manual`, {
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

      const response = await fetch(`/api/manuals/${manualId}/copy`, {
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

  const downloadManual = async (manual: any) => {
    try {
      let fileData = manual?.fileData
      let fileName = manual?.fileName
      let fileType = manual?.fileType

      // Re-fetch latest record if current list row doesn't include file payload.
      if (!fileData) {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/manuals/${manual.id}`, {
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
        alert("No document attached to this manual yet")
        return
      }

      const url =
        typeof fileData === "string" && fileData.startsWith("data:")
          ? fileData
          : `data:${fileType || "application/octet-stream"};base64,${String(fileData)}`
      const link = document.createElement("a")
      link.href = url
      link.download = fileName || `${String(manual?.title || "manual").replace(/\s+/g, "_")}.file`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Error downloading manual:", err)
      alert("No document available for download")
    }
  }

  const deleteManual = async (categoryId: any, manualId: any) => {
    if (!confirm("Are you sure you want to delete this manual?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/manuals/${manualId}`, {
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

      const response = await fetch(`/api/categories/${categoryId}?type=manual`, {
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

      await fetch(`/api/categories/${categoryId}?type=manual`, {
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

      const response = await fetch("/api/manuals", {
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

  const allManualOptions = () => {
    const active = categories.flatMap((cat: any) =>
      (cat.manuals || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        categoryId: cat.id,
        category: cat.title,
      }))
    )
    const archived = archivedCategories.flatMap((cat: any) =>
      (cat.archivedManuals || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        categoryId: cat.id,
        category: `${cat.title} (Archived)`,
      }))
    )
    return [...active, ...archived]
  }

  const allCategoryOptions = () => {
    const active = categories.map((cat: any) => ({ id: cat.id, title: cat.title }))
    const archived = archivedCategories
      .filter((cat: any) => !active.some((a: any) => a.id === cat.id))
      .map((cat: any) => ({ id: cat.id, title: `${cat.title} (Archived)` }))
    return [...active, ...archived]
  }

  const filteredManualOptions = () => {
    const all = allManualOptions()
    if (!selectedCategoryId) return all
    return all.filter((manual: any) => manual.categoryId === selectedCategoryId)
  }

  const callManualAi = async (payload: Record<string, unknown>) => {
    setAiLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/manuals/ai", {
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
      console.error("Manual AI error:", err)
      alert("Failed to generate AI response")
    } finally {
      setAiLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    await callManualAi({
      action: selectedCategoryId ? "summarize-category" : "summarize-all",
      categoryId: selectedCategoryId || undefined,
    })
  }

  const handleAskSelectedManual = async () => {
    const manualId = selectedManualId
    const question = aiQuestion.trim()

    if (manualId) {
      await callManualAi({
        action: "ask-one",
        manualId,
        question,
      })
      return
    }

    if (selectedCategoryId) {
      await callManualAi({
        action: "ask-category",
        categoryId: selectedCategoryId,
        question,
      })
      return
    }

    if (!question) {
      alert("Please select a category or manual, or enter a question.")
      return
    }

    await callManualAi({
      action: "summarize-all",
      question,
    })
  }

  const parsedAiRows = aiReply
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean)

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

  useEffect(() => {
    if (!showAskMe) return
    const options = filteredManualOptions()
    if (!options.some((m: any) => m.id === selectedManualId)) {
      setSelectedManualId(options[0]?.id || "")
    }
  }, [selectedCategoryId, showAskMe, selectedManualId, categories, archivedCategories])

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

  const visibleCategories = showArchived ? archivedCategories : categories

  const formatDisplayDate = (value?: string) => {
    if (!value) return "N/A"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleDateString("en-GB")
  }

  const getStatusTone = (manual: any) => {
    if (manual.paused) {
      return {
        label: "Paused",
        background: COLORS.orange50,
        color: COLORS.orange700,
        borderColor: COLORS.orange200,
      }
    }

    if (manual.approved) {
      return {
        label: "Done",
        background: COLORS.emerald50,
        color: COLORS.emerald700,
        borderColor: COLORS.emerald200,
      }
    }

    if (manual.highlighted) {
      return {
        label: "Starred",
        background: COLORS.indigo50,
        color: COLORS.indigo700,
        borderColor: COLORS.indigo200,
      }
    }

    return {
      label: "Active",
      background: COLORS.bgWhite,
      color: COLORS.textSecondary,
      borderColor: COLORS.border,
    }
  }

  const getEmptyStateText = (currentItemView: "active" | "archived" | "completed" | "highlighted") => {
    if (currentItemView === "archived") {
      return {
        title: "No archived manuals in this category",
        description: "Archived manuals will appear here.",
      }
    }

    if (currentItemView === "completed") {
      return {
        title: "No completed manuals in this category",
        description: "Completed manuals will appear here once approved.",
      }
    }

    if (currentItemView === "highlighted") {
      return {
        title: "No starred manuals in this category",
        description: "Highlighted manuals will appear here.",
      }
    }

    return {
      title: "No manuals in this category",
      description: "Use the add button to create the first manual.",
    }
  }

  const actionButtonStyle = (tone: "neutral" | "blue" | "amber" | "green" | "red" | "purple" | "gray") => {
    if (tone === "blue") {
      return {
        background: "#f8fbff",
        color: COLORS.blue700,
        borderColor: COLORS.blue200,
      }
    }

    if (tone === "amber") {
      return {
        background: "#fffaf3",
        color: COLORS.orange700,
        borderColor: COLORS.orange200,
      }
    }

    if (tone === "green") {
      return {
        background: "#f4fcf6",
        color: COLORS.green600,
        borderColor: COLORS.green200,
      }
    }

    if (tone === "red") {
      return {
        background: "#fff5f6",
        color: COLORS.pink600,
        borderColor: COLORS.pink200,
      }
    }

    if (tone === "purple") {
      return {
        background: "#f7f6ff",
        color: COLORS.indigo700,
        borderColor: COLORS.indigo200,
      }
    }

    if (tone === "gray") {
      return {
        background: "#fafafa",
        color: COLORS.gray600,
        borderColor: COLORS.gray200,
      }
    }

    return {
      background: "#ffffff",
      color: "#7b8190",
      borderColor: "#ececf3",
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #f7f8fb 0%, #f3f5f9 100%)" }}
    >
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            {/* <Link href="/dashboard">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: COLORS.bgWhite,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link> */}

            <div>
              <div className="mb-1 flex items-center gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: COLORS.indigo50,
                    color: COLORS.indigo700,
                    border: `1px solid ${COLORS.indigo200}`,
                  }}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.textPrimary }}>
                  Manuals
                </h1>
              </div>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage documentation, categories, and publication status in one place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEmployee ? (
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  background: COLORS.bgWhite,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            ) : null}

            {!isEmployee ? (
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  background: COLORS.bgWhite,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Archive className="h-4 w-4" />
                {showArchived ? "Show Active" : "Show Archived"}
              </button>
            ) : null}

            {!isEmployee ? (
              <button
                type="button"
                onClick={() => {
                  const categoryOptions = allCategoryOptions()
                  const firstCategoryId = categoryOptions[0]?.id || ""
                  setSelectedCategoryId(firstCategoryId)
                  const options = allManualOptions()
                  const firstManual =
                    options.find((m: any) => m.categoryId === firstCategoryId) || options[0]
                  setSelectedManualId(firstManual?.id || "")
                  setAiQuestion("")
                  setAiReply("")
                  setShowAskMe(true)
                }}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  background: COLORS.bgWhite,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Bot className="h-4 w-4" />
                Ask Me
              </button>
            ) : null}

            <Link href="/manual/new">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: "#111827",
                  color: COLORS.textWhite,
                  border: "1px solid #111827",
                }}
              >
                <Plus className="h-4 w-4" />
                Add New
              </button>
            </Link>
          </div>
        </div>

        {showAddCategory && !isEmployee && (
          <div
            className="mb-5 rounded-2xl p-5 shadow-sm"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                Create New Category
              </h3>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Add a new manual group to keep related documents together.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                placeholder="Enter category name"
                className="flex-1 rounded-xl px-4 py-3 outline-none transition-all focus:ring-2"
                style={{
                  background: COLORS.bgGrayLight,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textPrimary,
                }}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
              />
              <button
                onClick={addCategory}
                className="rounded-xl px-5 py-3 text-sm font-semibold"
                style={{ background: "#111827", color: COLORS.textWhite }}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryTitle("")
                }}
                className="rounded-xl px-5 py-3 text-sm font-semibold"
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

        {!isEmployee ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div
              className="inline-flex rounded-xl p-1"
              style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
            >
              <button
                type="button"
                onClick={() => setShowArchived(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  background: !showArchived ? COLORS.indigo700 : "transparent",
                  color: !showArchived ? COLORS.textWhite : COLORS.textSecondary,
                }}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setShowArchived(true)}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  background: showArchived ? COLORS.indigo700 : "transparent",
                  color: showArchived ? COLORS.textWhite : COLORS.textSecondary,
                }}
              >
                Archived
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span style={{ color: COLORS.textSecondary }}>Sort by</span>
              <button
                type="button"
                onClick={() => toggleSort("name")}
                className="rounded-lg px-3 py-2 font-semibold"
                style={{
                  background: sortType === "name" ? COLORS.indigo50 : COLORS.bgWhite,
                  color: sortType === "name" ? COLORS.indigo700 : COLORS.textPrimary,
                  border: `1px solid ${sortType === "name" ? COLORS.indigo200 : COLORS.border}`,
                }}
              >
                Name {sortType === "name" ? (sortDirection === "asc" ? "A-Z" : "Z-A") : ""}
              </button>
              <button
                type="button"
                onClick={() => toggleSort("date")}
                className="rounded-lg px-3 py-2 font-semibold"
                style={{
                  background: sortType === "date" ? COLORS.indigo50 : COLORS.bgWhite,
                  color: sortType === "date" ? COLORS.indigo700 : COLORS.textPrimary,
                  border: `1px solid ${sortType === "date" ? COLORS.indigo200 : COLORS.border}`,
                }}
              >
                Date {sortType === "date" ? (sortDirection === "asc" ? "Old-New" : "New-Old") : ""}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-5 flex justify-end">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span style={{ color: COLORS.textSecondary }}>Sort by</span>
              <button
                type="button"
                onClick={() => toggleSort("name")}
                className="rounded-lg px-3 py-2 font-semibold"
                style={{
                  background: sortType === "name" ? COLORS.indigo50 : COLORS.bgWhite,
                  color: sortType === "name" ? COLORS.indigo700 : COLORS.textPrimary,
                  border: `1px solid ${sortType === "name" ? COLORS.indigo200 : COLORS.border}`,
                }}
              >
                Name
              </button>
              <button
                type="button"
                onClick={() => toggleSort("date")}
                className="rounded-lg px-3 py-2 font-semibold"
                style={{
                  background: sortType === "date" ? COLORS.indigo50 : COLORS.bgWhite,
                  color: sortType === "date" ? COLORS.indigo700 : COLORS.textPrimary,
                  border: `1px solid ${sortType === "date" ? COLORS.indigo200 : COLORS.border}`,
                }}
              >
                Date
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {visibleCategories.map((category) => {
            const currentItemView = categoryItemView[category.id] ?? "active"
            const currentManuals =
              currentItemView === "archived"
                ? (category.archivedManuals || [])
                : currentItemView === "completed"
                  ? (category.completedManuals || [])
                  : currentItemView === "highlighted"
                    ? (category.highlightedManuals || [])
                    : (category.manuals || [])
            const sortedManuals = sortManuals(currentManuals)
            const isViewingArchivedItems = currentItemView === "archived"
            const isExpanded = expandedCategories.includes(category.id)
            const emptyState = getEmptyStateText(currentItemView)

            return (
              <div
                key={category.id}
                className="overflow-hidden rounded-2xl shadow-sm"
                style={{
                  background: COLORS.bgWhite,
                  border: `1px solid #ececf3`,
                  boxShadow: "0 10px 30px rgba(31, 41, 55, 0.05)",
                }}
              >
                <div
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    background: "#341746",
                    color: COLORS.textWhite,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{ background: "rgba(255,255,255,0.14)" }}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-base font-semibold">{category.title}</div>
                      <div className="text-xs text-white/70">
                        {currentManuals.length} manual{currentManuals.length === 1 ? "" : "s"} in view
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Drag/grip handle */}
                    <div className="mr-1 flex h-7 w-5 items-center justify-center opacity-50">
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                        <circle cx="3" cy="2" r="1.5"/><circle cx="9" cy="2" r="1.5"/>
                        <circle cx="3" cy="7" r="1.5"/><circle cx="9" cy="7" r="1.5"/>
                        <circle cx="3" cy="12" r="1.5"/><circle cx="9" cy="12" r="1.5"/>
                      </svg>
                    </div>
                    {/* White toggle square */}
                    <div
                      className="h-6 w-6 rounded"
                      style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.4)" }}
                    />

                    {!isEmployee ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditCategory(category.id, category.title)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                        style={{ background: "#22c55e" }}
                        title="Edit Category"
                      >
                        <Edit className="h-3.5 w-3.5 text-white" />
                      </button>
                    ) : null}

                    {!showArchived ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isViewingArchivedItems) {
                            setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))
                          }
                          setAddingManualToCategory(category.id)
                          if (!expandedCategories.includes(category.id)) {
                            setExpandedCategories([category.id])
                          }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                        style={{ background: "#22c55e" }}
                        title="Add Manual"
                      >
                        <Plus className="h-3.5 w-3.5 text-white" />
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
                          className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                          style={{ background: "#f59e0b" }}
                          title="Unarchive Category"
                        >
                          <Archive className="h-3.5 w-3.5 text-white" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            archiveCategory(category.id)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                          style={{ background: "#f59e0b" }}
                          title="Archive Category"
                        >
                          <Archive className="h-3.5 w-3.5 text-white" />
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
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                        style={{ background: "#ef4444" }}
                        title="Delete Category"
                      >
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {editingCategory === category.id && (
                  <div
                    className="border-b px-4 py-4"
                    style={{ background: COLORS.bgGrayLight, borderColor: COLORS.border }}
                  >
                    <div className="mb-3 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                      Rename Category
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Enter category name"
                        className="flex-1 rounded-xl px-4 py-3 outline-none transition-all focus:ring-2"
                        style={{
                          background: COLORS.bgWhite,
                          color: COLORS.textPrimary,
                          border: `1px solid ${COLORS.border}`,
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveEditCategory(category.id)
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditCategory(category.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                        style={{ background: COLORS.indigo700, color: COLORS.textWhite }}
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null)
                          setEditTitle("")
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                        style={{
                          background: COLORS.bgWhite,
                          color: COLORS.textPrimary,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded ? (
                  <div className="p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))
                          }
                          className="rounded-lg px-3 py-2 text-sm font-semibold"
                          style={{
                            background: currentItemView === "active" ? "#f1f0ff" : COLORS.bgWhite,
                            color: currentItemView === "active" ? COLORS.indigo700 : COLORS.textSecondary,
                            border: `1px solid ${currentItemView === "active" ? COLORS.indigo200 : "#ececf3"}`,
                          }}
                        >
                          Active ({(category.manuals || []).length})
                        </button>
                        {!isEmployee ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))
                            }
                            className="rounded-lg px-3 py-2 text-sm font-semibold"
                            style={{
                              background: currentItemView === "archived" ? "#f1f0ff" : COLORS.bgWhite,
                              color: currentItemView === "archived" ? COLORS.indigo700 : COLORS.textSecondary,
                              border: `1px solid ${currentItemView === "archived" ? COLORS.indigo200 : "#ececf3"}`,
                            }}
                          >
                            Archived ({(category.archivedManuals || []).length})
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() =>
                            setCategoryItemView((prev) => ({ ...prev, [category.id]: "completed" }))
                          }
                          className="rounded-lg px-3 py-2 text-sm font-semibold"
                          style={{
                            background: currentItemView === "completed" ? "#f1f0ff" : COLORS.bgWhite,
                            color: currentItemView === "completed" ? COLORS.indigo700 : COLORS.textSecondary,
                            border: `1px solid ${currentItemView === "completed" ? COLORS.indigo200 : "#ececf3"}`,
                          }}
                        >
                          Done ({(category.completedManuals || []).length})
                        </button>
                        {!isEmployee ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCategoryItemView((prev) => ({ ...prev, [category.id]: "highlighted" }))
                            }
                            className="rounded-lg px-3 py-2 text-sm font-semibold"
                            style={{
                              background: currentItemView === "highlighted" ? "#f1f0ff" : COLORS.bgWhite,
                              color: currentItemView === "highlighted" ? COLORS.indigo700 : COLORS.textSecondary,
                              border: `1px solid ${currentItemView === "highlighted" ? COLORS.indigo200 : "#ececf3"}`,
                            }}
                          >
                            Starred ({(category.highlightedManuals || []).length})
                          </button>
                        ) : null}
                      </div>

                      <div className="text-xs sm:text-sm" style={{ color: COLORS.textSecondary }}>
                        Showing {sortedManuals.length} result{sortedManuals.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    {addingManualToCategory === category.id && currentItemView === "active" ? (
                      <div
                        className="mb-5 rounded-2xl p-5"
                        style={{
                          background: COLORS.bgGrayLight,
                          border: `1px dashed ${COLORS.borderHover}`,
                        }}
                      >
                        <div className="mb-4">
                          <h3 className="text-base font-semibold" style={{ color: COLORS.textPrimary }}>
                            Add New Manual
                          </h3>
                          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                            Create a new document entry in this category.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                              Manual Title
                            </label>
                            <input
                              type="text"
                              value={newManualData.title}
                              onChange={(e) => setNewManualData((prev) => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter manual title"
                              className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2"
                              style={{
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.border}`,
                              }}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                              Version
                            </label>
                            <input
                              type="text"
                              value={newManualData.version}
                              onChange={(e) => setNewManualData((prev) => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g. 1.0"
                              className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2"
                              style={{
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.border}`,
                              }}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                              Location
                            </label>
                            <input
                              type="text"
                              value={newManualData.location}
                              onChange={(e) => setNewManualData((prev) => ({ ...prev, location: e.target.value }))}
                              placeholder="Enter location"
                              className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2"
                              style={{
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.border}`,
                              }}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                              Issue Date
                            </label>
                            <input
                              type="date"
                              value={newManualData.issueDate}
                              onChange={(e) => setNewManualData((prev) => ({ ...prev, issueDate: e.target.value }))}
                              className="w-full rounded-xl px-4 py-3 outline-none transition-all focus:ring-2"
                              style={{
                                background: COLORS.bgWhite,
                                color: COLORS.textPrimary,
                                border: `1px solid ${COLORS.border}`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => addManualToCategory(category.id)}
                            className="rounded-xl px-5 py-3 text-sm font-semibold"
                            style={{ background: "#111827", color: COLORS.textWhite }}
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
                                issueDate: new Date().toISOString().split("T")[0],
                              })
                            }}
                            className="rounded-xl px-5 py-3 text-sm font-semibold"
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
                    ) : null}

                    {sortedManuals.length === 0 ? (
                      <div
                        className="rounded-2xl px-6 py-12 text-center"
                        style={{ background: COLORS.bgGrayLight, border: `1px solid ${COLORS.border}` }}
                      >
                        <FileText className="mx-auto mb-3 h-10 w-10" style={{ color: COLORS.textLight }} />
                        <div className="mb-1 text-base font-semibold" style={{ color: COLORS.textPrimary }}>
                          {emptyState.title}
                        </div>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {emptyState.description}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="overflow-hidden rounded-2xl"
                        style={{ border: `1px solid #efeff5`, background: "#fcfcff" }}
                      >
                        <div className="overflow-x-auto p-3">
                          <table className="min-w-full text-left">
                            <thead style={{ background: "#ffffff" }}>
                              <tr style={{ color: "#707685" }}>
                                <th className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wide">
                                  <input type="checkbox" className="h-4 w-4 rounded" />
                                </th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Manual</th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Issue Level</th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Issue Date</th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Location</th>
                                <th className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide">Status</th>
                                <th className="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wide">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedManuals.map((manual, index) => {
                                const statusTone = getStatusTone(manual)
                                return (
                                  <tr
                                    key={manual.id}
                                    style={{
                                      background:
                                        manual.paused
                                          ? "#fffaf2"
                                          : manual.highlighted
                                            ? "#faf7ff"
                                            : "#ffffff",
                                      borderTop: index === 0 ? "none" : "1px solid #efeff5",
                                      borderBottom: index === sortedManuals.length - 1 ? "1px solid #efeff5" : "none",
                                    }}
                                  >
                                    <td className="px-2 py-1 align-top">
                                      <input type="checkbox" className="mt-1 h-4 w-4 rounded" />
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg"
                                          style={{
                                            background: "#f4f2ff",
                                            color: COLORS.indigo700,
                                            border: `1px solid ${COLORS.indigo200}`,
                                          }}
                                        >
                                          <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <Link
                                            href={`/task/manuals/${manual.id}?back=${encodeURIComponent("/manual")}`}
                                            className="block text-sm font-semibold hover:underline sm:text-[15px] break-words"
                                            style={{ color: COLORS.indigo700 }}
                                          >
                                            {manual.title}
                                          </Link>
                                          {manual.fileName ? (
                                            <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#73788a" }}>
                                              <FileText className="h-3 w-3 shrink-0" style={{ color: COLORS.indigo700 }} />
                                              <span className="max-w-[160px] truncate" title={manual.fileName}>{manual.fileName}</span>
                                            </div>
                                          ) : null}
                                          {(manual.highlighted || manual.paused) ? (
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: "#73788a" }}>
                                              {manual.highlighted ? <span>Starred</span> : null}
                                              {manual.paused ? <span>Paused</span> : null}
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-2 py-1 align-top text-sm" style={{ color: COLORS.textPrimary }}>
                                      {manual.version || "1.0"}
                                    </td>
                                    <td className="px-2 py-1 align-top text-sm" style={{ color: COLORS.textPrimary }}>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" style={{ color: COLORS.textLight }} />
                                        {formatDisplayDate(manual.issueDate)}
                                      </div>
                                    </td>
                                    <td className="px-2 py-1 align-top text-sm" style={{ color: COLORS.textPrimary }}>
                                      {manual.location || "Default Location"}
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                      <span
                                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                                        style={{
                                          background: statusTone.background,
                                          color: statusTone.color,
                                          border: `1px solid ${statusTone.borderColor}`,
                                        }}
                                      >
                                        {statusTone.label}
                                      </span>
                                    </td>
                                    <td className="px-2 py-1">
                                      <div className="flex items-center justify-end gap-1">
                                        {/* Drag handle */}
                                        <div className="mr-1 flex h-6 w-5 cursor-move items-center justify-center opacity-30 hover:opacity-60">
                                          <svg width="10" height="14" viewBox="0 0 10 14" fill="#374151">
                                            <circle cx="2.5" cy="2" r="1.5"/><circle cx="7.5" cy="2" r="1.5"/>
                                            <circle cx="2.5" cy="7" r="1.5"/><circle cx="7.5" cy="7" r="1.5"/>
                                            <circle cx="2.5" cy="12" r="1.5"/><circle cx="7.5" cy="12" r="1.5"/>
                                          </svg>
                                        </div>

                                        {isEmployee ? (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => toggleApprove(category.id, manual.id, manual.approved)}
                                              disabled={loadingAction === `approve-${manual.id}`}
                                              className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                              style={{ background: "#22c55e" }}
                                              title={manual.approved ? "Reopen" : "Mark done"}
                                            >
                                              <Check className="h-3.5 w-3.5 text-white" />
                                            </button>
                                            <Link href={`/manual/${manual.id}/edit`}>
                                              <button
                                                type="button"
                                                className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                                                style={{ background: "#4f46e5" }}
                                                title="Edit"
                                              >
                                                <Edit className="h-3.5 w-3.5 text-white" />
                                              </button>
                                            </Link>
                                            <button
                                              type="button"
                                              onClick={() => downloadManual(manual)}
                                              disabled={loadingAction === `download-${manual.id}`}
                                              className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                              style={{ background: "#6366f1" }}
                                              title="Download"
                                            >
                                              <Download className="h-3.5 w-3.5 text-white" />
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => toggleHighlight(category.id, manual.id, manual.highlighted)}
                                              disabled={loadingAction === `highlight-${manual.id}`}
                                              className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                              style={{ background: "#f59e0b" }}
                                              title={manual.highlighted ? "Remove Highlight" : "Highlight"}
                                            >
                                              <Star className={`h-3.5 w-3.5 text-white ${manual.highlighted ? "fill-white" : ""}`} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => toggleApprove(category.id, manual.id, manual.approved)}
                                              disabled={loadingAction === `approve-${manual.id}`}
                                              className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                              style={{ background: "#22c55e" }}
                                              title={manual.approved ? "Mark as Incomplete" : "Mark as Completed"}
                                            >
                                              <Check className="h-3.5 w-3.5 text-white" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => togglePause(category.id, manual.id, manual.paused)}
                                              disabled={loadingAction === `pause-${manual.id}`}
                                              className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                              style={{ background: "#f97316" }}
                                              title={manual.paused ? "Resume" : "Pause"}
                                            >
                                              <Pause className="h-3.5 w-3.5 text-white" />
                                            </button>
                                            <Link href={`/manual/${manual.id}/edit`}>
                                              <button
                                                type="button"
                                                className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                                                style={{ background: "#4f46e5" }}
                                                title="Edit"
                                              >
                                                <Edit className="h-3.5 w-3.5 text-white" />
                                              </button>
                                            </Link>
                                            <button
                                              type="button"
                                              onClick={() => copyManual(category.id, manual.id)}
                                              disabled={loadingAction === `copy-${manual.id}`}
                                              className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                              style={{ background: "#6366f1" }}
                                              title="Duplicate"
                                            >
                                              <Copy className="h-3.5 w-3.5 text-white" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => downloadManual(manual)}
                                              disabled={loadingAction === `download-${manual.id}`}
                                              className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                              style={{ background: "#6366f1" }}
                                              title="Download"
                                            >
                                              <Download className="h-3.5 w-3.5 text-white" />
                                            </button>
                                            {!isViewingArchivedItems ? (
                                              <button
                                                type="button"
                                                onClick={() => archiveManual(category.id, manual.id)}
                                                disabled={loadingAction === `archive-${manual.id}`}
                                                className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                                style={{ background: "#f59e0b" }}
                                                title="Archive"
                                              >
                                                <Archive className="h-3.5 w-3.5 text-white" />
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => unarchiveManual(category.id, manual.id)}
                                                disabled={loadingAction === `unarchive-${manual.id}`}
                                                className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                                style={{ background: "#22c55e" }}
                                                title="Unarchive"
                                              >
                                                <Archive className="h-3.5 w-3.5 text-white" />
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => deleteManual(category.id, manual.id)}
                                              className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:brightness-110"
                                              style={{ background: "#ef4444" }}
                                              title="Delete"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 text-white" />
                                            </button>
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

        {showArchived && archivedCategories.length === 0 && (
          <div
            className="mt-8 rounded-2xl px-6 py-16 text-center"
            style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}
          >
            <Archive className="mx-auto mb-4 h-14 w-14" style={{ color: COLORS.textLight }} />
            <h3 className="mb-2 text-xl font-semibold" style={{ color: COLORS.textPrimary }}>
              No archived categories
            </h3>
            <p style={{ color: COLORS.textSecondary }}>
              Archived manual groups will appear here once you archive them.
            </p>
          </div>
        )}

        {showAskMe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)" }}>
            <div className="w-full max-w-3xl max-h-[88vh] rounded-2xl shadow-xl overflow-hidden" style={{ background: COLORS.bgWhite, border: `1px solid ${COLORS.border}` }}>
              <div className="p-5 border-b flex items-center justify-between sticky top-0 z-10" style={{ borderColor: COLORS.border, background: COLORS.bgWhite }}>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" style={{ color: COLORS.primary }} />
                  <h3 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>Manual AI Assistant</h3>
                </div>
                <button
                  onClick={() => setShowAskMe(false)}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: COLORS.bgGray, color: COLORS.textPrimary }}
                >
                  Close
                </button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(88vh-72px)]">
                <div className="rounded-xl p-3" style={{ background: COLORS.bgGray, border: `1px solid ${COLORS.border}` }}>
                  <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                    Tip: Keep "All Categories" selected to generate a complete summary, or choose one category for focused output.
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
                      {allCategoryOptions().map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                      Select Manual
                    </label>
                    <select
                      value={selectedManualId}
                      onChange={(e) => setSelectedManualId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                    >
                      <option value="">Select manual...</option>
                      {filteredManualOptions().map((manual) => (
                        <option key={manual.id} value={manual.id}>
                          {manual.title} - {manual.category}
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
                    placeholder="Example: summarize this manual and key actions"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                    style={{ borderColor: COLORS.border, color: COLORS.textPrimary, background: COLORS.bgWhite }}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={aiLoading}
                    className="px-5 py-2.5 rounded-lg font-medium"
                    style={{ background: COLORS.primaryGradient, color: COLORS.textWhite, opacity: aiLoading ? 0.7 : 1 }}
                  >
                    {aiLoading
                      ? "Generating..."
                      : selectedCategoryId
                        ? "Generate Summary (Selected Category)"
                        : "Generate Summary (All Tasks)"}
                  </button>
                  <button
                    onClick={handleAskSelectedManual}
                    disabled={aiLoading}
                    className="px-5 py-2.5 rounded-lg font-medium"
                    style={{ background: COLORS.bgWhite, color: COLORS.primary, border: `1px solid ${COLORS.primary}`, opacity: aiLoading ? 0.7 : 1 }}
                  >
                    Ask Selected Manual
                  </button>
                  <button
                    onClick={() => {
                      setAiQuestion("")
                      setAiReply("")
                    }}
                    className="px-5 py-2.5 rounded-lg font-medium"
                    style={{ background: COLORS.bgGray, color: COLORS.textPrimary }}
                  >
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
