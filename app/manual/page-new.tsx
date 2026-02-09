import { Suspense } from "react"
import ManualsClient from "@/components/manuals-client"

interface Category {
  id: string
  title: string
  manuals: Manual[]
  highlighted?: boolean
  archived?: boolean
}

interface Manual {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  highlighted: boolean
  approved: boolean
}

async function getManualData() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    
    const [categoriesRes, manualsRes] = await Promise.all([
      fetch(`${API_URL}/categories`, {
        cache: "no-store",
      }),
      fetch(`${API_URL}/manuals`, {
        cache: "no-store",
      }),
    ])

    if (!categoriesRes.ok || !manualsRes.ok) {
      console.error("Failed to fetch from backend")
      return { categories: [], archivedCategories: [] }
    }

    const categories = await categoriesRes.json()
    const manuals = await manualsRes.json()

    // Merge manuals within categories
    const mergedCategories = (categories || []).map((cat: any) => ({
      id: cat._id,
      title: cat.name,
      archived: cat.archived || false,
      highlighted: cat.highlighted || false,
      manuals: (manuals || [])
        .filter((m: any) => m.category?._id === cat._id || m.categoryId === cat._id)
        .map((m: any) => ({
          id: m._id,
          title: m.title,
          version: m.version,
          issueDate: m.issueDate,
          location: m.location,
          highlighted: m.highlighted || false,
          approved: m.approved || false,
        })),
    }))

    // Separate archived and active categories
    const activeCategories = mergedCategories.filter((cat: any) => !cat.archived)
    const archivedCategories = mergedCategories.filter((cat: any) => cat.archived)

    return {
      categories: activeCategories,
      archivedCategories,
    }
  } catch (error) {
    console.error("Error fetching manual data:", error)
    return { categories: [], archivedCategories: [] }
  }
}

export default async function ManualPage() {
  const { categories, archivedCategories } = await getManualData()

  return (
    <Suspense fallback={<div className="p-4">Loading manuals...</div>}>
      <ManualsClient
        categories={categories}
        archivedCategories={archivedCategories}
        canEdit={true}
        canDelete={true}
      />
    </Suspense>
  )
}
