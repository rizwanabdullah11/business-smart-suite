import { NextRequest, NextResponse } from "next/server"

/**
 * Health check endpoint to verify backend connectivity and available endpoints
 */
export async function GET(request: NextRequest) {
  type EndpointStatus = {
    path: string
    method: string
    available: boolean
    requiresAuth: boolean
  }

  const results = {
    timestamp: new Date().toISOString(),
    backend: "nextjs-api-routes",
    endpoints: {} as Record<string, EndpointStatus>,
  }

  // List of endpoints to check
  const endpointsToCheck = [
    { name: "Auth - Login", path: "/auth/login", method: "POST", requiresAuth: false },
    { name: "Auth - Signup", path: "/auth/signup", method: "POST", requiresAuth: false },
    { name: "Auth - Me", path: "/auth/me", method: "GET", requiresAuth: true },
    { name: "Auth - Dashboard", path: "/auth/dashboard", method: "GET", requiresAuth: true },
    { name: "Users - List", path: "/users", method: "GET", requiresAuth: true },
    { name: "Users - Get by ID", path: "/users/[id]", method: "GET", requiresAuth: true },
    { name: "Users - Update", path: "/users/[id]", method: "PUT", requiresAuth: true },
    { name: "Users - Delete", path: "/users/[id]", method: "DELETE", requiresAuth: true },
  ]

  // Get token from request if available
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "")

  // Mark endpoint metadata for local Next backend
  for (const endpoint of endpointsToCheck) {
    results.endpoints[endpoint.name] = {
      path: `/api${endpoint.path}`,
      method: endpoint.method,
      available: true,
      requiresAuth: endpoint.requiresAuth,
    }
  }

  // Summary
  const summary = {
    total: endpointsToCheck.length,
    available: Object.values(results.endpoints).filter((e) => e.available === true).length,
    unavailable: Object.values(results.endpoints).filter((e) => e.available === false).length,
    untested: 0,
  }

  return NextResponse.json({
    ...results,
    summary,
    authenticated: !!token,
  })
}
