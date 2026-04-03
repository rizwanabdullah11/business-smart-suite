"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FolderOpen, Plus, Archive, Edit, Trash2, Download, ArrowLeft } from "lucide-react"
import { COLORS } from "@/constant/colors"
import { useAuth } from "@/contexts/auth-context"

export function DocumentsModule() {
  const { isEmployee } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [archivedCategories, setArchivedCategories] = useState<any[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [addingDocumentToCategory, setAddingDocumentToCategory] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [newDocumentData, setNewDocumentData] = useState({
    title: "",
    description: "",
    uploadDate: new Date().toISOString().split('T')[0]
  })

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token")

      const [catRes, archivedCatRes, docRes, archivedRes] = await Promise.all([
        fetch("/api/categories?type=document", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        !isEmployee
          ? fetch("/api/categories?type=document&archived=true", {
              credentials: "include",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : Promise.resolve(null),
        fetch("/api/documents", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        !isEmployee
          ? fetch("/api/documents/archived/all", {
              credentials: "include",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : Promise.resolve(null),
      ])

      const activeCategoriesData = await catRes.json()
      const archivedCategoriesData = archivedCatRes && archivedCatRes.ok ? await archivedCatRes.json() : []
      const documentsData = await docRes.json()
      const archivedData = archivedRes && archivedRes.ok ? await archivedRes.json() : []

      const allCategories = [...activeCategoriesData, ...archivedCategoriesData].map((cat: any) => {
        const categoryId = String(cat._id)
        const categoryDocuments = documentsData
          .filter((d: any) => String(d.category?._id || d.categoryId || d.category) === categoryId && !d.archived)
          .map((d: any) => ({
            id: d._id,
            title: d.title,
            description: d.description,
            uploadDate: d.uploadDate,
            fileData: d.fileData,
            fileName: d.fileName,
            fileType: d.fileType,
          }))

        const categoryArchivedDocuments = archivedData
          .filter((d: any) => String(d.category?._id || d.categoryId || d.category) === categoryId)
          .map((d: any) => ({
            id: d._id,
            title: d.title,
            description: d.description,
            uploadDate: d.uploadDate,
            fileData: d.fileData,
            fileName: d.fileName,
            fileType: d.fileType,
          }))

        return {
          id: categoryId,
          title: cat.name,
          isArchived: Boolean(cat.isArchived || cat.archived),
          documents: categoryDocuments,
          archivedDocuments: categoryArchivedDocuments,
        }
      })

      const merged = allCategories.filter((cat: any) => !cat.isArchived)
      const mergedArchived = allCategories.filter((cat: any) => cat.isArchived)

      setCategories(merged)
      setArchivedCategories(mergedArchived)
    } catch (err) {
      console.error("Error loading documents:", err)
    }
  }

  useEffect(() => {
    loadData()
  }, [isEmployee])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategoryTitle,
          type: "document",
        }),
      })

      if (!response.ok) throw new Error("Failed to add category")

      setNewCategoryTitle("")
      setShowAddCategory(false)
      await loadData()
    } catch (err) {
      console.error("Error adding category:", err)
      alert("Failed to add category")
    }
  }

  const addDocumentToCategory = async (categoryId: string) => {
    if (!newDocumentData.title.trim()) {
      alert("Please enter a document title")
      return
    }

    try {
      const token = localStorage.getItem("token")

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newDocumentData.title,
          description: newDocumentData.description,
          uploadDate: newDocumentData.uploadDate,
          category: categoryId,
        }),
      })

      if (!response.ok) throw new Error("Failed to add document")

      setAddingDocumentToCategory(null)
      setNewDocumentData({
        title: "",
        description: "",
        uploadDate: new Date().toISOString().split('T')[0],
      })
      await loadData()
    } catch (err) {
      console.error("Error adding document:", err)
      alert("Failed to add document")
    }
  }

  const deleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete document")

      await loadData()
    } catch (err) {
      console.error("Error deleting document:", err)
      alert("Failed to delete document")
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/categories/${categoryId}?type=document`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete category")

      await loadData()
    } catch (err) {
      console.error("Error deleting category:", err)
      alert("Failed to delete category")
    }
  }

  const visibleCategories = showArchived ? archivedCategories : categories

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #f7f8fb 0%, #f3f5f9 100%)" }}
    >
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <FolderOpen className="h-6 w-6" style={{ color: COLORS.blue600 }} />
                <h1
                  className="text-2xl font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  Documents
                </h1>
              </div>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Manage your document library
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isEmployee && (
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: showArchived ? COLORS.blue600 : COLORS.bgWhite,
                  color: showArchived ? "#ffffff" : COLORS.textPrimary,
                  border: `1px solid ${showArchived ? COLORS.blue600 : COLORS.border}`,
                }}
              >
                <Archive className="h-4 w-4" />
                {showArchived ? "Show Active" : "Show Archived"}
              </button>
            )}

            {!isEmployee && (
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: COLORS.blue600 }}
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            )}
          </div>
        </div>

        {showAddCategory && (
          <div
            className="mb-4 rounded-xl p-4"
            style={{
              background: COLORS.bgWhite,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <input
              type="text"
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
              placeholder="Category name"
              className="mb-2 w-full rounded-lg px-3 py-2 text-sm"
              style={{
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgWhite,
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={addCategory}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ background: COLORS.blue600 }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryTitle("")
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{
                  background: COLORS.bgWhite,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textSecondary,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="overflow-hidden rounded-xl"
              style={{
                background: COLORS.bgWhite,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <h3 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                  {category.title}
                </h3>
                <div className="flex items-center gap-2">
                  {!isEmployee && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCategory(category.id)
                      }}
                      className="rounded-lg p-2 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {expandedCategories.includes(category.id) && (
                <div className="border-t p-4" style={{ borderColor: COLORS.border }}>
                  {!isEmployee && (
                    <button
                      onClick={() => setAddingDocumentToCategory(category.id)}
                      className="mb-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                      style={{ background: COLORS.blue600 }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Document
                    </button>
                  )}

                  {addingDocumentToCategory === category.id && (
                    <div className="mb-4 space-y-2 rounded-lg p-4" style={{ background: COLORS.bgGray }}>
                      <input
                        type="text"
                        value={newDocumentData.title}
                        onChange={(e) =>
                          setNewDocumentData({ ...newDocumentData, title: e.target.value })
                        }
                        placeholder="Document title"
                        className="w-full rounded-lg px-3 py-2 text-sm"
                        style={{ border: `1px solid ${COLORS.border}` }}
                      />
                      <input
                        type="text"
                        value={newDocumentData.description}
                        onChange={(e) =>
                          setNewDocumentData({ ...newDocumentData, description: e.target.value })
                        }
                        placeholder="Description"
                        className="w-full rounded-lg px-3 py-2 text-sm"
                        style={{ border: `1px solid ${COLORS.border}` }}
                      />
                      <input
                        type="date"
                        value={newDocumentData.uploadDate}
                        onChange={(e) =>
                          setNewDocumentData({ ...newDocumentData, uploadDate: e.target.value })
                        }
                        className="w-full rounded-lg px-3 py-2 text-sm"
                        style={{ border: `1px solid ${COLORS.border}` }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addDocumentToCategory(category.id)}
                          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                          style={{ background: COLORS.blue600 }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setAddingDocumentToCategory(null)}
                          className="rounded-lg px-4 py-2 text-sm font-medium"
                          style={{
                            background: COLORS.bgWhite,
                            border: `1px solid ${COLORS.border}`,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {category.documents?.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ background: COLORS.bgGray }}
                      >
                        <div>
                          <h4 className="font-medium" style={{ color: COLORS.textPrimary }}>
                            {doc.title}
                          </h4>
                          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                            {doc.description}
                          </p>
                        </div>
                        {!isEmployee && (
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="rounded-lg p-2 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
