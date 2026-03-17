"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:3000/api"

async function getServerHeaders() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value || ""
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Category operations
export async function addCategory(title: string, revalidatePath_: string) {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: await getServerHeaders(),
      body: JSON.stringify({ name: title }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create category: ${response.statusText}`)
    }

    const category = await response.json()
    revalidatePath(revalidatePath_)

    return {
      success: true,
      category: {
        id: category._id || category.data?._id,
        title: category.name || category.data?.name,
        archived: category.isArchived || category.data?.isArchived || false,
      },
    }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: String(error) }
  }
}

export async function editCategory(
  categoryId: string,
  newTitle: string,
  revalidatePath_: string
) {
  try {
    const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: "PUT",
      headers: await getServerHeaders(),
      body: JSON.stringify({ name: newTitle }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to update category: ${response.statusText}`)
    }

    revalidatePath(revalidatePath_)
    return { success: true }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteCategory(id: string, revalidatePath_: string) {
  try {
    const response = await fetch(`${BASE_URL}/categories/${id}`, {
      method: "DELETE",
      headers: await getServerHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to delete category: ${response.statusText}`)
    }

    revalidatePath(revalidatePath_)
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: String(error) }
  }
}

export async function archiveCategory(id: string, revalidatePath_: string) {
  try {
    console.log(`[Server] Archiving category: ${id}`)
    console.log(`[Server] API URL: ${BASE_URL}/categories/${id}/archive`)
    
    const response = await fetch(`${BASE_URL}/categories/${id}/archive`, {
      method: "POST",
      headers: await getServerHeaders(),
    })

    console.log(`[Server] Archive response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Server] Archive failed: ${response.status} - ${errorText}`)
      throw new Error(`Failed to archive category: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[Server] Archive result:", result)
    
    revalidatePath(revalidatePath_)
    return { success: true, data: result }
  } catch (error) {
    console.error("[Server] Error archiving category:", error)
    return { success: false, error: String(error) }
  }
}

export async function unarchiveCategory(id: string, revalidatePath_: string) {
  try {
    console.log(`[Server] Unarchiving category: ${id}`)
    
    const response = await fetch(`${BASE_URL}/categories/${id}/unarchive`, {
      method: "POST",
      headers: await getServerHeaders(),
    })

    console.log(`[Server] Unarchive response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Server] Unarchive failed: ${response.status} - ${errorText}`)
      throw new Error(`Failed to unarchive category: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[Server] Unarchive result:", result)
    
    revalidatePath(revalidatePath_)
    return { success: true, data: result }
  } catch (error) {
    console.error("[Server] Error unarchiving category:", error)
    return { success: false, error: String(error) }
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      headers: await getServerHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getArchivedCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories/archived/all`, {
      headers: await getServerHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch archived categories: ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching archived categories:", error)
    return []
  }
}

// Generic item creation for different modules (manuals, policies, etc.)
export async function addItem(
  endpoint: string,
  data: any,
  revalidatePath_: string
) {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: await getServerHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create item: ${response.statusText}`)
    }

    const item = await response.json()
    revalidatePath(revalidatePath_)

    return {
      success: true,
      item,
    }
  } catch (error) {
    console.error("Error adding item:", error)
    return { success: false, error: String(error) }
  }
}
