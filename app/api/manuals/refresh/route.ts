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

    // Fetch categories and manuals from backend
    const [categoriesRes, manualsRes] = await Promise.all([
      fetch(`${API_URL}/categories`, { headers }),
      fetch(`${API_URL}/manuals`, { headers }),
    ])

    if (!categoriesRes.ok || !manualsRes.ok) {
      throw new Error("Failed to fetch data from backend")
    }

    const categories = await categoriesRes.json()
    const manuals = await manualsRes.json()

    // Merge manuals within categories
    const mergedCategories = categories.map((cat: any) => ({
      id: cat._id,
      title: cat.name,
      archived: cat.archived || false,
      highlighted: cat.highlighted || false,
      manuals: manuals
        .filter((m: any) => m.category?._id === cat._id || m.categoryId === cat._id)
        .map((m: any) => ({
          id: m._id,
          title: m.title,
          version: m.version,
          issueDate: m.issueDate,
          location: m.location,
          highlighted: m.highlighted || false,
          approved: m.approved || false,
        })),
    }))

    // Separate archived categories
    const activeCategories = mergedCategories.filter((cat: any) => !cat.archived)
    const archivedCategories = mergedCategories.filter((cat: any) => cat.archived)

    return NextResponse.json({
      categories: activeCategories,
      archivedCategories,
    })
  } catch (error) {
    console.error("Error refreshing manuals:", error)
    return NextResponse.json(
      { error: `Failed to refresh manuals: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
