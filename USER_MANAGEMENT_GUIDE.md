# User Management System Guide

## 🏢 Organization Hierarchy

```
Admin
  ├── Can create Organizations
  ├── Can create Employees (any organization)
  └── Can manage all users

Organization
  ├── Can create Employees (their organization only)
  └── Can manage their organization's employees

Employee
  └── Read-only access
```

## ✅ What's Been Created

### 1. User Management Page (`/admin/users`)
- **Location**: `app/admin/users/page.tsx`
- **Access**: Admin and Organization roles
- **Features**:
  - View all users (Admin) or organization's employees (Organization)
  - Filter by role (All, Organizations, Employees)
  - Add new users
  - Edit users
  - Delete users
  - Beautiful table with role badges and icons

### 2. API Routes

#### `/api/users` (GET, POST)
- **GET**: List users
  - Admin: Gets all users
  - Organization: Gets only their organization's employees
- **POST**: Create new user
  - Admin: Can create Organization or Employee
  - Organization: Can create Employee (auto-assigned to their org)

#### `/api/users/[id]` (PUT, DELETE)
- **PUT**: Update user
- **DELETE**: Delete user

#### `/api/organizations` (GET)
- **GET**: List all organizations (Admin only)
- Used in dropdown when creating employees

### 3. Sidebar Integration
- "Users" menu item added to Administration section
- Visible to Admin and Organization roles
- Hidden from Employees

## 🎨 UI Features

### User Table
- **Role Badges**: Color-coded (Blue=Admin, Green=Organization, Gray=Employee)
- **Icons**: Building icon for Organizations, User icon for others
- **Filters**: Quick filter by role
- **Actions**: Edit and Delete buttons (permission-based)

### Add User Modal
- **Admin can create**:
  - Organizations (no organization assignment)
  - Employees (with organization dropdown)
- **Organization can create**:
  - Employees only (auto-assigned to their organization)

## 🔒 Permissions

### Admin
- ✅ View all users
- ✅ Create Organizations
- ✅ Create Employees (any organization)
- ✅ Edit any user
- ✅ Delete any user
- ✅ See organization column in table

### Organization
- ✅ View their organization's employees
- ✅ Create Employees (their organization only)
- ✅ Edit their employees
- ✅ Delete their employees
- ❌ Cannot see organization column
- ❌ Cannot create Organizations

### Employee
- ❌ Cannot access user management
- ❌ Redirected to /unauthorized

## 📋 Backend Requirements

Your backend needs these endpoints:

### 1. GET /api/users
**Query Parameters**:
- `role` (optional): Filter by role (e.g., "Organization")
- `organizationId` (optional): Filter by organization

**Response**:
```json
[
  {
    "_id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Employee",
    "organizationId": "org456",
    "organizationName": "Acme Corp",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### 2. POST /api/users
**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "Employee",
  "organizationId": "org456"
}
```

**Response**:
```json
{
  "_id": "user789",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "Employee",
  "organizationId": "org456",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3. PUT /api/users/:id
**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "Organization"
}
```

### 4. DELETE /api/users/:id
**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 🚀 How to Use

### As Admin:

1. **Navigate to** `/admin/users`
2. **Click "Add User"**
3. **Select role**:
   - "Organization" - Creates a new organization
   - "Employee" - Creates an employee (select organization from dropdown)
4. **Fill in details** and click "Create User"

### As Organization:

1. **Navigate to** `/admin/users`
2. **See only your employees**
3. **Click "Add User"**
4. **Only "Employee" role available**
5. **Employee auto-assigned to your organization**

### As Employee:

- Cannot access `/admin/users`
- Redirected to `/unauthorized` if attempted

## 🎯 User Flow Examples

### Example 1: Admin Creates Organization

1. Admin logs in
2. Goes to `/admin/users`
3. Clicks "Add User"
4. Fills in:
   - Name: "Acme Corporation" (this becomes the organization name)
   - Email: "contact@acme.com" (this becomes the organization email)
   - Password: "password123"
   - Role: "Organization"
5. Clicks "Create User"
6. New organization created with name and email from the user details

### Example 2: Organization Creates Employee

1. Organization user logs in
2. Goes to `/admin/users`
3. Sees only their employees
4. Clicks "Add User"
5. Fills in:
   - Name: "John Employee"
   - Email: "john@acme.com"
   - Password: "password123"
   - Role: "Employee" (only option)
6. Clicks "Create User"
7. Employee auto-assigned to their organization

### Example 3: Admin Creates Employee for Specific Organization

1. Admin logs in
2. Goes to `/admin/users`
3. Clicks "Add User"
4. Fills in:
   - Name: "Jane Employee"
   - Email: "jane@acme.com"
   - Password: "password123"
   - Role: "Employee"
   - Organization: "Acme Corp" (from dropdown)
5. Clicks "Create User"
6. Employee assigned to selected organization

## 🔧 Customization

### Add More Fields

Edit `app/admin/users/page.tsx` and add fields to the form:

```typescript
const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  role: "Employee",
  organizationId: "",
  // Add your custom fields here
  phone: "",
  department: "",
})
```

### Change Table Columns

Edit the table in `app/admin/users/page.tsx`:

```typescript
<th>Your Custom Column</th>
// ...
<td>{user.yourCustomField}</td>
```

### Add Bulk Actions

Add checkboxes and bulk action buttons:

```typescript
const [selectedUsers, setSelectedUsers] = useState<string[]>([])

// Add bulk delete, bulk edit, etc.
```

## 📊 Database Schema Recommendation

```javascript
// User Schema
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['Admin', 'Organization', 'Employee']),
  organizationId: ObjectId (ref: 'User', only for Employees),
  createdAt: Date,
  updatedAt: Date
}
```

**Notes**:
- Organizations are users with `role: 'Organization'`
- Employees have `organizationId` pointing to their organization
- Admins have no `organizationId`

## ✨ Features Summary

- ✅ Role-based user management
- ✅ Organization hierarchy
- ✅ Permission-based UI
- ✅ Protected API routes
- ✅ Beautiful, responsive design
- ✅ Filter and search
- ✅ Add, edit, delete users
- ✅ Auto-assignment for organizations
- ✅ Validation and error handling

## 🎉 You're Ready!

The user management system is complete and ready to use. Test it with different roles to see how the permissions work!
