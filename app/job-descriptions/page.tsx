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
  Briefcase
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"
import DynamicModulePage from "@/components/dynamic-module-page"

// Sample data for Job Descriptions
const initialCategories = [
  {
    id: "1",
    title: "Management Positions",
    jobDescriptions: [
      { id: "1-1", title: "Quality Manager", version: "v2.0", issueDate: "2024-01-15", location: "QMS", highlighted: true, approved: true, paused: false },
      { id: "1-2", title: "Operations Manager", version: "v1.5", issueDate: "2024-02-01", location: "OPS", highlighted: false, approved: true, paused: false },
    ]
  },
  {
    id: "2",
    title: "Technical Roles",
    jobDescriptions: [
      { id: "2-1", title: "Quality Engineer", version: "v1.0", issueDate: "2024-03-10", location: "ENG", highlighted: false, approved: true, paused: false },
      { id: "2-2", title: "Lab Technician", version: "v1.2", issueDate: "2024-04-05", location: "LAB", highlighted: false, approved: false, paused: true },
    ]
  },
]

type SortType = "name" | "date"

function LegacyJobDescriptionsPage() {
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
  const [addingJobToCategory, setAddingJobToCategory] = useState<string | null>(null)
  const [newJobData, setNewJobData] = useState({
    title: "",
    version: "",
    location: "",
    issueDate: new Date().toISOString().split('T')[0]
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  const toggleHighlight = (categoryId: string, jobId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            jobDescriptions: cat.jobDescriptions.map(j =>
              j.id === jobId ? { ...j, highlighted: !j.highlighted } : j
            )
          }
          : cat
      )
    )
  }

  const toggleApprove = (categoryId: string, jobId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            jobDescriptions: cat.jobDescriptions.map(j =>
              j.id === jobId ? { ...j, approved: !j.approved } : j
            )
          }
          : cat
      )
    )
  }

  const togglePause = (categoryId: string, jobId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            jobDescriptions: cat.jobDescriptions.map(j =>
              j.id === jobId ? { ...j, paused: !j.paused } : j
            )
          }
          : cat
      )
    )
  }

  const archiveJob = (categoryId: string, jobId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            jobDescriptions: cat.jobDescriptions.map(j =>
              j.id === jobId ? { ...j, archived: true, isArchived: true } : j
            )
          }
          : cat
      )
    )
  }

  const unarchiveJob = (categoryId: string, jobId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            jobDescriptions: cat.jobDescriptions.map(j =>
              j.id === jobId ? { ...j, archived: false, isArchived: false } : j
            )
          }
          : cat
      )
    )
  }

  const deleteJob = (categoryId: string, jobId: string) => {
    if (confirm("Are you sure you want to delete this job description?")) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              jobDescriptions: cat.jobDescriptions.filter(j => j.id !== jobId)
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
        jobDescriptions: []
      }
      setCategories(prev => [...prev, newCategory])
      setNewCategoryTitle("")
      setShowAddCategory(false)
    }
  }

  const addJobToCategory = (categoryId: string) => {
    if (newJobData.title.trim()) {
      const newJob = {
        id: `${categoryId}-${Date.now()}`,
        title: newJobData.title.trim(),
        version: newJobData.version.trim() || "v1.0",
        location: newJobData.location.trim() || "N/A",
        issueDate: newJobData.issueDate,
        highlighted: false,
        approved: false,
        paused: false
      }

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, jobDescriptions: [...cat.jobDescriptions, newJob] }
            : cat
        )
      )

      setNewJobData({
        title: "",
        version: "",
        location: "",
        issueDate: new Date().toISOString().split('T')[0]
      })
      setAddingJobToCategory(null)
    }
  }

  const sortJobs = (jobs: any[]) => {
    const sorted = [...jobs]
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
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Job Descriptions
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage your organizational job descriptions
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
            <Link href="/job-descriptions/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Job Description
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
              Active ({categories.reduce((acc, cat) => acc + cat.jobDescriptions.filter((j: any) => !j.archived && !j.isArchived).length, 0)})
            </button>
            <button
              className="px-6 py-3 font-semibold border-b-2 transition-all"
              style={{
                borderColor: showArchived ? COLORS.primary : "transparent",
                color: showArchived ? COLORS.primary : COLORS.textSecondary,
              }}
              onClick={() => setShowArchived(true)}
            >
              Archived ({categories.reduce((acc, cat) => acc + cat.jobDescriptions.filter((j: any) => j.archived || j.isArchived).length, 0)})
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => {
            const currentItemView = categoryItemView[category.id] ?? (showArchived ? "archived" : "active")
            const categoryJobs = category.jobDescriptions || []
            const activeJobs = categoryJobs.filter((j: any) => !j.archived && !j.isArchived)
            const archivedJobs = categoryJobs.filter((j: any) => j.archived || j.isArchived)
            const completedJobs = activeJobs.filter((j: any) => j.approved)
            const highlightedJobs = activeJobs.filter((j: any) => j.highlighted)
            const currentJobs =
              currentItemView === "archived"
                ? archivedJobs
                : currentItemView === "completed"
                  ? completedJobs
                  : currentItemView === "highlighted"
                    ? highlightedJobs
                    : activeJobs
            const sortedJobs = sortJobs(currentJobs)
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
                      {currentJobs.length} job descriptions
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
                        setAddingJobToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
                      title="Add Job Description"
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

                {/* Job Descriptions List */}
                {isExpanded && (
                  <div className="p-5">
                    <div className="mb-4 flex gap-2">
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "active" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "active" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "active" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "active" ? COLORS.primary : COLORS.border }}>Active ({activeJobs.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "archived" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "archived" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "archived" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "archived" ? COLORS.primary : COLORS.border }}>Archived ({archivedJobs.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "completed" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "completed" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "completed" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "completed" ? COLORS.primary : COLORS.border }}>Completed ({completedJobs.length})</button>
                      <button onClick={() => setCategoryItemView((prev) => ({ ...prev, [category.id]: "highlighted" }))} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all" style={{ background: currentItemView === "highlighted" ? COLORS.primaryGradient : COLORS.bgWhite, color: currentItemView === "highlighted" ? COLORS.textWhite : COLORS.textPrimary, borderColor: currentItemView === "highlighted" ? COLORS.primary : COLORS.border }}>Highlighted ({highlightedJobs.length})</button>
                    </div>
                    {/* Add Job Form */}
                    {addingJobToCategory === category.id && currentItemView === "active" && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add New Job Description
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Title *
                            </label>
                            <input
                              type="text"
                              value={newJobData.title}
                              onChange={(e) => setNewJobData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter job title..."
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
                              value={newJobData.version}
                              onChange={(e) => setNewJobData(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g., v1.0"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Location/Department
                            </label>
                            <input
                              type="text"
                              value={newJobData.location}
                              onChange={(e) => setNewJobData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="e.g., QMS"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => addJobToCategory(category.id)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.primary, color: COLORS.textWhite }}
                          >
                            Add Job Description
                          </button>
                          <button
                            onClick={() => setAddingJobToCategory(null)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {sortedJobs.length === 0 ? (
                      <div className="text-center py-12">
                        <Briefcase className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>
                          {isViewingArchivedItems ? "No archived job descriptions in this category" : currentItemView === "completed" ? "No completed job descriptions in this category" : currentItemView === "highlighted" ? "No highlighted job descriptions in this category" : "No job descriptions in this category"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedJobs.map((job) => (
                          <div
                            key={job.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: job.paused ? `${COLORS.warning}05` : job.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-100 p-1 rounded">
                              <GripVertical className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1">
                              <Link
                                href={`/job-descriptions/${job.id}`}
                                className="font-semibold hover:underline text-lg"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {job.title}
                              </Link>
                              <div className="flex gap-4 text-sm mt-1.5" style={{ color: COLORS.textSecondary }}>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Version:</span> {job.version}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Issued: {job.issueDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Location:</span> {job.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Actions */}
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => toggleHighlight(category.id, job.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: job.highlighted ? COLORS.warning : "#FEF3C7", color: job.highlighted ? COLORS.textWhite : "#92400E" }}><Star className="w-4 h-4" /></button>
                                <button onClick={() => toggleApprove(category.id, job.id)} title={job.approved ? "Mark as Incomplete" : "Mark as Completed"} className="p-2 rounded-lg hover:scale-105" style={{ background: job.approved ? COLORS.green500 : "#D1FAE5", color: job.approved ? COLORS.textWhite : "#065F46" }}><Check className="w-4 h-4" /></button>
                                <button onClick={() => togglePause(category.id, job.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: job.paused ? COLORS.warning : "#FEF3C7", color: job.paused ? COLORS.textWhite : "#92400E" }}><Pause className="w-4 h-4" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`/job-descriptions/${job.id}/edit`}><button className="p-2 rounded-lg hover:scale-105" style={{ background: "#DBEAFE", color: "#1E40AF" }}><Edit className="w-4 h-4" /></button></Link>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E5E7EB", color: "#374151" }}><Copy className="w-4 h-4" /></button>
                                <button className="p-2 rounded-lg hover:scale-105" style={{ background: "#E0E7FF", color: "#4338CA" }}><Download className="w-4 h-4" /></button>
                                {!isViewingArchivedItems ? (
                                  <button onClick={() => archiveJob(category.id, job.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#FFEDD5", color: "#9A3412" }}><Archive className="w-4 h-4" /></button>
                                ) : (
                                  <button onClick={() => unarchiveJob(category.id, job.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#DCFCE7", color: "#166534" }}><Archive className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => deleteJob(category.id, job.id)} className="p-2 rounded-lg hover:scale-105" style={{ background: "#FEE2E2", color: "#991B1B" }}><Trash2 className="w-4 h-4" /></button>
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

export default function JobDescriptionsPage() {
  return (
    <DynamicModulePage
      moduleSlug="job-descriptions"
      title="Job Descriptions"
      description="Manage role and responsibility documents"
      itemLabel="Job"
      icon={Briefcase}
      newItemHref="/job-descriptions/new"
      itemHrefPrefix="/job-descriptions"
    />
  )
}
