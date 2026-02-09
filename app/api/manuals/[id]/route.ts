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

    const response = await fetch(`${API_URL}/manuals/${id}`, { headers })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Manual not found: ${response.statusText}` },
        { status: response.status }
      )
    }

    const manual = await response.json()

    return NextResponse.json(manual)
  } catch (error) {
    console.error("Error fetching manual:", error)
    return NextResponse.json(
      { error: `Failed to fetch manual: ${error instanceof Error ? error.message : "Unknown error"}` },
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

    const response = await fetch(`${API_URL}/manuals/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const updatedManual = await response.json()

    return NextResponse.json(updatedManual)
  } catch (error) {
    console.error("Error updating manual:", error)
    return NextResponse.json(
      { error: `Failed to update manual: ${error instanceof Error ? error.message : "Unknown error"}` },
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

    const response = await fetch(`${API_URL}/manuals/${id}`, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    return NextResponse.json({ success: true, message: "Manual deleted" })
  } catch (error) {
    console.error("Error deleting manual:", error)
    return NextResponse.json(
      { error: `Failed to delete manual: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
