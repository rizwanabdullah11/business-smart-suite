# API Endpoints Explained - /auth/me vs /users 📚

## Two Different Endpoints, Two Different Purposes

### GET /api/auth/me
**Purpose**: Get information about the CURRENT logged-in user

**Returns**: Single user object (NOT an array)

**Example Response**:
```json
{
  "id": "674a9f9e9e6d3bf3bfb00001",
  "name": "Imran",
  "email": "test@gmail.com",
  "role": "admin",
  "organizationId": null
}
```

**Used For**:
- Authentication checks
- Getting current user's role
- Permission checks
- Profile information
- Sidebar user display

**Frontend Usage**:
```typescript
// In auth context, layout, etc.
const response = await fetch('/api/auth/me')
const currentUser = await response.json()
// currentUser is an OBJECT, not an array
```

---

### GET /api/users
**Purpose**: Get a LIST of all users (for user management)

**Returns**: Array of user objects

**Example Response**:
```json
[
  {
    "_id": "674a9f9e9e6d3bf3bfb00001",
    "name": "Imran",
    "email": "test@gmail.com",
    "role": "Admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "674a9f9e9e6d3bf3bfb00002",
    "name": "test423432",
    "email": "test423432@gmail.com",
    "role": "Organization",
    "organizationName": "test423432",
    "organizationEmail": "test423432@gmail.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "674a9f9e9e6d3bf3bfb00003",
    "name": "John Employee",
    "email": "john@test.com",
    "role": "Employee",
    "organizationId": "674a9f9e9e6d3bf3bfb00002",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Used For**:
- User management page
- Displaying list of all users
- Admin/Organization managing their users
- User counts and statistics

**Frontend Usage**:
```typescript
// In user management page
const response = await fetch('/api/users')
const usersList = await response.json()
// usersList is an ARRAY of users
```

---

## Key Differences

| Feature | /auth/me | /users |
|---------|----------|--------|
| **Returns** | Single object | Array of objects |
| **Purpose** | Current user info | List all users |
| **Access** | Anyone authenticated | Admin/Organization only |
| **Filtering** | No filtering (always current user) | Role-based filtering |
| **Used In** | Auth context, layout, profile | User management page |

## Backend Implementation

### /auth/me Endpoint
```javascript
// Returns SINGLE user object
router.get('/auth/me', authMiddleware, (req, res) => {
  // req.user is set by authMiddleware
  res.json(req.user); // Single object
});
```

### /users Endpoint
```javascript
// Returns ARRAY of users
router.get('/users', authMiddleware, async (req, res) => {
  let query = {};
  
  // Apply role-based filtering
  if (req.user.role === 'Organization') {
    query = {
      $or: [
        { organizationId: req.user._id },
        { _id: req.user._id }
      ]
    };
  }
  
  const users = await User.find(query).select('-password');
  res.json(users); // Array of objects
});
```

## Common Confusion

### ❌ Wrong: Using /auth/me for user list
```typescript
// This is WRONG - /auth/me returns single user, not array
const response = await fetch('/api/auth/me')
const users = await response.json()
users.map(user => ...) // ERROR: users is not an array!
```

### ✅ Correct: Using /users for user list
```typescript
// This is CORRECT - /users returns array
const response = await fetch('/api/users')
const users = await response.json()
users.map(user => ...) // Works! users is an array
```

### ✅ Correct: Using /auth/me for current user
```typescript
// This is CORRECT - /auth/me returns single user
const response = await fetch('/api/auth/me')
const currentUser = await response.json()
console.log(currentUser.name) // Works! currentUser is an object
```

## Your Current Setup

Based on your logs:

✅ **POST /api/users** - Working (201 response)
- Creates new users
- Returns created user object

✅ **GET /api/users** - Working (200 response)
- Returns array of all users
- Used in user management page

✅ **GET /api/auth/me** - Working
- Returns current user object
- Used in auth context

## Summary

- **`/auth/me`** = "Who am I?" → Returns YOUR user info (single object)
- **`/users`** = "Who are all the users?" → Returns ALL users (array)

Both endpoints are needed and serve different purposes! 🎯
