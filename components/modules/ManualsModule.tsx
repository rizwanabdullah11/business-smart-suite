"use client"

import { CategoriesManager } from "@/components/shared/CategoriesManager"
import { DynamicForm, FormField } from "@/components/shared/DynamicForm"
import { 
  addCategory, 
  editCategory, 
  deleteCategory, 
  archiveCategory,
  unarchiveCategory,
  addItem 
} from "@/services/category-api"
import { useState } from "react"
import { Button } from "@/components/ui"
import { Plus } from "lucide-react"

interface ManualsModuleProps {
  initialCategories: any[]
  initialArchivedCategories?: any[]
}

const manualFormFields: FormField[] = [
  {
    name: "title",
    label: "Manual Title",
    type: "text",
    required: true,
    placeholder: "Enter manual title",
  },
  {
    name: "version",
    label: "Version",
    type: "text",
    required: true,
    placeholder: "e.g., v1.0",
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    required: true,
    placeholder: "e.g., QMS",
  },
  {
    name: "issueDate",
    label: "Issue Date",
    type: "date",
    required: true,
  },
]

export function ManualsModule({ initialCategories, initialArchivedCategories = [] }: ManualsModuleProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [addingManualToCategoryId, setAddingManualToCategoryId] = useState<string | null>(null)

  const handleAddCategory = async (title: string) => {
    return await addCategory(title, "/manual")
  }

  const handleEditCategory = async (id: string, title: string) => {
    return await editCategory(id, title, "/manual")
  }

  const handleDeleteCategory = async (id: string) => {
    return await deleteCategory(id, "/manual")
  }

  const handleArchiveCategory = async (id: string) => {
    return await archiveCategory(id, "/manual")
  }

  const handleUnarchiveCategory = async (id: string) => {
    return await unarchiveCategory(id, "/manual")
  }

  const handleAddManual = async (categoryId: string, data: any) => {
    const result = await addItem(
      "manuals",
      {
        ...data,
        category: categoryId,
      },
      "/manual"
    )

    if (result.success) {
      setAddingManualToCategoryId(null)
    }

    return result
  }

  return (
    <CategoriesManager
      categories={categories}
      archivedCategories={initialArchivedCategories}
      onAddCategory={handleAddCategory}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
      onArchiveCategory={handleArchiveCategory}
      onUnarchiveCategory={handleUnarchiveCategory}
      renderCategoryContent={(category) => (
        <div className="mt-4">
          {addingManualToCategoryId === category.id ? (
            <DynamicForm
              fields={manualFormFields}
              onSubmit={(data) => handleAddManual(category.id, data)}
              onCancel={() => setAddingManualToCategoryId(null)}
              submitLabel="Add Manual"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddingManualToCategoryId(category.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manual
            </Button>
          )}
        </div>
      )}
    />
  )
}
