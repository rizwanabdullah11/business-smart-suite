# 👀 Visual Guide - What You'll See

## Current State (Backend Not Running)

```
┌─────────────────────────────────────────────────────────────┐
│ User Management                          [+ Add User]       │
├─────────────────────────────────────────────────────────────┤
│ [All Users (1)] [Organizations (0)] [Admins (1)]            │
│ [Employees (0)]              ☑ Show Admin Users             │
├─────────────────────────────────────────────────────────────┤
│ User       Email              Role     Organization Actions │
│ Imran      test@gmail.com     Admin    -            [✏️][🗑️] │
└─────────────────────────────────────────────────────────────┘

❌ Only 1 user showing (mock data)
❌ Organizations (0) - empty
❌ Employees (0) - empty
```

---

## After Backend Starts + Test Data Created

### Admin View:

```
┌─────────────────────────────────────────────────────────────┐
│ User Management                          [+ Add User]       │
├─────────────────────────────────────────────────────────────┤
│ [All Users (5)] [Organizations (2)] [Admins (1)]            │
│ [Employees (2)]              ☑ Show Admin Users             │
├─────────────────────────────────────────────────────────────┤
│ User              Email              Role          Org       │
│ Imran             test@gmail.com     Admin         -        │
│ Acme Corporation  admin@acme.com     Organization  -        │
│ Tech Solutions    admin@tech.com     Organization  -        │
│ John Doe          john@acme.com      Employee      Acme     │
│ Jane Smith        jane@tech.com      Employee      Tech     │
└─────────────────────────────────────────────────────────────┘

✅ All Users (5) - Shows ALL users
✅ Organizations (2) - Shows 2 organizations
✅ Admins (1) - Shows 1 admin
✅ Employees (2) - Shows 2 employees
✅ Can edit/delete any user
```

### Organization View (Acme Corporation):

```
┌─────────────────────────────────────────────────────────────┐
│ User Management                          [+ Add User]       │
├─────────────────────────────────────────────────────────────┤
│ [All Users (2)] [Organizations (0)] [Admins (0)]            │
│ [Employees (1)]              ☑ Show Admin Users             │
├─────────────────────────────────────────────────────────────┤
│ User              Email              Role          Org       │
│ Acme Corporation  admin@acme.com     Organization  -        │
│ John Doe          john@acme.com      Employee      Acme     │
└─────────────────────────────────────────────────────────────┘

✅ All Users (2) - Shows ONLY their users
✅ Organizations (0) - Cannot see other orgs
✅ Admins (0) - Cannot see admins
✅ Employees (1) - Shows their employee
✅ Can edit/delete John Doe only
❌ Cannot see Tech Solutions
❌ Cannot see Jane Smith
❌ Cannot see Imran
```

---

## Filter Tab Behavior

### Admin Clicks Tabs:

**All Users (5):**
```
Shows: Imran, Acme Corp, Tech Solutions, John Doe, Jane Smith
```

**Organizations (2):**
```
Shows: Acme Corp, Tech Solutions
```

**Admins (1):**
```
Shows: Imran
```

**Employees (2):**
```
Shows: John Doe, Jane Smith
```

### Organization Clicks Tabs:

**All Users (2):**
```
Shows: Acme Corp (themselves), John Doe (their employee)
```

**Organizations (0):**
```
Shows: (empty - they can't see other organizations)
```

**Admins (0):**
```
Shows: (empty - they can't see admins)
```

**Employees (1):**
```
Shows: John Doe (their employee)
```

---

## Add User Modal

### Admin Opens "Add User":

```
┌─────────────────────────────────────┐
│ Add New User                        │
├─────────────────────────────────────┤
│ Name: [____________]                │
│ Email: [____________]               │
│ Password: [____________]            │
│                                     │
│ Role: [Employee ▼]                  │
│       - Admin                       │
│       - Organization                │
│       - Employee                    │
│                                     │
│ Organization: [Acme Corporation ▼]  │
│               - Acme Corporation    │
│               - Tech Solutions      │
│               - No Organization     │
│                                     │
│ [Create User]  [Cancel]             │
└─────────────────────────────────────┘

✅ Can select any role
✅ Organization dropdown shows all orgs
✅ Can assign employee to any org
```

### Organization Opens "Add User":

```
┌─────────────────────────────────────┐
│ Add New User                        │
├─────────────────────────────────────┤
│ Name: [____________]                │
│ Email: [____________]               │
│ Password: [____________]            │
│                                     │
│ Role: Employee (fixed)              │
│                                     │
│ (No organization dropdown)          │
│ (Auto-assigned to Acme Corporation) │
│                                     │
│ [Create User]  [Cancel]             │
└─────────────────────────────────────┘

✅ Role fixed to Employee
❌ No organization dropdown
✅ Auto-assigned to their org
```

---

## Edit User

### Admin Edits User:

```
┌─────────────────────────────────────┐
│ Edit User: John Doe                 │
├─────────────────────────────────────┤
│ Name: [John Doe Updated]            │
│ Email: [john.updated@acme.com]      │
│                                     │
│ Role: [Employee ▼]                  │
│       - Admin                       │
│       - Organization                │
│       - Employee                    │
│                                     │
│ Organization: [Tech Solutions ▼]    │
│               - Acme Corporation    │
│               - Tech Solutions      │
│                                     │
│ [Update User]  [Cancel]             │
└─────────────────────────────────────┘

✅ Can change name, email
✅ Can change role
✅ Can change organization
```

### Organization Edits Employee:

```
┌─────────────────────────────────────┐
│ Edit User: John Doe                 │
├─────────────────────────────────────┤
│ Name: [John Doe Updated]            │
│ Email: [john.updated@acme.com]      │
│                                     │
│ Role: Employee (cannot change)      │
│                                     │
│ Organization: Acme Corp (fixed)     │
│                                     │
│ [Update User]  [Cancel]             │
└─────────────────────────────────────┘

✅ Can change name, email
❌ Cannot change role
❌ Cannot change organization
```

---

## Network Tab (What You'll See)

### GET /api/users (Admin):

**Request:**
```
GET http://localhost:5000/api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
[
  {
    "_id": "6999eff86d53b0c6371",
    "name": "Imran",
    "email": "test@gmail.com",
    "role": "Admin",
    "createdAt": "2026-02-21T17:43:43.150Z"
  },
  {
    "_id": "69915f35fcc9b2d076017c3b",
    "name": "Acme Corporation",
    "email": "admin@acme.com",
    "role": "Organization",
    "createdAt": "2026-02-21T17:44:00.000Z"
  },
  {
    "_id": "6680eff86d53b0c6372",
    "name": "Tech Solutions",
    "email": "admin@tech.com",
    "role": "Organization",
    "createdAt": "2026-02-21T17:45:00.000Z"
  },
  {
    "_id": "6680eff86d53b0c6373",
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "Employee",
    "organizationId": "69915f35fcc9b2d076017c3b",
    "createdAt": "2026-02-21T17:46:00.000Z"
  },
  {
    "_id": "6680eff86d53b0c6374",
    "name": "Jane Smith",
    "email": "jane@tech.com",
    "role": "Employee",
    "organizationId": "6680eff86d53b0c6372",
    "createdAt": "2026-02-21T17:47:00.000Z"
  }
]
```

✅ Returns ARRAY with 5 users
✅ All users included (admin, orgs, employees)

### GET /api/users (Organization):

**Request:**
```
GET http://localhost:5000/api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Token for Acme Corporation)
```

**Response (200 OK):**
```json
[
  {
    "_id": "69915f35fcc9b2d076017c3b",
    "name": "Acme Corporation",
    "email": "admin@acme.com",
    "role": "Organization",
    "createdAt": "2026-02-21T17:44:00.000Z"
  },
  {
    "_id": "6680eff86d53b0c6373",
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "Employee",
    "organizationId": "69915f35fcc9b2d076017c3b",
    "createdAt": "2026-02-21T17:46:00.000Z"
  }
]
```

✅ Returns ARRAY with 2 users
✅ Only Acme Corp users (themselves + their employee)
❌ Does NOT include Tech Solutions, Jane Smith, or Imran

---

## Console Logs

### Backend Console (When Admin Gets Users):

```
GET /users - Current user: test@gmail.com Role: Admin
Admin: No filter, returning all users
Found 5 users
```

### Backend Console (When Organization Gets Users):

```
GET /users - Current user: admin@acme.com Role: Organization
Organization: Filtering by organizationId: 69915f35fcc9b2d076017c3b
Found 2 users
```

### Frontend Console (When Loading Users):

```
🔍 Auth: Fetching user data...
✅ Auth: User loaded - Imran (admin)
🔄 Loading organizations...
✅ Organizations loaded: 2 organizations
📋 Organizations data: [{...}, {...}]
```

---

## Summary

**Before Backend Starts:**
- Shows 1 user (mock data)
- Organizations (0)
- Employees (0)
- Organization dropdown empty

**After Backend Starts:**
- Admin sees 5 users (all)
- Organization sees 2 users (their employees only)
- Filter tabs show correct counts
- Organization dropdown populated
- Edit/Delete work correctly
- Role-based permissions enforced

**Everything will work automatically once you start the backend!** 🚀
