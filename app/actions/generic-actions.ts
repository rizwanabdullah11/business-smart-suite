"use server"

import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

async function getHeaders() {
  const token = ""
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Category actions - all modules use /categories endpoint
export async function addCategory(title: string, revalidatePath_: string) {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify({ name: title }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`)
    }

    const category = await response.json()
    revalidatePath(revalidatePath_)

    return {
      success: true,
      category: {
        id: category._id,
        title: category.name,
        archived: category.isArchived || false,
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
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "PUT",
      headers: await getHeaders(),
      body: JSON.stringify({ name: newTitle }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`)
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
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
      headers: await getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.statusText}`)
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
    console.log(`Archiving category: ${id}`)
    console.log(`API URL: ${API_URL}/categories/${id}/archive`)
    
    const response = await fetch(`${API_URL}/categories/${id}/archive`, {
      method: "POST",
      headers: await getHeaders(),
    })

    console.log(`Archive response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Archive failed: ${response.status} - ${errorText}`)
      throw new Error(`Failed to archive category: ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Archive result:", result)
    
    revalidatePath(revalidatePath_)
    return { success: true }
  } catch (error) {
    console.error("Error archiving category:", error)
    return { success: false, error: String(error) }
  }
}

export async function unarchiveCategory(id: string, revalidatePath_: string) {
  try {
    const response = await fetch(`${API_URL}/categories/${id}/unarchive`, {
      method: "POST",
      headers: await getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to unarchive category: ${response.statusText}`)
    }

    revalidatePath(revalidatePath_)
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving category:", error)
    return { success: false, error: String(error) }
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getArchivedCategories() {
  try {
    const response = await fetch(`${API_URL}/categories/archived/all`, {
      headers: await getHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch archived categories: ${response.statusText}`)
    }

    return await response.json()
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
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create item: ${response.statusText}`)
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
