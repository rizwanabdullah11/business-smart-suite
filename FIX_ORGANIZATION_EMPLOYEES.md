# 🔧 Fix: Organization Should See All Their Employees

## The Problem You're Seeing

When you login as **Organization** (Imran org), you should see:
- ✅ Yourself (Imran org)
- ✅ Employee 1 (your employee)
- ✅ Employee 2 (your employee)
- ✅ All employees you created

But instead you see:
- ❌ Only 1 user (yourself or one employee)
- ❌ "Employees (0)" tab shows "No Employee Users"

## Why This Happens

Your backend `/api/users` endpoint is returning a **single object** instead of an **array**:

```javascript
// ❌ What your backend is doing (WRONG)
router.get('/users', authMiddleware, async (req, res) => {
  const user = await User.findOne()  // Returns ONE user
  res.json(user)  // Sends: { _id: "...", name: "Imran org" }
})
```

## The Fix

Your backend needs to return an **array of users** filtered by organization:

```javascript
// ✅ What your backend should do (CORRECT)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    let query = {};
    
    if (currentUser.role === 'Admin') {
      // Admin sees ALL users
      query = {};
      
    } else if (currentUser.role === 'Organization') {
      // Organization sees their employees + themselves
      query = {
        $or: [
          { organizationId: currentUser._id },  // Employees with their ID
          { _id: currentUser._id }              // Themselves
        ]
      };
      
    } else if (currentUser.role === 'Employee') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // IMPORTANT: Use find() not findOne()
    const users = await User.find(query).select('-password');
    
    // IMPORTANT: Return array
    res.json(users);  // [{ ... }, { ... }, ...]
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Step-by-Step Fix

### Option 1: Use Complete Backend (FASTEST)

```bash
cd backend-complete
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm start
```

This backend already has the correct implementation.

### Option 2: Fix Your Backend

1. **Find your backend `/users` route**
   - Look in: `routes/users.js`, `routes/user.js`, or `controllers/userController.js`

2. **Locate the GET /users endpoint**
   ```javascript
   router.get('/users', authMiddleware, async (req, res) => {
     // Your code here
   })
   ```

3. **Replace with this code:**
   ```javascript
   router.get('/users', authMiddleware, async (req, res) => {
     try {
       const currentUser = req.user;
       let query = {};
       
       console.log('GET /users - Current user:', currentUser.email, 'Role:', currentUser.role);
       
       // Role-based filtering
       if (currentUser.role === 'Admin') {
         query = {};
         console.log('Admin: Returning all users');
       } 
       else if (currentUser.role === 'Organization') {
         query = {
           $or: [
             { organizationId: currentUser._id },
             { _id: currentUser._id }
           ]
         };
         console.log('Organization: Filtering by organizationId:', currentUser._id);
       } 
       else if (currentUser.role === 'Employee') {
         console.log('Employee: Access denied');
         return res.status(403).json({ 
           error: 'Forbidden',
           message: 'Employees cannot access user management' 
         });
       }
       
       // Fetch users from database
       const users = await User.find(query)
         .select('-password')
         .sort({ createdAt: -1 });
       
       console.log(`Found ${users.length} users`);
       
       // IMPORTANT: Always return an array
       res.json(users);
       
     } catch (error) {
       console.error('Error fetching users:', error);
       res.status(500).json({ 
         error: 'Failed to fetch users',
         message: error.message 
       });
     }
   });
   ```

4. **Save and restart your backend**

## Verify the Fix

### Method 1: Use Diagnostic Tool

```bash
# Get your token from browser console:
# localStorage.getItem('token')

node diagnose-backend.js YOUR_TOKEN_HERE
```

Should show:
```
✅ Response is an array (CORRECT)
✅ Found 3 users
   - Admins: 0
   - Organizations: 1
   - Employees: 2

📋 Users List:
   1. Imran org (imran@example.com)
      Role: Organization
      
   2. Employee 1 (emp1@example.com)
      Role: Employee
      Organization ID: 507f...
      
   3. Employee 2 (emp2@example.com)
      Role: Employee
      Organization ID: 507f...
```

### Method 2: Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the user management page
4. Find the request to `/api/users`
5. Check the response

**Wrong response (what you have now):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Imran org",
  "email": "imran@example.com",
  "role": "Organization"
}
```

**Correct response (what you need):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Imran org",
    "email": "imran@example.com",
    "role": "Organization"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Employee 1",
    "email": "emp1@example.com",
    "role": "Employee",
    "organizationId": "507f1f77bcf86cd799439012"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Employee 2",
    "email": "emp2@example.com",
    "role": "Employee",
    "organizationId": "507f1f77bcf86cd799439012"
  }
]
```

## What You'll See After Fix

### Organization Login (Imran org)

```
User Management
┌─────────────────────────────────────────────────────────┐
│ [All Users (3)] [Employees (2)]                         │
├─────────────────────────────────────────────────────────┤
│ User          │ Role         │ Created                  │
├─────────────────────────────────────────────────────────┤
│ Imran org     │ Organization │ 2024-01-02               │
│ Employee 1    │ Employee     │ 2024-01-03               │
│ Employee 2    │ Employee     │ 2024-01-04               │
└─────────────────────────────────────────────────────────┘
```

### Click "Employees (2)" Tab

```
User Management
┌─────────────────────────────────────────────────────────┐
│ [All Users (3)] [Employees (2)] ← Active                │
├─────────────────────────────────────────────────────────┤
│ User          │ Role         │ Created                  │
├─────────────────────────────────────────────────────────┤
│ Employee 1    │ Employee     │ 2024-01-03               │
│ Employee 2    │ Employee     │ 2024-01-04               │
└─────────────────────────────────────────────────────────┘
```

## Check Your Database

Make sure employees actually exist in MongoDB:

```javascript
// Connect to MongoDB and run:
db.users.find({ role: 'Employee' })

// Should show:
[
  {
    _id: ObjectId("..."),
    name: "Employee 1",
    email: "emp1@example.com",
    role: "Employee",
    organizationId: ObjectId("507f1f77bcf86cd799439012")  // Imran org's _id
  },
  {
    _id: ObjectId("..."),
    name: "Employee 2",
    email: "emp2@example.com",
    role: "Employee",
    organizationId: ObjectId("507f1f77bcf86cd799439012")  // Imran org's _id
  }
]
```

If employees don't exist, create them:
1. Login as Organization (Imran org)
2. Click "Add User"
3. Fill in employee details
4. Click "Create User"

## Common Issues

### "Still showing 0 employees"

**Possible causes:**

1. **Backend not returning array**
   - Check backend logs
   - Verify you're using `User.find()` not `User.findOne()`

2. **Employees don't exist in database**
   - Check MongoDB: `db.users.find({ role: 'Employee' })`
   - Create employees from organization account

3. **organizationId doesn't match**
   - Employee's `organizationId` must match organization's `_id`
   - Check: `db.users.find({ role: 'Employee' })`
   - Verify `organizationId` field exists and has correct value

4. **Backend not filtering correctly**
   - Check backend logs for the query being used
   - Should see: `{ $or: [{ organizationId: "..." }, { _id: "..." }] }`

## Backend Query Explanation

When Organization (Imran org with _id: "507f...012") logs in:

```javascript
// Backend builds this query:
{
  $or: [
    { organizationId: "507f1f77bcf86cd799439012" },  // Find employees
    { _id: "507f1f77bcf86cd799439012" }              // Include themselves
  ]
}

// This matches:
// 1. Imran org (because _id matches)
// 2. Employee 1 (because organizationId matches)
// 3. Employee 2 (because organizationId matches)

// Returns array of 3 users
```

## Summary

The issue is your backend is returning:
```javascript
res.json(user)  // Single object
```

It should return:
```javascript
res.json(users)  // Array of objects
```

Change `User.findOne()` to `User.find(query)` and you're done!

See `backend-complete/routes/users.js` for the complete correct implementation.
