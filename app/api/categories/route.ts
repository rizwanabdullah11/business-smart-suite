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

export async function GET(request: NextRequest) {
  try {
    const headers = await getHeaders(request)

    const response = await fetch(`${API_URL}/categories`, { headers })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const categories = await response.json()

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: `Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const headers = await getHeaders(request)
    const body = await request.json()

    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const category = await response.json()

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: `Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
