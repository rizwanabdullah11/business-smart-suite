# Role-Based Permission System Guide

## Overview

This application implements a comprehensive role-based access control (RBAC) system with three roles:

1. **Admin** - Full access to all features
2. **Organization** - Can manage content but not users/roles
3. **Employee** - Read-only access with limited actions

## Role Permissions

### Admin Role
- Full access to all features
- User management (create, edit, delete users)
- Role management
- Organization settings
- All CRUD operations on all resources

### Organization Role
- Manage manuals, procedures, policies, forms
- Create and edit certificates
- Manage risk assessments, COSHH, audit schedules
- View analytics and dashboard
- Cannot manage users or roles
- Cannot delete certificates (only admin can)

### Employee Role
- View-only access to most resources
- Can submit forms
- View dashboard
- Cannot create, edit, or delete any resources

## Implementation Guide

### 1. Backend API Protection

Use the `withAuth` middleware to protect API routes:

```typescript
import { withAuth } from "@/lib/middleware/auth-middleware"
import { Permission } from "@/lib/types/permissions"

// Protect GET endpoint - requires VIEW_MANUALS permission
export const GET = withAuth(
  async (request: NextRequest, user) => {
    // Your handler code here
    // user object is automatically injected
    return NextResponse.json({ data: "..." })
  },
  {
    requiredPermissions: [Permission.VIEW_MANUALS],
  }
)

// Protect POST endpoint - requires CREATE_MANUAL permission
export const POST = withAuth(
  async (request: NextRequest, user) => {
    // Your handler code here
    return NextResponse.json({ data: "..." })
  },
  {
    requiredPermissions: [Permission.CREATE_MANUAL],
  }
)

// Protect by role instead of permission
export const DELETE = withAuth(
  async (request: NextRequest, user) => {
    // Only admins can access this
    return NextResponse.json({ success: true })
  },
  {
    requiredRoles: [Role.ADMIN],
  }
)
```

### 2. Frontend Permission Checks

#### Using the Hook

```typescript
import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/lib/types/permissions"

function MyComponent() {
  const { can, isAdmin, user, loading } = usePermissions()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {can(Permission.CREATE_MANUAL) && (
        <button>Create Manual</button>
      )}
      
      {isAdmin && (
        <button>Admin Only Action</button>
      )}
      
      <p>Welcome, {user?.name}</p>
    </div>
  )
}
```

#### Using Permission Gate Component

```typescript
import { PermissionGate, AdminOnly } from "@/components/auth/permission-gate"
import { Permission } from "@/lib/types/permissions"

function MyComponent() {
  return (
    <div>
      {/* Show button only if user has CREATE_MANUAL permission */}
      <PermissionGate permissions={[Permission.CREATE_MANUAL]}>
        <button>Create Manual</button>
      </PermissionGate>

      {/* Show content only to admins */}
      <AdminOnly>
        <div>Admin Dashboard</div>
      </AdminOnly>

      {/* Show content if user has ANY of the permissions */}
      <PermissionGate 
        permissions={[Permission.EDIT_MANUAL, Permission.DELETE_MANUAL]}
        requireAll={false}
      >
        <button>Manage Manual</button>
      </PermissionGate>

      {/* Show content if user has ALL permissions */}
      <PermissionGate 
        permissions={[Permission.VIEW_ANALYTICS, Permission.VIEW_DASHBOARD]}
        requireAll={true}
      >
        <div>Analytics Dashboard</div>
      </PermissionGate>
    </div>
  )
}
```

### 3. Adding New Permissions

To add a new permission:

1. Add it to the `Permission` enum in `lib/types/permissions.ts`:

```typescript
export enum Permission {
  // ... existing permissions
  VIEW_REPORTS = "view:reports",
  CREATE_REPORT = "create:report",
}
```

2. Add it to the appropriate role(s) in `ROLE_PERMISSIONS`:

```typescript
export const ROLE_PERMISSIONS: PermissionMap = {
  [Role.ADMIN]: [
    // ... existing permissions
    Permission.VIEW_REPORTS,
    Permission.CREATE_REPORT,
  ],
  [Role.ORGANIZATION]: [
    // ... existing permissions
    Permission.VIEW_REPORTS,
  ],
  [Role.EMPLOYEE]: [
    // ... existing permissions
    Permission.VIEW_REPORTS,
  ],
}
```

### 4. Backend Integration

Update the `getUserFromToken` function in `lib/auth.ts` to integrate with your backend:

```typescript
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      return null
    }
    
    const userData = await response.json()
    
    // Ensure the backend returns data in this format:
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role as Role, // Should be "admin", "organization", or "employee"
      organizationId: userData.organizationId,
    }
  } catch (error) {
    console.error("Error validating token:", error)
    return null
  }
}
```

### 5. Example: Protecting a Page

```typescript
"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/lib/types/permissions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ManualsPage() {
  const { can, loading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !can(Permission.VIEW_MANUALS)) {
      router.push("/unauthorized")
    }
  }, [can, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!can(Permission.VIEW_MANUALS)) {
    return null
  }

  return (
    <div>
      <h1>Manuals</h1>
      {/* Page content */}
    </div>
  )
}
```

## Permission Matrix

| Feature | Admin | Organization | Employee |
|---------|-------|--------------|----------|
| View Dashboard | ✓ | ✓ | ✓ |
| View Analytics | ✓ | ✓ | ✗ |
| Create/Edit Manuals | ✓ | ✓ | ✗ |
| Delete Manuals | ✓ | ✓ | ✗ |
| Create/Edit Procedures | ✓ | ✓ | ✗ |
| Archive Procedures | ✓ | ✓ | ✗ |
| Create/Edit Policies | ✓ | ✓ | ✗ |
| Submit Forms | ✓ | ✓ | ✓ |
| Create Forms | ✓ | ✓ | ✗ |
| Review Certificates | ✓ | ✓ | ✗ |
| Delete Certificates | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ |
| Manage Roles | ✓ | ✗ | ✗ |
| Organization Settings | ✓ | ✗ | ✗ |

## Best Practices

1. **Always check permissions on both frontend and backend**
   - Frontend checks improve UX by hiding unavailable actions
   - Backend checks ensure security

2. **Use specific permissions over role checks**
   - Prefer `can(Permission.CREATE_MANUAL)` over `isAdmin`
   - Makes it easier to adjust permissions later

3. **Handle loading states**
   - Always check the `loading` state before rendering permission-based content

4. **Provide fallback UI**
   - Use the `fallback` prop in `PermissionGate` for better UX

5. **Log permission denials**
   - Help debug permission issues in development

## Testing Different Roles

To test different roles, modify the mock user in `lib/auth.ts`:

```typescript
export async function getUser(): Promise<User | null> {
  return {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    role: Role.EMPLOYEE, // Change to ADMIN, ORGANIZATION, or EMPLOYEE
  }
}
```

## Next Steps

1. Integrate with your backend authentication system
2. Update `getUserFromToken` to validate tokens with your backend
3. Add permission checks to all API routes
4. Add permission gates to all UI components
5. Test each role thoroughly
6. Consider adding audit logging for permission checks
