import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

async function getHeaders(request: NextRequest): Promise<HeadersInit> {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "")

  const headers: HeadersInit = {
    // Note: Don't set Content-Type for FormData - browser will set it with boundary
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const headers = await getHeaders(request)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Create FormData for forwarding to backend
    const backendFormData = new FormData()
    backendFormData.append("file", file)

    const response = await fetch(`${API_URL}/manuals/${id}/upload`, {
      method: "POST",
      headers,
      body: backendFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `Upload failed: ${error}` },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error handling upload:", error)
    return NextResponse.json(
      { error: `Upload error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
