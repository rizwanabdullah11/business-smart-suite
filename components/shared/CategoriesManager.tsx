"use client"

import { useState } from "react"
import { Button } from "@/components/ui"
import { Plus, Edit2, Archive, Trash2 } from "lucide-react"

interface Category {
  id: string
  title: string
  archived?: boolean
  highlighted?: boolean
}

interface CategoriesManagerProps {
  categories: Category[]
  archivedCategories?: Category[]
  onAddCategory: (title: string) => Promise<{ success: boolean; error?: string }>
  onEditCategory: (id: string, title: string) => Promise<{ success: boolean; error?: string }>
  onDeleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>
  onArchiveCategory: (id: string) => Promise<{ success: boolean; error?: string }>
  onUnarchiveCategory?: (id: string) => Promise<{ success: boolean; error?: string }>
  renderCategoryContent?: (category: Category) => React.ReactNode
  showArchived?: boolean
}

export function CategoriesManager({
  categories,
  archivedCategories = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onArchiveCategory,
  onUnarchiveCategory,
  renderCategoryContent,
  showArchived = true,
}: CategoriesManagerProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleAddCategory = async () => {
    if (!newCategoryTitle.trim()) return

    setLoading("add")
    setError(null)
    const result = await onAddCategory(newCategoryTitle)
    setLoading(null)
    
    if (result.success) {
      setNewCategoryTitle("")
      setIsAddingCategory(false)
    } else {
      setError(result.error || "Failed to add category")
    }
  }

  const handleEditCategory = async (id: string) => {
    if (!editingTitle.trim()) return

    setLoading(`edit-${id}`)
    setError(null)
    const result = await onEditCategory(id, editingTitle)
    setLoading(null)
    
    if (result.success) {
      setEditingCategoryId(null)
      setEditingTitle("")
    } else {
      setError(result.error || "Failed to edit category")
    }
  }

  const handleArchiveCategory = async (id: string) => {
    setLoading(`archive-${id}`)
    setError(null)
    console.log("Archiving category:", id)
    const result = await onArchiveCategory(id)
    setLoading(null)
    
    if (!result.success) {
      setError(result.error || "Failed to archive category")
      console.error("Archive failed:", result.error)
    } else {
      console.log("Archive successful")
    }
  }

  const handleUnarchiveCategory = async (id: string) => {
    if (!onUnarchiveCategory) return
    
    setLoading(`unarchive-${id}`)
    setError(null)
    const result = await onUnarchiveCategory(id)
    setLoading(null)
    
    if (!result.success) {
      setError(result.error || "Failed to unarchive category")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    
    setLoading(`delete-${id}`)
    setError(null)
    const result = await onDeleteCategory(id)
    setLoading(null)
    
    if (!result.success) {
      setError(result.error || "Failed to delete category")
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Button onClick={() => setIsAddingCategory(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isAddingCategory && (
        <div className="flex gap-2 p-4 border rounded-lg">
          <input
            type="text"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 border rounded"
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <Button onClick={handleAddCategory} disabled={loading === "add"}>
            {loading === "add" ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
            Cancel
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              {editingCategoryId === category.id ? (
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                    onKeyDown={(e) => e.key === "Enter" && handleEditCategory(category.id)}
                  />
                  <Button 
                    onClick={() => handleEditCategory(category.id)}
                    disabled={loading === `edit-${category.id}`}
                  >
                    {loading === `edit-${category.id}` ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingCategoryId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium">{category.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCategoryId(category.id)
                        setEditingTitle(category.title)
                      }}
                      disabled={loading !== null}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchiveCategory(category.id)}
                      disabled={loading === `archive-${category.id}`}
                      title="Archive category"
                    >
                      {loading === `archive-${category.id}` ? "..." : <Archive className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={loading === `delete-${category.id}`}
                    >
                      {loading === `delete-${category.id}` ? "..." : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </>
              )}
            </div>
            {renderCategoryContent && renderCategoryContent(category)}
          </div>
        ))}
      </div>

      {showArchived && archivedCategories.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Archived Categories</h2>
          <div className="space-y-2">
            {archivedCategories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-600">{category.title}</h3>
                  <div className="flex gap-2">
                    {onUnarchiveCategory && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchiveCategory(category.id)}
                        disabled={loading === `unarchive-${category.id}`}
                      >
                        {loading === `unarchive-${category.id}` ? "..." : "Unarchive"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={loading === `delete-${category.id}`}
                    >
                      {loading === `delete-${category.id}` ? "..." : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
