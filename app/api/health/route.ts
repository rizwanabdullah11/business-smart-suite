import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

/**
 * Health check endpoint to verify backend connectivity and available endpoints
 */
export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    backendUrl: API_URL,
    endpoints: {} as Record<string, any>,
  }

  // List of endpoints to check
  const endpointsToCheck = [
    { name: "Auth - Login", path: "/auth/login", method: "POST", requiresAuth: false },
    { name: "Auth - Signup", path: "/auth/signup", method: "POST", requiresAuth: false },
    { name: "Auth - Me", path: "/auth/me", method: "GET", requiresAuth: true },
    { name: "Auth - Dashboard", path: "/auth/dashboard", method: "GET", requiresAuth: true },
    { name: "Users - List", path: "/users", method: "GET", requiresAuth: true },
    { name: "Users - Get by ID", path: "/users/:id", method: "GET", requiresAuth: true },
    { name: "Users - Update", path: "/users/:id", method: "PUT", requiresAuth: true },
    { name: "Users - Delete", path: "/users/:id", method: "DELETE", requiresAuth: true },
  ]

  // Get token from request if available
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "")

  // Check each endpoint
  for (const endpoint of endpointsToCheck) {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (endpoint.requiresAuth && token) {
        headers.Authorization = `Bearer ${token}`
      }

      // For GET requests, just check if endpoint exists
      if (endpoint.method === "GET") {
        const response = await fetch(`${API_URL}${endpoint.path}`, {
          method: "GET",
          headers,
        }).catch(() => null)

        results.endpoints[endpoint.name] = {
          path: endpoint.path,
          method: endpoint.method,
          status: response ? response.status : "unreachable",
          available: response ? response.status !== 404 : false,
          requiresAuth: endpoint.requiresAuth,
        }
      } else {
        // For POST/PUT/DELETE, we can't test without data
        // Just mark as "untested"
        results.endpoints[endpoint.name] = {
          path: endpoint.path,
          method: endpoint.method,
          status: "untested",
          available: "unknown",
          requiresAuth: endpoint.requiresAuth,
        }
      }
    } catch (error) {
      results.endpoints[endpoint.name] = {
        path: endpoint.path,
        method: endpoint.method,
        status: "error",
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Summary
  const summary = {
    total: endpointsToCheck.length,
    available: Object.values(results.endpoints).filter((e: any) => e.available === true).length,
    unavailable: Object.values(results.endpoints).filter((e: any) => e.available === false).length,
    untested: Object.values(results.endpoints).filter((e: any) => e.available === "unknown").length,
  }

  return NextResponse.json({
    ...results,
    summary,
    authenticated: !!token,
  })
}
