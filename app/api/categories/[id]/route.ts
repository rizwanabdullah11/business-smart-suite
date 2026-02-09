import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

async function getHeaders(request: NextRequest): Promise<HeadersInit> {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const headers = await getHeaders(request)

    const response = await fetch(`${API_URL}/categories/${id}`, { headers })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Category not found: ${response.statusText}` },
        { status: response.status }
      )
    }

    const category = await response.json()

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: `Failed to fetch category: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const headers = await getHeaders(request)
    const body = await request.json()

    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const updatedCategory = await response.json()

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: `Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const headers = await getHeaders(request)

    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    return NextResponse.json({ success: true, message: "Category deleted" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: `Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
