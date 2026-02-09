import { NextRequest, NextResponse } from "next/server"

// Mock sections list - you can enhance this to fetch from your backend if needed
const sections = [
  {
    id: "manuals",
    title: "Manuals",
    categories: [],
  },
  {
    id: "policies",
    title: "Policies",
    categories: [],
  },
  {
    id: "procedures",
    title: "Procedures",
    categories: [],
  },
  {
    id: "forms",
    title: "Forms",
    categories: [],
  },
  {
    id: "job-descriptions",
    title: "Job Descriptions",
    categories: [],
  },
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(sections)
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    )
  }
}
