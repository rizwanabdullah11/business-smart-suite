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

interface PoliciesModuleProps {
  initialCategories: any[]
  initialArchivedCategories?: any[]
}

// Different form fields for policies
const policyFormFields: FormField[] = [
  {
    name: "title",
    label: "Policy Title",
    type: "text",
    required: true,
    placeholder: "Enter policy title",
  },
  {
    name: "policyNumber",
    label: "Policy Number",
    type: "text",
    required: true,
    placeholder: "e.g., POL-001",
  },
  {
    name: "effectiveDate",
    label: "Effective Date",
    type: "date",
    required: true,
  },
  {
    name: "reviewDate",
    label: "Review Date",
    type: "date",
    required: false,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter policy description",
  },
]

export function PoliciesModule({ initialCategories, initialArchivedCategories = [] }: PoliciesModuleProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [addingPolicyToCategoryId, setAddingPolicyToCategoryId] = useState<string | null>(null)

  const handleAddCategory = async (title: string) => {
    return await addCategory(title, "/policies")
  }

  const handleEditCategory = async (id: string, title: string) => {
    return await editCategory(id, title, "/policies")
  }

  const handleDeleteCategory = async (id: string) => {
    return await deleteCategory(id, "/policies")
  }

  const handleArchiveCategory = async (id: string) => {
    return await archiveCategory(id, "/policies")
  }

  const handleUnarchiveCategory = async (id: string) => {
    return await unarchiveCategory(id, "/policies")
  }

  const handleAddPolicy = async (categoryId: string, data: any) => {
    const result = await addItem(
      "policies",
      {
        ...data,
        category: categoryId,
      },
      "/policies"
    )

    if (result.success) {
      setAddingPolicyToCategoryId(null)
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
          {addingPolicyToCategoryId === category.id ? (
            <DynamicForm
              fields={policyFormFields}
              onSubmit={(data) => handleAddPolicy(category.id, data)}
              onCancel={() => setAddingPolicyToCategoryId(null)}
              submitLabel="Add Policy"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddingPolicyToCategoryId(category.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          )}
        </div>
      )}
    />
  )
}
