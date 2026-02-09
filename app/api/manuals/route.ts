import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "")

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Fetch all manuals
    const response = await fetch(`${API_URL}/manuals`, { headers })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const manuals = await response.json()

    return NextResponse.json(manuals)
  } catch (error) {
    console.error("Error fetching manuals:", error)
    return NextResponse.json(
      { error: `Failed to fetch manuals: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "")

    const body = await request.json()

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}/manuals`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const manual = await response.json()

    return NextResponse.json(manual, { status: 201 })
  } catch (error) {
    console.error("Error creating manual:", error)
    return NextResponse.json(
      { error: `Failed to create manual: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
