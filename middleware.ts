import { NextRequest, NextResponse } from "next/server"

const DETAIL_ROUTE_MODULE_MAP: Record<string, string> = {
  manual: "manuals",
  policies: "policies",
  procedures: "procedures",
  forms: "forms",
  certificate: "certificates",
  "business-continuity": "business-continuity",
  "management-reviews": "management-reviews",
  "job-descriptions": "job-descriptions",
  "work-instructions": "work-instructions",
  "risk-assessments": "risk-assessments",
  coshh: "coshh",
  "technical-file": "technical-file",
  "ims-aspects-impacts": "ims-aspects-impacts",
  "audit-schedule": "audit-schedule",
  "interested-parties": "interested-parties",
  "organisational-context": "organisational-context",
  objectives: "objectives",
  maintenance: "maintenance",
  "improvement-register": "improvement-register",
  "statement-of-applicability": "statement-of-applicability",
  "legal-register": "legal-register",
  suppliers: "suppliers",
  training: "training",
  "energy-consumption": "energy-consumption",
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Ignore framework/internal routes quickly
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/task") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length !== 2) return NextResponse.next()

  const [baseSegment, maybeId] = segments
  const mappedModule = DETAIL_ROUTE_MODULE_MAP[baseSegment]
  if (!mappedModule) return NextResponse.next()

  // Only rewrite plain detail pages (/module/:id), not known non-id slugs.
  const reserved = new Set(["new", "create", "edit", "upload", "documents", "document"])
  if (reserved.has(maybeId.toLowerCase())) return NextResponse.next()

  url.pathname = `/task/${mappedModule}/${maybeId}`
  if (!url.searchParams.has("back")) {
    url.searchParams.set("back", `/${baseSegment}`)
  }
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
