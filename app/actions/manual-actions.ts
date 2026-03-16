"use server"

import { revalidatePath } from "next/cache"

const API_URL = process.env.INTERNAL_API_URL || "http://localhost:3000/api"

async function getHeaders() {
  // In a real app, get token from cookies or session
  const token = ""
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function addCategory(title: string) {
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
    revalidatePath("/manual")

    return {
      success: true,
      category: {
        id: category._id,
        title: category.name,
        manuals: [],
        highlighted: false,
        archived: false,
      },
    }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: String(error) }
  }
}

export async function editCategory(categoryId: string, newTitle: string) {
  try {
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "PUT",
      headers: await getHeaders(),
      body: JSON.stringify({ name: newTitle }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`)
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: String(error) }
  }
}

export async function addManual(categoryId: string, data: any) {
  try {
    const response = await fetch(`${API_URL}/manuals`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify({
        title: data.title,
        version: data.version,
        location: data.location,
        issueDate: data.issueDate,
        category: categoryId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create manual: ${response.statusText}`)
    }

    const manual = await response.json()
    revalidatePath("/manual")

    return {
      success: true,
      manual: {
        id: manual._id,
        title: manual.title,
        version: manual.version,
        issueDate: manual.issueDate,
        location: manual.location,
        highlighted: false,
        approved: false,
      },
    }
  } catch (error) {
    console.error("Error adding manual:", error)
    return { success: false, error: String(error) }
  }
}

export async function toggleHighlight(id: string, type: string = "manual") {
  try {
    if (type === "manual") {
      // Update manual highlight status
      const response = await fetch(`${API_URL}/manuals/${id}`, {
        method: "PUT",
        headers: await getHeaders(),
        body: JSON.stringify({ highlighted: true }),
      })

      if (!response.ok) {
        throw new Error(`Failed to toggle highlight: ${response.statusText}`)
      }
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: String(error) }
  }
}

export async function approveManual(id: string) {
  try {
    const response = await fetch(`${API_URL}/manuals/${id}`, {
      method: "PUT",
      headers: await getHeaders(),
      body: JSON.stringify({ approved: true }),
    })

    if (!response.ok) {
      throw new Error(`Failed to approve manual: ${response.statusText}`)
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error approving manual:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteItem(id: string, type: string) {
  try {
    const endpoint = type === "category" ? "categories" : "manuals"
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: "DELETE",
      headers: await getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete ${type}: ${response.statusText}`)
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting ${type}:`, error)
    return { success: false, error: String(error) }
  }
}

export async function archiveItem(id: string, type: string) {
  try {
    const endpoint = type === "category" ? "categories" : "manuals"
    const response = await fetch(`${API_URL}/${endpoint}/${id}/archive`, {
      method: "POST",
      headers: await getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to archive ${type}: ${response.statusText}`)
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error(`Error archiving ${type}:`, error)
    return { success: false, error: String(error) }
  }
}

export async function unarchiveItem(id: string, type: string) {
  try {
    const endpoint = type === "category" ? "categories" : "manuals"
    const response = await fetch(`${API_URL}/${endpoint}/${id}/unarchive`, {
      method: "POST",
      headers: await getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to unarchive ${type}: ${response.statusText}`)
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error(`Error unarchiving ${type}:`, error)
    return { success: false, error: String(error) }
  }
}

export async function reorderItem(
  id: string,
  type: string = "manual",
  direction: string = "down"
) {
  try {
    // Reordering logic would depend on your backend implementation
    // This is a placeholder that might need adjustment
    console.log(`Reordering ${type} ${id} with direction ${direction}`)
    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error reordering item:", error)
    return { success: false, error: String(error) }
  }
}
