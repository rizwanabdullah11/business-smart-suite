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

interface ProceduresModuleProps {
  initialCategories: any[]
  initialArchivedCategories?: any[]
}

// Different form fields for procedures
const procedureFormFields: FormField[] = [
  {
    name: "title",
    label: "Procedure Title",
    type: "text",
    required: true,
    placeholder: "Enter procedure title",
  },
  {
    name: "procedureNumber",
    label: "Procedure Number",
    type: "text",
    required: true,
    placeholder: "e.g., PROC-001",
  },
  {
    name: "version",
    label: "Version",
    type: "text",
    required: true,
    placeholder: "e.g., v1.0",
  },
  {
    name: "effectiveDate",
    label: "Effective Date",
    type: "date",
    required: true,
  },
  {
    name: "owner",
    label: "Owner",
    type: "text",
    required: false,
    placeholder: "Procedure owner",
  },
]

export function ProceduresModule({ initialCategories, initialArchivedCategories = [] }: ProceduresModuleProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [addingProcedureToCategoryId, setAddingProcedureToCategoryId] = useState<string | null>(null)

  const handleAddCategory = async (title: string) => {
    return await addCategory(title, "/procedures")
  }

  const handleEditCategory = async (id: string, title: string) => {
    return await editCategory(id, title, "/procedures")
  }

  const handleDeleteCategory = async (id: string) => {
    return await deleteCategory(id, "/procedures")
  }

  const handleArchiveCategory = async (id: string) => {
    return await archiveCategory(id, "/procedures")
  }

  const handleUnarchiveCategory = async (id: string) => {
    return await unarchiveCategory(id, "/procedures")
  }

  const handleAddProcedure = async (categoryId: string, data: any) => {
    const result = await addItem(
      "procedures",
      {
        ...data,
        category: categoryId,
      },
      "/procedures"
    )

    if (result.success) {
      setAddingProcedureToCategoryId(null)
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
          {addingProcedureToCategoryId === category.id ? (
            <DynamicForm
              fields={procedureFormFields}
              onSubmit={(data) => handleAddProcedure(category.id, data)}
              onCancel={() => setAddingProcedureToCategoryId(null)}
              submitLabel="Add Procedure"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddingProcedureToCategoryId(category.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Procedure
            </Button>
          )}
        </div>
      )}
    />
  )
}
