# Dynamic API Filtering - Role-Based Data Access 🔐

## Overview

The `/api/users` and `/api/organizations` endpoints now dynamically filter data based on the authenticated user's role and permissions.

## GET /api/users - Dynamic User List

### Behavior by Role

#### Admin
- **Access**: All users in the system
- **Query**: `GET /api/users` (no filters)
- **Returns**: Complete user list including Admins, Organizations, and Employees

#### Organization
- **Access**: Only their organization's employees + themselves
- **Query**: `GET /api/users?organizationId={their_user_id}`
- **Returns**: 
  - The organization user themselves
  - All employees with `organizationId` matching their user ID

#### Employee
- **Access**: None (blocked by `VIEW_USERS` permission)
- **Result**: 403 Forbidden

### Implementation Details

```typescript
// Admin request
GET /api/users
Authorization: Bearer admin_token

// Returns: All users
[
  { _id: "1", name: "Admin User", role: "Admin" },
  { _id: "2", name: "Acme Corp", role: "Organization" },
  { _id: "3", name: "John Employee", role: "Employee", organizationId: "2" }
]

// Organization request
GET /api/users?organizationId=2
Authorization: Bearer org_token

// Returns: Only their employees + themselves
[
  { _id: "2", name: "Acme Corp", role: "Organization" },
  { _id: "3", name: "John Employee", role: "Employee", organizationId: "2" }
]
```

### Data Enrichment

The API automatically enriches user data with organization names:

```typescript
// Before enrichment
{
  _id: "3",
  name: "John Employee",
  role: "Employee",
  organizationId: "2"
}

// After enrichment
{
  _id: "3",
  name: "John Employee",
  role: "Employee",
  organizationId: "2",
  organizationName: "Acme Corp"  // ← Added by API
}
```

## GET /api/organizations - Dynamic Organization List

### Behavior by Role

#### Admin
- **Access**: All organizations in the system
- **Query**: `GET /api/users?role=Organization`
- **Returns**: All users with `role: "Organization"`

#### Organization
- **Access**: Only themselves
- **Query**: `GET /api/users?role=Organization&_id={their_user_id}`
- **Returns**: Only their own organization record

#### Employee
- **Access**: None (blocked by `VIEW_USERS` permission)
- **Result**: 403 Forbidden

### Implementation Details

```typescript
// Admin request
GET /api/organizations
Authorization: Bearer admin_token

// Returns: All organizations
[
  { _id: "2", name: "Acme Corp", role: "Organization", email: "contact@acme.com" },
  { _id: "4", name: "Tech Inc", role: "Organization", email: "info@tech.com" }
]

// Organization request
GET /api/organizations
Authorization: Bearer org_token

// Returns: Only themselves
[
  { _id: "2", name: "Acme Corp", role: "Organization", email: "contact@acme.com" }
]
```

## Permission Checks

Both endpoints use the `withAuth` middleware with permission requirements:

```typescript
// Users endpoint
export const GET = withAuth(
  async (request, user) => { /* ... */ },
  {
    requiredPermissions: [Permission.VIEW_USERS]
  }
)

// Organizations endpoint
export const GET = withAuth(
  async (request, user) => { /* ... */ },
  {
    requiredPermissions: [Permission.VIEW_USERS]
  }
)
```

### Permission Matrix

| Role         | VIEW_USERS | Can Access /api/users | Can Access /api/organizations |
|--------------|------------|----------------------|------------------------------|
| Admin        | ✅ Yes     | ✅ All users         | ✅ All organizations         |
| Organization | ✅ Yes     | ✅ Their employees   | ✅ Themselves only           |
| Employee     | ❌ No      | ❌ Forbidden         | ❌ Forbidden                 |

## Backend Query Parameters

The frontend sends these query parameters to help the backend filter:

### For Users List

```typescript
// Admin
GET /api/users

// Organization
GET /api/users?organizationId=674a9f9e9e6d3bf3bfb00001
```

### For Organizations List

```typescript
// Admin
GET /api/users?role=Organization

// Organization
GET /api/users?role=Organization&_id=674a9f9e9e6d3bf3bfb00001
```

## Fallback Filtering

If your backend doesn't support query parameters yet, the frontend API routes include fallback filtering:

```typescript
// Frontend fallback for Organization role
if (user.role === "organization" && user.id) {
  users = users.filter((u: any) => 
    u.organizationId === user.id || u._id === user.id
  )
}
```

This ensures the system works even if your backend returns all users.

## Backend Implementation Guide

### Recommended Backend Implementation

```javascript
// GET /api/users
router.get('/users', authMiddleware, async (req, res) => {
  const currentUser = req.user
  const { organizationId, role, _id } = req.query
  
  let query = {}
  
  // Apply role-based filtering
  if (currentUser.role === 'Organization') {
    // Organization can only see their employees + themselves
    query = {
      $or: [
        { organizationId: currentUser._id },
        { _id: currentUser._id }
      ]
    }
  }
  // Admin sees everyone (no filter)
  
  // Apply query parameters
  if (organizationId) {
    query.organizationId = organizationId
  }
  if (role) {
    query.role = role
  }
  if (_id) {
    query._id = _id
  }
  
  const users = await User.find(query).select('-password')
  res.json(users)
})
```

## Security Features

### 1. Double Layer Protection
- **Middleware**: Checks permissions before handler runs
- **Handler**: Applies role-based filtering to data

### 2. No Data Leakage
- Organizations cannot see other organizations' employees
- Employees cannot access user management at all
- Query parameters are validated against user role

### 3. Automatic Filtering
- Backend filtering via query params (primary)
- Frontend filtering as fallback (secondary)
- Both layers ensure data isolation

## Testing

### Test as Admin

```bash
# Login as Admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get all users
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer {admin_token}"

# Should return: All users

# Get all organizations
curl http://localhost:3000/api/organizations \
  -H "Authorization: Bearer {admin_token}"

# Should return: All organizations
```

### Test as Organization

```bash
# Login as Organization
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"org@example.com","password":"password"}'

# Get users
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer {org_token}"

# Should return: Only their employees + themselves

# Get organizations
curl http://localhost:3000/api/organizations \
  -H "Authorization: Bearer {org_token}"

# Should return: Only themselves
```

### Test as Employee

```bash
# Login as Employee
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@example.com","password":"password"}'

# Try to get users
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer {employee_token}"

# Should return: 403 Forbidden
```

## UI Integration

The user management page (`/admin/users`) automatically adapts:

### Admin View
- Sees "All Users", "Organizations", "Employees" filter tabs
- Organization column visible in table
- Can create Organizations and Employees
- Can assign employees to any organization

### Organization View
- Sees "All Users", "Employees" filter tabs (no Organizations tab)
- Organization column hidden in table
- Can only create Employees
- Employees auto-assigned to their organization

### Employee View
- Cannot access `/admin/users` page
- Redirected to `/unauthorized`

## Summary

✅ **Dynamic filtering** based on user role
✅ **Permission-based access** control
✅ **Data enrichment** with organization names
✅ **Query parameter support** for backend filtering
✅ **Fallback filtering** if backend doesn't support params
✅ **Security** through double-layer protection
✅ **Automatic UI adaptation** based on role

The system is now fully dynamic and respects role-based permissions at every level! 🎉
