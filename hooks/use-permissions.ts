"use client"

import { Permission, Role } from "@/lib/types/permissions"
import { useAuth } from "@/contexts/auth-context"

/**
 * Hook to access current user and check permissions
 * This is now a wrapper around useAuth for backward compatibility
 */
export function usePermissions() {
  return useAuth()
}

/**
 * Hook to check a specific permission
 */
export function usePermission(permission: Permission) {
  const { can, loading } = useAuth()
  return { hasPermission: can(permission), loading }
}

/**
 * Hook to check if user has a specific role
 */
export function useRole(role: Role) {
  const { isRole, loading } = useAuth()
  return { hasRole: isRole(role), loading }
}
