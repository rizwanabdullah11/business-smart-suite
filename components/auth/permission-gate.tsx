"use client"

import { ReactNode } from "react"
import { Permission, Role } from "@/lib/types/permissions"
import { usePermissions } from "@/hooks/use-permissions"

interface PermissionGateProps {
  children: ReactNode
  permissions?: Permission[]
  roles?: Role[]
  requireAll?: boolean
  fallback?: ReactNode
  showLoading?: boolean
}

/**
 * Component to conditionally render content based on permissions
 * 
 * Usage:
 * <PermissionGate permissions={[Permission.CREATE_MANUAL]}>
 *   <button>Create Manual</button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { user, loading, canAny, canAll, isAnyRole } = usePermissions()

  if (loading && showLoading) {
    return <div>Loading...</div>
  }

  if (loading) {
    return null
  }

  if (!user) {
    return <>{fallback}</>
  }

  // Check role requirements
  if (roles.length > 0 && !isAnyRole(roles)) {
    return <>{fallback}</>
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? canAll(permissions)
      : canAny(permissions)

    if (!hasRequiredPermissions) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * Component to show content only to admins
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate roles={[Role.ADMIN]} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Component to show content only to organization role
 */
export function OrganizationOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate roles={[Role.ORGANIZATION]} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Component to show content to admin or organization roles
 */
export function AdminOrOrganization({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate roles={[Role.ADMIN, Role.ORGANIZATION]} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}
