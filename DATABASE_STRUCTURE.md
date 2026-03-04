# 📊 Database Structure - Single Table Design

## MongoDB Collection Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Database                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Collection: users                          │    │
│  │  (All user types stored here)                          │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  Document 1: Admin User                                │    │
│  │  {                                                      │    │
│  │    _id: "507f...011",                                  │    │
│  │    name: "Admin User",                                 │    │
│  │    email: "admin@example.com",                         │    │
│  │    role: "Admin",              ← Role field            │    │
│  │    organizationId: null,                               │    │
│  │    password: "hashed..."                               │    │
│  │  }                                                      │    │
│  │                                                         │    │
│  │  ─────────────────────────────────────────────────     │    │
│  │                                                         │    │
│  │  Document 2: Organization User                         │    │
│  │  {                                                      │    │
│  │    _id: "507f...012",                                  │    │
│  │    name: "Imran org",                                  │    │
│  │    email: "imran@example.com",                         │    │
│  │    role: "Organization",       ← Role field            │    │
│  │    organizationId: null,                               │    │
│  │    password: "hashed..."                               │    │
│  │  }                                                      │    │
│  │                                                         │    │
│  │  ─────────────────────────────────────────────────     │    │
│  │                                                         │    │
│  │  Document 3: Employee User                             │    │
│  │  {                                                      │    │
│  │    _id: "507f...013",                                  │    │
│  │    name: "Employee 1",                                 │    │
│  │    email: "emp1@example.com",                          │    │
│  │    role: "Employee",           ← Role field            │    │
│  │    organizationId: "507f...012", ← Links to Imran org │    │
│  │    password: "hashed..."                               │    │
│  │  }                                                      │    │
│  │                                                         │    │
│  │  ─────────────────────────────────────────────────     │    │
│  │                                                         │    │
│  │  Document 4: Employee User                             │    │
│  │  {                                                      │    │
│  │    _id: "507f...014",                                  │    │
│  │    name: "Employee 2",                                 │    │
│  │    email: "emp2@example.com",                          │    │
│  │    role: "Employee",           ← Role field            │    │
│  │    organizationId: "507f...012", ← Links to Imran org │    │
│  │    password: "hashed..."                               │    │
│  │  }                                                      │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Relationship Diagram

```
users Collection
│
├─ Admin Users (role: "Admin")
│  ├─ Admin User 1
│  └─ Admin User 2
│
├─ Organization Users (role: "Organization")
│  ├─ Imran org (_id: "507f...012")
│  │  │
│  │  └─ Has Employees (via organizationId)
│  │     ├─ Employee 1 (organizationId: "507f...012")
│  │     └─ Employee 2 (organizationId: "507f...012")
│  │
│  └─ Other org (_id: "507f...015")
│     │
│     └─ Has Employees (via organizationId)
│        ├─ Employee 3 (organizationId: "507f...015")
│        └─ Employee 4 (organizationId: "507f...015")
│
└─ Employee Users (role: "Employee")
   ├─ Employee 1 (organizationId → Imran org)
   ├─ Employee 2 (organizationId → Imran org)
   ├─ Employee 3 (organizationId → Other org)
   └─ Employee 4 (organizationId → Other org)
```

## Query Examples

### 1. Get All Users (Admin View)

```javascript
// Query
db.users.find({})

// Result: ALL documents from users collection
[
  { _id: "1", name: "Admin", role: "Admin" },
  { _id: "2", name: "Imran org", role: "Organization" },
  { _id: "3", name: "Employee 1", role: "Employee", organizationId: "2" },
  { _id: "4", name: "Employee 2", role: "Employee", organizationId: "2" }
]
```

### 2. Get Organization's Users (Organization View)

```javascript
// Query for Imran org (_id: "507f...012")
db.users.find({
  $or: [
    { organizationId: ObjectId("507f...012") },  // Their employees
    { _id: ObjectId("507f...012") }              // Themselves
  ]
})

// Result: Only Imran org + their employees
[
  { _id: "507f...012", name: "Imran org", role: "Organization" },
  { _id: "507f...013", name: "Employee 1", role: "Employee", organizationId: "507f...012" },
  { _id: "507f...014", name: "Employee 2", role: "Employee", organizationId: "507f...012" }
]
```

### 3. Get All Organizations

```javascript
// Query
db.users.find({ role: "Organization" })

// Result: Only organization users
[
  { _id: "507f...012", name: "Imran org", role: "Organization" },
  { _id: "507f...015", name: "Other org", role: "Organization" }
]
```

### 4. Get Employees of Specific Organization

```javascript
// Query
db.users.find({ 
  role: "Employee",
  organizationId: ObjectId("507f...012")
})

// Result: Only employees of Imran org
[
  { _id: "507f...013", name: "Employee 1", role: "Employee", organizationId: "507f...012" },
  { _id: "507f...014", name: "Employee 2", role: "Employee", organizationId: "507f...012" }
]
```

## Field Breakdown

### Common Fields (All Users)
```javascript
{
  _id: ObjectId,           // Unique identifier
  name: String,            // User's name
  email: String,           // User's email (unique)
  password: String,        // Hashed password
  role: String,            // "Admin" | "Organization" | "Employee"
  isActive: Boolean,       // Account status
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

### Role-Specific Fields

#### Admin
```javascript
{
  role: "Admin",
  organizationId: null     // Admins don't belong to organizations
}
```

#### Organization
```javascript
{
  role: "Organization",
  organizationId: null,    // Organizations don't have organizationId
  organizationName: String,
  organizationEmail: String
}
```

#### Employee
```javascript
{
  role: "Employee",
  organizationId: ObjectId  // References the organization user's _id
}
```

## How organizationId Works

```
Organization User                    Employee Users
┌─────────────────────┐             ┌─────────────────────┐
│ _id: "507f...012"   │◄────────────│ organizationId:     │
│ name: "Imran org"   │             │   "507f...012"      │
│ role: "Organization"│             │ name: "Employee 1"  │
│ organizationId: null│             │ role: "Employee"    │
└─────────────────────┘             └─────────────────────┘
                                    ┌─────────────────────┐
                                    │ organizationId:     │
                                    │   "507f...012"      │
                                    │ name: "Employee 2"  │
                                    │ role: "Employee"    │
                                    └─────────────────────┘
```

The `organizationId` in employee documents points to the `_id` of the organization user.

## Backend Implementation

### User Model (Mongoose)

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Role field - determines user type
  role: {
    type: String,
    enum: ['Admin', 'Organization', 'Employee'],
    required: true
  },
  
  // Organization reference - links employees to organizations
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Self-reference to users collection
    default: null
  },
  
  organizationName: String,
  organizationEmail: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
```

### Routes

```javascript
// GET /api/users - Returns array from same collection
router.get('/users', authMiddleware, async (req, res) => {
  const users = await User.find(query);  // Query same collection
  res.json(users);  // Array of users
});

// GET /api/organizations - Returns filtered array from same collection
router.get('/organizations', authMiddleware, async (req, res) => {
  const orgs = await User.find({ role: 'Organization' });  // Filter by role
  res.json(orgs);  // Array of organization users
});
```

## Summary

✅ **Single Collection**: All users in `users` collection

✅ **Role Field**: Distinguishes Admin, Organization, Employee

✅ **organizationId Field**: Links employees to organizations

✅ **Same Table Queries**: Different filters based on current user's role

✅ **Self-Referencing**: organizationId references _id in same collection

This is the standard, correct design for role-based user management. All users are in the same table, and the `role` field determines their type and permissions.
