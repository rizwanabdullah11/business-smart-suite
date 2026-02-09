import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entryId, currentSectionId, newSectionId, newCategoryId } = body

    if (!entryId || !newSectionId || !newCategoryId) {
      return NextResponse.json(
        { error: "Missing required fields: entryId, newSectionId, newCategoryId" },
        { status: 400 }
      )
    }

    // If moving to a different section, you might need special handling
    // For now, we'll just update the category association
    const response = await fetch(`${API_URL}/manuals/${entryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: newCategoryId,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Backend error:", error)
      return NextResponse.json(
        { error: `Failed to move entry: ${error}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`Successfully moved entry ${entryId} to category ${newCategoryId}`)

    return NextResponse.json({
      success: true,
      message: `Entry moved successfully from ${currentSectionId} to ${newSectionId}`,
      entryId,
      newSectionId,
      newCategoryId,
    })
  } catch (error) {
    console.error("Error moving entry:", error)
    return NextResponse.json(
      {
        error: `Failed to move entry: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    )
  }
}
