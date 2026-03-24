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
      setExpandedCategories(cached.expandedCategories?.length ? cached.expandedCategories : ["1"])
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
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
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
          <div className="flex gap-3 flex-wrap">
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
                className="px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-md flex items-center gap-2"
                style={{
                  background: COLORS.bgWhite,
                  color: COLORS.textPrimary,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <Bot className="w-4 h-4" />
                Ask Me
              </button>
            ) : null}
            <button
              type="button"
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
            {!isEmployee ? (
              <button
                type="button"
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
            ) : null}
            <Link href="/manual/new">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primaryGradient,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                New Manual
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
        {!isEmployee ? (
          <div className="mb-6">
            <div className="flex gap-1 border-b-2" style={{ borderColor: COLORS.border }}>
              <button
                type="button"
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
                type="button"
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
        ) : null}

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
                      {currentManuals.length} manuals
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEmployee ? (
                      <button
                        type="button"
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
                    ) : null}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isViewingArchivedItems) {
                          setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))
                        }
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
                    {!isEmployee ? (
                      showArchived ? (
                        <button
                          type="button"
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
                          type="button"
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
                      )
                    ) : null}
                    {!isEmployee ? (
                      <button
                        type="button"
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
                    ) : null}
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
                    <div className="mb-4 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))
                        }
                        className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                        style={{
                          background: currentItemView === "active" ? COLORS.primaryGradient : COLORS.bgWhite,
                          color: currentItemView === "active" ? COLORS.textWhite : COLORS.textPrimary,
                          borderColor: currentItemView === "active" ? COLORS.primary : COLORS.border,
                        }}
                      >
                        To do ({(category.manuals || []).length})
                      </button>
                      {!isEmployee ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))
                          }
                          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                          style={{
                            background: currentItemView === "archived" ? COLORS.primaryGradient : COLORS.bgWhite,
                            color: currentItemView === "archived" ? COLORS.textWhite : COLORS.textPrimary,
                            borderColor: currentItemView === "archived" ? COLORS.primary : COLORS.border,
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
                        className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                        style={{
                          background: currentItemView === "completed" ? COLORS.primaryGradient : COLORS.bgWhite,
                          color: currentItemView === "completed" ? COLORS.textWhite : COLORS.textPrimary,
                          borderColor: currentItemView === "completed" ? COLORS.primary : COLORS.border,
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
                          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                          style={{
                            background: currentItemView === "highlighted" ? COLORS.primaryGradient : COLORS.bgWhite,
                            color: currentItemView === "highlighted" ? COLORS.textWhite : COLORS.textPrimary,
                            borderColor: currentItemView === "highlighted" ? COLORS.primary : COLORS.border,
                          }}
                        >
                          Starred ({(category.highlightedManuals || []).length})
                        </button>
                      ) : null}
                    </div>

                    {/* Add Manual Form */}
                    {addingManualToCategory === category.id && currentItemView === "active" && (
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
                          {isViewingArchivedItems
                            ? "No archived manuals in this category"
                            : currentItemView === "completed"
                              ? "No completed manuals in this category"
                              : currentItemView === "highlighted"
                                ? "No highlighted manuals in this category"
                                : "No manuals in this category"}
                        </p>
                        <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>
                          {isViewingArchivedItems
                            ? "Archive a manual to see it here"
                            : currentItemView === "completed"
                              ? "Mark a manual as completed to see it here"
                              : currentItemView === "highlighted"
                                ? "Star a manual to see it here"
                                : "Click the + button above to add your first manual"}
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
                            <button type="button" className="cursor-move hover:bg-gray-100 p-1 rounded">
                              <GripVertical className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/task/manuals/${manual.id}?back=${encodeURIComponent("/manual")}`}
                                className="font-bold hover:underline text-xl"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {manual.title}
                              </Link>
                              <div className="flex gap-5 text-base mt-2 flex-wrap" style={{ color: COLORS.textSecondary }}>
                                <span className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-400">Version:</span> {manual.version}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <>
                                    <Calendar className="w-4 h-4 text-primary" style={{ color: COLORS.primary }} />
                                    {manual.issueDate}
                                  </>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-400">Location:</span> {manual.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {isEmployee ? (
                                <>
                                  <div className="flex items-center gap-1 mr-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleApprove(category.id, manual.id, manual.approved)}
                                      disabled={loadingAction === `approve-${manual.id}`}
                                      className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `approve-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                      style={{
                                        background: COLORS.bgWhite,
                                        color: manual.approved ? "#22c55e" : "#94a3b8",
                                        borderColor: manual.approved ? "#bbf7d0" : "#e2e8f0",
                                      }}
                                      title={manual.approved ? "Reopen" : "Mark done"}
                                    >
                                      <Check className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                  <div className="flex items-center gap-1">
                                    <Link href={`/manual/${manual.id}/edit`}>
                                      <button type="button" className="p-3 rounded-lg bg-white border border-gray-200 hover:scale-110 transition-all shadow-sm" style={{ color: "#3b82f6" }} title="Edit">
                                        <Edit className="w-5 h-5" />
                                      </button>
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => downloadManual(manual)}
                                      disabled={loadingAction === `download-${manual.id}`}
                                      className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `download-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                      style={{
                                        background: COLORS.bgWhite,
                                        color: "#3b82f6",
                                        borderColor: "#e2e8f0",
                                        opacity: loadingAction === `download-${manual.id}` ? 0.6 : 1,
                                      }}
                                      title="Download"
                                    >
                                      <Download className="w-5 h-5" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                              {/* Primary Actions */}
                              <div className="flex items-center gap-1 mr-2">
                                <button
                                  type="button"
                                  onClick={() => toggleHighlight(category.id, manual.id, manual.highlighted)}
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
                                  type="button"
                                  onClick={() => toggleApprove(category.id, manual.id, manual.approved)}
                                  disabled={loadingAction === `approve-${manual.id}`}
                                  className={`p-3 rounded-lg transition-all hover:scale-110 shadow-sm border ${loadingAction === `approve-${manual.id}` ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  style={{
                                    background: COLORS.bgWhite,
                                    color: manual.approved ? COLORS.emerald600 : "#94a3b8",
                                    borderColor: manual.approved ? COLORS.emerald200 : "#e2e8f0",
                                  }}
                                  title={manual.approved ? "Mark as Incomplete" : "Mark as Completed"}
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => togglePause(category.id, manual.id, manual.paused)}
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
                                    type="button"
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
                                  type="button"
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
                                  type="button"
                                  onClick={() => downloadManual(manual)}
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
                                {!isViewingArchivedItems ? (
                                  <button
                                    type="button"
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
                                    type="button"
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
                                  type="button"
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

        {showArchived && archivedCategories.length === 0 && (
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
