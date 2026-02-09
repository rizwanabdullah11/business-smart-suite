/**
 * Manuals API Integration Module
 * 
 * This module provides utility functions for interacting with the backend Manuals API.
 * It handles authentication, error handling, and data transformation.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: any
  headers?: Record<string, string>
  token?: string
}

/**
 * Makes an authenticated request to the API
 */
export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {}
) {
  const {
    method = "GET",
    body,
    headers = {},
    token,
  } = options

  const url = `${API_URL}${endpoint}`
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} ${error}`)
    }

    if (method === "DELETE" || response.status === 204) {
      return { success: true }
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${method} ${endpoint}:`, error)
    throw error
  }
}

/**
 * Category API functions
 */
export const categoryAPI = {
  async getAll(token?: string) {
    return apiRequest("/categories", { token })
  },

  async getById(id: string, token?: string) {
    return apiRequest(`/categories/${id}`, { token })
  },

  async create(name: string, token?: string) {
    return apiRequest("/categories", {
      method: "POST",
      body: { name },
      token,
    })
  },

  async update(id: string, data: Record<string, any>, token?: string) {
    return apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: data,
      token,
    })
  },

  async delete(id: string, token?: string) {
    return apiRequest(`/categories/${id}`, {
      method: "DELETE",
      token,
    })
  },
}

/**
 * Manual API functions
 */
export const manualAPI = {
  async getAll(token?: string) {
    return apiRequest("/manuals", { token })
  },

  async getById(id: string, token?: string) {
    return apiRequest(`/manuals/${id}`, { token })
  },

  async getByCategory(categoryId: string, token?: string) {
    return apiRequest(`/manuals?category=${categoryId}`, { token })
  },

  async create(
    data: {
      title: string
      version: string
      location: string
      issueDate: string
      category: string
    },
    token?: string
  ) {
    return apiRequest("/manuals", {
      method: "POST",
      body: data,
      token,
    })
  },

  async update(id: string, data: Record<string, any>, token?: string) {
    return apiRequest(`/manuals/${id}`, {
      method: "PUT",
      body: data,
      token,
    })
  },

  async delete(id: string, token?: string) {
    return apiRequest(`/manuals/${id}`, {
      method: "DELETE",
      token,
    })
  },

  async approve(id: string, token?: string) {
    return apiRequest(`/manuals/${id}`, {
      method: "PUT",
      body: { approved: true },
      token,
    })
  },

  async highlight(id: string, highlighted: boolean = true, token?: string) {
    return apiRequest(`/manuals/${id}`, {
      method: "PUT",
      body: { highlighted },
      token,
    })
  },

  async archive(id: string, token?: string) {
    return apiRequest(`/manuals/${id}`, {
      method: "PUT",
      body: { archived: true },
      token,
    })
  },

  async unarchive(id: string, token?: string) {
    return apiRequest(`/manuals/${id}`, {
      method: "PUT",
      body: { archived: false },
      token,
    })
  },
}

/**
 * Transform backend data to frontend format
 */
export function transformCategory(backendCategory: any) {
  return {
    id: backendCategory._id,
    title: backendCategory.name,
    archived: backendCategory.archived || false,
    highlighted: backendCategory.highlighted || false,
    manuals: [],
  }
}

export function transformManual(backendManual: any) {
  return {
    id: backendManual._id,
    title: backendManual.title,
    version: backendManual.version,
    issueDate: backendManual.issueDate,
    location: backendManual.location,
    highlighted: backendManual.highlighted || false,
    approved: backendManual.approved || false,
    archived: backendManual.archived || false,
  }
}

/**
 * Merge manuals into categories
 */
export function mergeManualsinCategories(
  categories: any[],
  manuals: any[]
) {
  return categories.map((cat) => ({
    ...transformCategory(cat),
    manuals: manuals
      .filter((m) => m.category?._id === cat._id || m.categoryId === cat._id)
      .map(transformManual),
  }))
}
