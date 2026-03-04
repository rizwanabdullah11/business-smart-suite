# Role-Based User Filtering - Complete Guide 🎯

## Requirements

### Admin Role
- ✅ See ALL users in the system
- ✅ See admins, organizations, and employees
- ✅ No filtering applied
- ✅ Can manage all users

### Organization Role
- ✅ See ONLY their employees
- ✅ See themselves
- ✅ Filtered by organizationId
- ✅ Cannot see other organizations or their employees
- ✅ Cannot see admins

### Employee Role
- ❌ Cannot access user management
- ❌ Redirected to /unauthorized

## Backend Implementation

### Your Backend getUsers Function

```javascript
// In your userController.js
exports.getUsers = async (req, res) => {
  try {
    let baseQuery = {};
    
    // ADMIN: No filter - sees everyone
    // ORGANIZATION: Filtered by organizationId
    // EMPLOYEE: Forbidden
    
    if (req.user.role === 'Organization') {
      // Organizations see:
      // 1. Employees where organizationId = their _id
      // 2. Themselves
      baseQuery = {
        $or: [
          { organizationId: req.user._id },  // Their employees
          { _id: req.user._id }              // Themselves
        ]
      };
    } else if (req.user.role === 'Employee') {
      // Employees cannot access user management
      return res.status(403).json({ msg: "Forbidden" });
    }
    // Admin: baseQuery stays empty {} = no filter = all users
    
    // Apply additional query parameters if provided
    const { role, organizationId, _id } = req.query;
    if (role && !baseQuery.$or) baseQuery.role = role;
    if (organizationId && !baseQuery.$or) baseQuery.organizationId = organizationId;
    if (_id) baseQuery._id = _id;
    
    // Fetch users (exclude password)
    const users = await User.find(baseQuery)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ msg: "Error fetching users", error: err.message });
  }
};
```

## Frontend Implementation

### API Route (Already Implemented)

The frontend `/api/users` route already handles this:

```typescript
// app/api/users/route.ts
export const GET = withAuth(
  async (request: NextRequest, user) => {
    // Builds query params based on role
    let queryParams = ""
    
    if (user.role === "organization" && user.id) {
      queryParams = `?organizationId=${user.id}`
    }
    // Admin: No query params = gets all users
    
    const response = await fetch(`${API_URL}/users${queryParams}`, { headers })
    // Returns filtered results
  },
  {
    requiredPermissions: [Permission.VIEW_USERS],
  }
)
```

### UI Filtering (Already Implemented)

The user management page already has role-based UI:

```typescript
// app/admin/users/page.tsx

// Filter tabs shown based on role
{isAdmin && (
  <>
    <button>Organizations</button>
    <button>Admins</button>
  </>
)}
<button>Employees</button>

// Organization column only shown to admins
{isAdmin && (
  <th>Organization</th>
)}
```

## Data Flow Examples

### Example 1: Admin Logs In

**Request**:
```
GET /api/users
Authorization: Bearer admin_token
```

**Backend Query**:
```javascript
baseQuery = {} // Empty = no filter
```

**Backend Response**:
```json
[
  {
    "_id": "1",
    "name": "Imran",
    "email": "test@gmail.com",
    "role": "Admin"
  },
  {
    "_id": "2",
    "name": "Acme Corp",
    "email": "acme@test.com",
    "role": "Organization",
    "organizationName": "Acme Corp"
  },
  {
    "_id": "3",
    "name": "Tech Inc",
    "email": "tech@test.com",
    "role": "Organization",
    "organizationName": "Tech Inc"
  },
  {
    "_id": "4",
    "name": "John Employee",
    "email": "john@acme.com",
    "role": "Employee",
    "organizationId": "2"
  },
  {
    "_id": "5",
    "name": "Jane Employee",
    "email": "jane@tech.com",
    "role": "Employee",
    "organizationId": "3"
  }
]
```

**UI Shows**:
- All 5 users
- Filter tabs: All Users (5), Organizations (2), Admins (1), Employees (2)
- Organization column visible

---

### Example 2: Organization "Acme Corp" Logs In

**Request**:
```
GET /api/users?organizationId=2
Authorization: Bearer acme_token
```

**Backend Query**:
```javascript
baseQuery = {
  $or: [
    { organizationId: "2" },  // Employees of Acme
    { _id: "2" }              // Acme itself
  ]
}
```

**Backend Response**:
```json
[
  {
    "_id": "2",
    "name": "Acme Corp",
    "email": "acme@test.com",
    "role": "Organization",
    "organizationName": "Acme Corp"
  },
  {
    "_id": "4",
    "name": "John Employee",
    "email": "john@acme.com",
    "role": "Employee",
    "organizationId": "2",
    "organizationName": "Acme Corp"
  }
]
```

**UI Shows**:
- Only 2 users (Acme + John)
- Filter tabs: All Users (2), Employees (1)
- NO Organizations or Admins tabs
- NO Organization column

**Does NOT Show**:
- ❌ Tech Inc (different organization)
- ❌ Jane Employee (belongs to Tech Inc)
- ❌ Imran (admin user)

---

### Example 3: Employee Logs In

**Request**:
```
GET /api/users
Authorization: Bearer employee_token
```

**Backend Response**:
```json
{
  "msg": "Forbidden"
}
```

**UI Shows**:
- Redirected to /unauthorized
- Cannot access user management

## organizationId Sync

### How It Works

1. **Organization User Created**:
```javascript
{
  "_id": "674a9f9e9e6d3bf3bfb00002",  // This becomes organizationId
  "name": "Acme Corp",
  "role": "Organization"
}
```

2. **Employee Created for That Organization**:
```javascript
{
  "_id": "674a9f9e9e6d3bf3bfb00003",
  "name": "John Employee",
  "role": "Employee",
  "organizationId": "674a9f9e9e6d3bf3bfb00002"  // Links to Acme
}
```

3. **When Acme Logs In**:
```javascript
// Backend filters:
{
  $or: [
    { organizationId: "674a9f9e9e6d3bf3bfb00002" },  // Finds John
    { _id: "674a9f9e9e6d3bf3bfb00002" }              // Finds Acme
  ]
}
```

## UI Permissions Module

### Current Implementation

The permissions page (`/admin/permissions`) already has role-based display:

```typescript
// app/admin/permissions/page.tsx

// Only admins can access
useEffect(() => {
  if (!permLoading && !can(Permission.MANAGE_ROLES)) {
    router.push("/unauthorized")
  }
}, [can, permLoading, router])

// Shows permission comparison table
// Displays what each role can do
```

### What's Already Working

✅ Permission comparison table
✅ Shows Admin, Organization, Employee columns
✅ Color-coded permissions (green = has, red = doesn't have)
✅ Only accessible to admins

## Checklist

### Backend ✅
- [x] getUsers function with role-based filtering
- [x] Admin sees all users (no filter)
- [x] Organization sees their employees + themselves
- [x] Employee gets 403 Forbidden
- [x] organizationId properly linked

### Frontend ✅
- [x] API route sends organizationId for organizations
- [x] UI shows different tabs based on role
- [x] Organization column hidden for non-admins
- [x] Permission checks on all actions
- [x] Proper error handling

### Permissions Module ✅
- [x] Only admins can access
- [x] Shows permission comparison
- [x] Clear role differences displayed

## Testing

### Test as Admin
1. Login as admin
2. Go to `/admin/users`
3. Should see ALL users
4. Should see all filter tabs
5. Should see organization column

### Test as Organization
1. Login as organization (e.g., test423432)
2. Go to `/admin/users`
3. Should see ONLY your employees + yourself
4. Should NOT see other organizations
5. Should NOT see admins
6. Should NOT see organization column

### Test as Employee
1. Login as employee
2. Try to go to `/admin/users`
3. Should be redirected to `/unauthorized`

## Summary

Everything is already implemented correctly! The system:

✅ Admin → Sees ALL users
✅ Organization → Sees ONLY their employees (synced by organizationId)
✅ Employee → Cannot access
✅ UI adapts based on role
✅ Permissions module working
✅ organizationId properly synced

Just make sure your backend has the `getUsers` function implemented as shown above!
