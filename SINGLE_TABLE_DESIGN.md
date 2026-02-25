# ✅ Single Table Design - All Users in One Collection

## Correct Design (What You Have)

All users (Admin, Organization, Employee) are stored in the **SAME MongoDB collection** called `users`.

### MongoDB Collection: `users`

```javascript
// Collection name: users
// All user types stored here

// Example documents:
[
  // Admin user
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "Admin User",
    email: "admin@example.com",
    password: "hashed_password",
    role: "Admin",                    // ← Role field distinguishes user type
    organizationId: null,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  
  // Organization user
  {
    _id: ObjectId("507f1f77bcf86cd799439012"),
    name: "Imran org",
    email: "imran@example.com",
    password: "hashed_password",
    role: "Organization",             // ← Role field
    organizationId: null,             // Organizations don't have organizationId
    organizationName: "Imran org",
    organizationEmail: "imran@example.com",
    isActive: true,
    createdAt: "2024-01-02T00:00:00.000Z"
  },
  
  // Employee user
  {
    _id: ObjectId("507f1f77bcf86cd799439013"),
    name: "Employee 1",
    email: "emp1@example.com",
    password: "hashed_password",
    role: "Employee",                 // ← Role field
    organizationId: ObjectId("507f1f77bcf86cd799439012"),  // Points to Imran org
    isActive: true,
    createdAt: "2024-01-03T00:00:00.000Z"
  },
  
  // Another employee
  {
    _id: ObjectId("507f1f77bcf86cd799439014"),
    name: "Employee 2",
    email: "emp2@example.com",
    password: "hashed_password",
    role: "Employee",                 // ← Role field
    organizationId: ObjectId("507f1f77bcf86cd799439012"),  // Same org
    isActive: true,
    createdAt: "2024-01-04T00:00:00.000Z"
  }
]
```

## User Model Schema

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  
  // ✅ ROLE FIELD - Distinguishes user type
  role: {
    type: String,
    enum: ['Admin', 'Organization', 'Employee'],  // Only these 3 values allowed
    required: true
  },
  
  // ✅ ORGANIZATION ID - Links employees to organizations
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References another user (the organization)
    default: null
  },
  
  organizationName: String,
  organizationEmail: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});
```

## How Role-Based Filtering Works

### Backend Query Logic

```javascript
// GET /api/users
router.get('/users', authMiddleware, async (req, res) => {
  const currentUser = req.user;
  let query = {};
  
  // Filter based on role
  if (currentUser.role === 'Admin') {
    // Admin: No filter - get ALL users from the table
    query = {};
    
  } else if (currentUser.role === 'Organization') {
    // Organization: Filter to get only their employees + themselves
    query = {
      $or: [
        { organizationId: currentUser._id },  // Employees with their ID
        { _id: currentUser._id }              // Themselves
      ]
    };
    
  } else if (currentUser.role === 'Employee') {
    // Employee: Not allowed
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Query the SAME table with different filters
  const users = await User.find(query).select('-password');
  res.json(users);  // Always returns array
});
```

## What Each Role Sees (From Same Table)

### Admin Query
```javascript
// Query: {}  (no filter)
// Returns: ALL users from the table

db.users.find({})
// Result:
[
  { name: "Admin User", role: "Admin" },
  { name: "Imran org", role: "Organization" },
  { name: "Employee 1", role: "Employee", organizationId: "..." },
  { name: "Employee 2", role: "Employee", organizationId: "..." }
]
```

### Organization Query (Imran org)
```javascript
// Query: { $or: [{ organizationId: "507f..." }, { _id: "507f..." }] }
// Returns: Only their employees + themselves

db.users.find({
  $or: [
    { organizationId: ObjectId("507f1f77bcf86cd799439012") },
    { _id: ObjectId("507f1f77bcf86cd799439012") }
  ]
})
// Result:
[
  { name: "Imran org", role: "Organization", _id: "507f...012" },
  { name: "Employee 1", role: "Employee", organizationId: "507f...012" },
  { name: "Employee 2", role: "Employee", organizationId: "507f...012" }
]
```

### Employee Query
```javascript
// No query - returns 403 Forbidden
// Employees cannot access user management
```

## Getting Organizations

Organizations are just users with `role: "Organization"`:

```javascript
// GET /api/organizations
router.get('/organizations', authMiddleware, async (req, res) => {
  const currentUser = req.user;
  let query = { role: 'Organization' };  // Filter by role
  
  if (currentUser.role === 'Admin') {
    // Admin sees all organizations
    query = { role: 'Organization' };
    
  } else if (currentUser.role === 'Organization') {
    // Organization sees only themselves
    query = { 
      role: 'Organization',
      _id: currentUser._id 
    };
  }
  
  // Query the SAME users table, filtered by role
  const organizations = await User.find(query).select('-password');
  res.json(organizations);
});
```

## Key Points

### ✅ Correct Design (What You Have)

1. **One Collection**: All users in `users` collection
2. **Role Field**: `role: 'Admin' | 'Organization' | 'Employee'`
3. **organizationId Field**: Links employees to organizations
4. **Query Filtering**: Different queries based on current user's role
5. **Same Table**: Admin, Organization, and Employee are all in the same table

### ❌ Wrong Design (What You DON'T Have)

1. ~~Separate collections for each role~~
2. ~~Different tables for admins, organizations, employees~~
3. ~~Multiple user models~~

## MongoDB Queries to Verify

```javascript
// Check all users in the collection
db.users.find({})

// Count by role
db.users.countDocuments({ role: 'Admin' })
db.users.countDocuments({ role: 'Organization' })
db.users.countDocuments({ role: 'Employee' })

// Find employees of specific organization
db.users.find({ 
  role: 'Employee',
  organizationId: ObjectId("507f1f77bcf86cd799439012")
})

// Find all organizations
db.users.find({ role: 'Organization' })
```

## Why Single Table Design?

### Advantages

1. **Simplicity**: One model, one collection
2. **Flexibility**: Easy to query across all users
3. **Relationships**: organizationId references same table
4. **Performance**: Single index, single query
5. **Maintainability**: One schema to manage

### How It Works

```
users collection
├── Admin users (role: "Admin")
├── Organization users (role: "Organization")
└── Employee users (role: "Employee", organizationId: <org_id>)
```

All in the same table, differentiated by the `role` field.

## Your Backend Should Return

```javascript
// GET /api/users (Admin)
[
  { _id: "1", name: "Admin", role: "Admin" },
  { _id: "2", name: "Org", role: "Organization" },
  { _id: "3", name: "Emp1", role: "Employee", organizationId: "2" },
  { _id: "4", name: "Emp2", role: "Employee", organizationId: "2" }
]

// GET /api/users (Organization with _id: "2")
[
  { _id: "2", name: "Org", role: "Organization" },
  { _id: "3", name: "Emp1", role: "Employee", organizationId: "2" },
  { _id: "4", name: "Emp2", role: "Employee", organizationId: "2" }
]
```

## Summary

✅ **YES**: All users (Admin, Organization, Employee) are in the **SAME table** (`users` collection)

✅ **YES**: The `role` field determines the user type

✅ **YES**: The `organizationId` field links employees to their organization

✅ **YES**: Backend filters the same table based on current user's role

This is the correct design and it's already implemented in `backend-complete/`.
