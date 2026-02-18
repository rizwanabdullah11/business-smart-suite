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
  ArrowUpDown,
  Calendar,
  Type,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Award,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { COLORS } from "@/constant/colors"

// Sample data
const initialCategories = [
  {
    id: "1",
    title: "Compliance Certificates",
    certificates: [
      { id: "1-1", title: "ISO 9001:2015", version: "v2024", issueDate: "2024-01-15", expiryDate: "2025-01-15", location: "QMS", highlighted: true, approved: true, paused: false },
      { id: "1-2", title: "ISO 14001:2015", version: "v2024", issueDate: "2024-02-01", expiryDate: "2025-02-01", location: "ENV", highlighted: false, approved: true, paused: false },
    ]
  },
  {
    id: "2",
    title: "Equipment Certificates",
    certificates: [
      { id: "2-1", title: "Calibration Certificate A", version: "v1.0", issueDate: "2024-03-10", expiryDate: "2025-03-10", location: "LAB", highlighted: false, approved: true, paused: false },
      { id: "2-2", title: "Safety Inspection Cert", version: "v1.2", issueDate: "2024-04-05", expiryDate: "2024-10-05", location: "OPS", highlighted: false, approved: false, paused: true },
    ]
  },
]

type SortType = "name" | "date"

export default function CertificatePage() {
  const [categories, setCategories] = useState(initialCategories)
  const [showArchived, setShowArchived] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1"])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [addingCertToCategory, setAddingCertToCategory] = useState<string | null>(null)
  const [newCertData, setNewCertData] = useState({
    title: "",
    version: "",
    location: "",
    expiryDate: "",
    issueDate: new Date().toISOString().split('T')[0]
  })

  // Helper functions (same logic as Manual/Policies but adapted for certificates)
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  const toggleHighlight = (categoryId: string, certId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            certificates: cat.certificates.map(c =>
              c.id === certId ? { ...c, highlighted: !c.highlighted } : c
            )
          }
          : cat
      )
    )
  }

  const toggleApprove = (categoryId: string, certId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            certificates: cat.certificates.map(c =>
              c.id === certId ? { ...c, approved: !c.approved } : c
            )
          }
          : cat
      )
    )
  }

  const togglePause = (categoryId: string, certId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            certificates: cat.certificates.map(c =>
              c.id === certId ? { ...c, paused: !c.paused } : c
            )
          }
          : cat
      )
    )
  }

  const deleteCertificate = (categoryId: string, certId: string) => {
    if (confirm("Are you sure you want to delete this certificate?")) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
              ...cat,
              certificates: cat.certificates.filter(c => c.id !== certId)
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
        certificates: []
      }
      setCategories(prev => [...prev, newCategory])
      setNewCategoryTitle("")
      setShowAddCategory(false)
    }
  }

  const addCertToCategory = (categoryId: string) => {
    if (newCertData.title.trim()) {
      const newCert = {
        id: `${categoryId}-${Date.now()}`,
        title: newCertData.title.trim(),
        version: newCertData.version.trim() || "v1.0",
        location: newCertData.location.trim() || "N/A",
        issueDate: newCertData.issueDate,
        expiryDate: newCertData.expiryDate || new Date(Date.now() + 31536000000).toISOString().split('T')[0], // +1 year
        highlighted: false,
        approved: false,
        paused: false
      }

      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, certificates: [...cat.certificates, newCert] }
            : cat
        )
      )

      setNewCertData({
        title: "",
        version: "",
        location: "",
        expiryDate: "",
        issueDate: new Date().toISOString().split('T')[0]
      })
      setAddingCertToCategory(null)
    }
  }

  const sortCertificates = (certs: any[]) => {
    const sorted = [...certs]
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
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: COLORS.textPrimary }}>
                Certificates
              </h1>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage your compliance and equipment certificates
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
            <Link href="/certificate/new">
              <button
                className="px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                style={{
                  background: COLORS.primary,
                  color: COLORS.textWhite,
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Certificate
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
              Active ({categories.reduce((acc, cat) => acc + cat.certificates.length, 0)})
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
            const sortedCerts = sortCertificates(category.certificates)
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
                      {category.certificates.length} certificates
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
                        setAddingCertToCategory(category.id)
                        if (!expandedCategories.includes(category.id)) {
                          setExpandedCategories(prev => [...prev, category.id])
                        }
                      }}
                      className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                      title="Add Certificate"
                      style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="p-2.5 rounded-lg transition-all hover:scale-110 shadow-sm border border-white/20 cursor-pointer"
                      title="Archive Category"
                      style={{ background: COLORS.bgWhite, color: COLORS.indigo600 }}
                    >
                      <Archive className="w-5 h-5" />
                    </button>
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

                {/* Certificates List */}
                {isExpanded && (
                  <div className="p-5">
                    {/* Add Certificate Form */}
                    {addingCertToCategory === category.id && (
                      <div
                        className="mb-5 p-5 rounded-xl shadow-sm"
                        style={{
                          background: COLORS.bgGray,
                          border: `2px dashed ${COLORS.border}`,
                        }}
                      >
                        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
                          Add New Certificate
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Title *
                            </label>
                            <input
                              type="text"
                              value={newCertData.title}
                              onChange={(e) => setNewCertData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter certificate title..."
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
                              value={newCertData.version}
                              onChange={(e) => setNewCertData(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g., v1.0"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Location
                            </label>
                            <input
                              type="text"
                              value={newCertData.location}
                              onChange={(e) => setNewCertData(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="e.g., QMS"
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                              Expiry Date
                            </label>
                            <input
                              type="date"
                              value={newCertData.expiryDate}
                              onChange={(e) => setNewCertData(prev => ({ ...prev, expiryDate: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ borderColor: COLORS.border }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => addCertToCategory(category.id)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.primary, color: COLORS.textWhite }}
                          >
                            Add Certificate
                          </button>
                          <button
                            onClick={() => setAddingCertToCategory(null)}
                            className="px-6 py-2.5 rounded-lg font-medium hover:shadow-md transition-all"
                            style={{ background: COLORS.bgWhite, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {sortedCerts.length === 0 ? (
                      <div className="text-center py-12">
                        <Award className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.textLight }} />
                        <p className="font-medium" style={{ color: COLORS.textSecondary }}>No certificates in this category</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedCerts.map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-center gap-3 p-4 rounded-lg hover:shadow-md transition-all"
                            style={{
                              background: cert.paused ? `${COLORS.warning}05` : cert.highlighted ? `${COLORS.primary}05` : COLORS.bgWhite,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button className="cursor-move hover:bg-gray-100 h-10 w-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300">
                              <GripVertical className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
                            </button>
                            <div className="flex-1">
                              <Link
                                href={`/certificate/${cert.id}`}
                                className="font-semibold hover:underline text-lg"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {cert.title}
                              </Link>
                              <div className="flex gap-4 text-sm mt-1.5" style={{ color: COLORS.textSecondary }}>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Version:</span> {cert.version}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Issued: {cert.issueDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Expires: {cert.expiryDate}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Location:</span> {cert.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Actions */}
                              <div className="flex items-center gap-1 mr-2">
                                <button onClick={() => toggleHighlight(category.id, cert.id)} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: cert.highlighted ? "#EAB308" : "#D1D5DB" }}><Star className="w-5 h-5" /></button>
                                <button onClick={() => toggleApprove(category.id, cert.id)} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: cert.approved ? "#22C55E" : "#D1D5DB" }}><Check className="w-5 h-5" /></button>
                                <button onClick={() => togglePause(category.id, cert.id)} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: cert.paused ? "#F59E0B" : "#D1D5DB" }}><Pause className="w-5 h-5" /></button>
                              </div>
                              <div className="w-px h-6 bg-gray-300 mx-1"></div>
                              <div className="flex items-center gap-1">
                                <Link href={`/certificate/${cert.id}/edit`}><button className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#3B82F6" }}><Edit className="w-5 h-5" /></button></Link>
                                <button className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#6B7280" }}><Copy className="w-5 h-5" /></button>
                                <button className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#3B82F6" }}><Download className="w-5 h-5" /></button>
                                <button onClick={() => deleteCertificate(category.id, cert.id)} className="h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 bg-white border border-gray-200" style={{ color: "#F97316" }}><Trash2 className="w-5 h-5" /></button>
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