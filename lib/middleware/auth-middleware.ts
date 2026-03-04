import { NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "../auth"
import { Permission, Role } from "../types/permissions"
import { hasPermission, hasAnyRole } from "../auth"

export interface AuthMiddlewareOptions {
  requiredPermissions?: Permission[]
  requiredRoles?: Role[]
  requireAll?: boolean // If true, user must have ALL permissions; if false, ANY permission
}

/**
 * Middleware to protect API routes with role-based permissions
 * 
 * Usage:
 * export const GET = withAuth(handler, { requiredPermissions: [Permission.VIEW_MANUALS] })
 */
export function withAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Extract token from cookie or Authorization header
      const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized - No token provided" },
          { status: 401 }
        )
      }

      // Get user from token
      const user = await getUserFromToken(token)

      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid token" },
          { status: 401 }
        )
      }

      // Check role requirements
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        if (!hasAnyRole(user, options.requiredRoles)) {
          return NextResponse.json(
            { error: "Forbidden - Insufficient role permissions" },
            { status: 403 }
          )
        }
      }

      // Check permission requirements
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        const hasRequiredPermissions = options.requireAll
          ? options.requiredPermissions.every(permission => hasPermission(user, permission))
          : options.requiredPermissions.some(permission => hasPermission(user, permission))

        if (!hasRequiredPermissions) {
          return NextResponse.json(
            { error: "Forbidden - Insufficient permissions" },
            { status: 403 }
          )
        }
      }

      // User is authorized, call the handler
      return handler(request, user)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper to get headers with authentication token
 */
export async function getAuthHeaders(request: NextRequest): Promise<HeadersInit> {
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

/**
 * Extract user from request without blocking
 * Returns null if user is not authenticated
 */
export async function getUserFromRequest(request: NextRequest) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return null
    }

    return await getUserFromToken(token)
  } catch (error) {
    console.error("Error getting user from request:", error)
    return null
  }
}
