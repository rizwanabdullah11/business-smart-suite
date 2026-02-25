import { Role, Permission, ROLE_PERMISSIONS, User } from "./types/permissions"

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return userPermissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false
  
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false
  
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: Role): boolean {
  if (!user) return false
  return user.role === role
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Get user from token (to be implemented with your backend)
 * This should decode JWT or validate session token
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
    
    // TODO: Replace this with your actual backend endpoint
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      // For development: return mock user if backend is not available
      if (process.env.NODE_ENV === "development") {
        console.warn("Backend not available, using mock user for development")
        return {
          id: "1",
          name: "Demo User",
          email: "demo@example.com",
          role: Role.ADMIN,
        }
      }
      return null
    }
    
    const userData = await response.json()
    
    // Normalize role to lowercase to handle backend inconsistencies
    // Backend uses: 'Admin', 'Organization', 'Employee' (capitalized)
    // Frontend uses: 'admin', 'organization', 'employee' (lowercase)
    let userRole = (userData.role || "Employee").toLowerCase()
    
    // Map common role variations
    if (userRole === "administrator" || userRole === "super_admin") {
      userRole = "admin"
    } else if (userRole === "org" || userRole === "manager") {
      userRole = "organization"
    } else if (userRole === "user" || userRole === "member") {
      userRole = "employee"
    }
    
    // Validate role
    if (!["admin", "organization", "employee"].includes(userRole)) {
      console.warn(`Invalid role "${userData.role}", defaulting to employee`)
      userRole = "employee"
    }
    
    console.log(`User role normalized: "${userData.role}" → "${userRole}"`)
    
    // Map backend response to User type
    return {
      id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      role: userRole as Role,
      organizationId: userData.organizationId,
    }
  } catch (error) {
    console.error("Error validating token:", error)
    
    // For development: return mock user if there's an error
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock user for development")
      return {
        id: "1",
        name: "Demo User",
        email: "demo@example.com",
        role: Role.ADMIN,
      }
    }
    
    return null
  }
}

/**
 * Get current user from session/cookie
 * For development/testing - returns mock user
 * In production, this should get user from session/cookie and validate with backend
 */
export async function getUser(): Promise<User | null> {
  // In development, return a mock user for testing
  if (process.env.NODE_ENV === "development") {
    return {
      id: "1",
      name: "Demo User",
      email: "demo@example.com",
      role: Role.ADMIN, // Change to ORGANIZATION or EMPLOYEE to test different roles
    }
  }
  
  // In production, implement actual user retrieval
  // Example: Get token from cookie and validate
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return null
    
    return await getUserFromToken(token)
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return user !== null
}
