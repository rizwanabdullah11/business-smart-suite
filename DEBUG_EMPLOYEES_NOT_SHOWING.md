# 🔍 Debug: Employees Not Showing

## Problem

You created employees from organization account, but they don't appear in the list.

---

## Possible Causes

### 1. Backend Not Running
Employees were created but not saved to database because backend is not running.

### 2. Wrong organizationId
Employees were saved with wrong or missing organizationId.

### 3. Backend Not Filtering Correctly
Backend is not returning employees when organization logs in.

### 4. Frontend Not Refreshing
Frontend didn't reload the user list after creating employees.

---

## Step-by-Step Debugging

### Step 1: Check Backend is Running

```bash
curl http://localhost:5000/api/health
```

**Expected:** `{"status":"ok"}`

**If fails:** Backend is not running. Start it:
```bash
cd backend
npm start
```

---

### Step 2: Check Database

Open MongoDB and check if employees exist:

```javascript
// MongoDB Shell or Compass
db.users.find({ role: 'Employee' }).pretty()
```

**Expected:** Should show employee documents

**If empty:** Employees were not saved to database. Backend issue.

**If exists:** Check the `organizationId` field:
```javascript
db.users.find({ role: 'Employee' }, { name: 1, organizationId: 1 })
```

Should show:
```json
{
  "_id": "emp_id",
  "name": "John Doe",
  "organizationId": "org_id"  // ← This should match organization's _id
}
```

---

### Step 3: Check API Response

**Login as Organization and check what API returns:**

```bash
# 1. Login as organization
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"org@example.com","password":"password"}'

# Save the token

# 2. Get users
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ORG_TOKEN"
```

**Expected Response:**
```json
[
  {
    "_id": "org_id",
    "name": "Organization Name",
    "role": "Organization"
  },
  {
    "_id": "emp_id",
    "name": "Employee Name",
    "role": "Employee",
    "organizationId": "org_id"
  }
]
```

**If only returns organization (not employees):**
- Backend filtering is wrong
- organizationId doesn't match

---

### Step 4: Check organizationId Match

**Get organization's _id:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer ORG_TOKEN"
```

Response:
```json
{
  "_id": "6999eff86d53b0c6371",  // ← Organization's ID
  "name": "Org Name",
  "role": "Organization"
}
```

**Check employee's organizationId:**
```javascript
// In MongoDB
db.users.find({ 
  role: 'Employee',
  organizationId: ObjectId("6999eff86d53b0c6371")  // ← Use org's _id
})
```

**If no results:** organizationId is wrong or missing!

---

## Common Issues & Fixes

### Issue 1: organizationId is null

**Check in MongoDB:**
```javascript
db.users.find({ role: 'Employee', organizationId: null })
```

**If found employees with null organizationId:**

**Fix:** Update them manually:
```javascript
db.users.updateMany(
  { role: 'Employee', organizationId: null },
  { $set: { organizationId: ObjectId("YOUR_ORG_ID") } }
)
```

---

### Issue 2: organizationId is String instead of ObjectId

**Check:**
```javascript
db.users.findOne({ role: 'Employee' })
```

If `organizationId` looks like:
```json
"organizationId": "6999eff86d53b0c6371"  // ← String (wrong)
```

Instead of:
```json
"organizationId": ObjectId("6999eff86d53b0c6371")  // ← ObjectId (correct)
```

**Fix in backend signup route:**
```javascript
// backend/routes/auth.js
if (role === 'Employee') {
  if (currentUser.role === 'Organization') {
    // Convert to ObjectId
    userData.organizationId = mongoose.Types.ObjectId(currentUser._id);
  }
}
```

---

### Issue 3: Backend Not Using Correct Filter

**Check backend routes/users.js:**

```javascript
router.get('/users', authMiddleware, async (req, res) => {
  const currentUser = req.user;
  let query = {};
  
  if (currentUser.role === 'Organization') {
    query = {
      $or: [
        { organizationId: currentUser._id },  // ← Must match
        { _id: currentUser._id }
      ]
    };
  }
  
  const users = await User.find(query);
  res.json(users);
});
```

**Make sure:**
1. ✅ Uses `currentUser._id` not `currentUser.id`
2. ✅ Uses `$or` to include both employees and themselves
3. ✅ Returns array with `res.json(users)`

---

### Issue 4: Frontend Not Refreshing

**After creating employee, frontend should reload:**

```typescript
// app/admin/users/page.tsx
const handleCreateUser = async () => {
  // ... create user ...
  
  // Reload users list
  await loadUsers();  // ← This should be called
};
```

**If not reloading:**
- Close and reopen user management page
- Hard refresh: Ctrl+Shift+R

---

## Quick Fix Script

Run this in MongoDB to check and fix:

```javascript
// 1. Check employees
print("=== Employees ===");
db.users.find({ role: 'Employee' }).forEach(emp => {
  print(`Name: ${emp.name}, OrgID: ${emp.organizationId}`);
});

// 2. Check organizations
print("\n=== Organizations ===");
db.users.find({ role: 'Organization' }).forEach(org => {
  print(`Name: ${org.name}, ID: ${org._id}`);
});

// 3. Find employees with wrong/missing organizationId
print("\n=== Employees with issues ===");
db.users.find({ 
  role: 'Employee',
  $or: [
    { organizationId: null },
    { organizationId: { $exists: false } }
  ]
}).forEach(emp => {
  print(`⚠️ ${emp.name} has no organizationId!`);
});
```

---

## Test Scenario

### Create Employee as Organization

**1. Login as Organization:**
```bash
POST /api/auth/login
{
  "email": "org@example.com",
  "password": "password"
}
```

**2. Create Employee:**
```bash
POST /api/auth/signup
Authorization: Bearer ORG_TOKEN
{
  "name": "Test Employee",
  "email": "test@example.com",
  "password": "password",
  "role": "Employee"
}
```

**3. Check Response:**
Should return:
```json
{
  "_id": "new_emp_id",
  "name": "Test Employee",
  "role": "Employee",
  "organizationId": "org_id"  // ← Should be set automatically
}
```

**4. Get Users:**
```bash
GET /api/users
Authorization: Bearer ORG_TOKEN
```

Should return:
```json
[
  { "_id": "org_id", "name": "Org", "role": "Organization" },
  { "_id": "emp_id", "name": "Test Employee", "role": "Employee", "organizationId": "org_id" }
]
```

---

## Backend Logs to Check

When organization creates employee, backend should log:

```
POST /api/auth/signup
Signup attempt: test@example.com Role: Employee By: org@example.com
Creating user with organizationId: 6999eff86d53b0c6371
User created successfully: test@example.com Role: Employee
```

When organization gets users, backend should log:

```
GET /users - Current user: org@example.com Role: Organization
Organization: Filtering by organizationId: 6999eff86d53b0c6371
Found 2 users
```

**If you don't see these logs:** Backend is not running or routes not registered.

---

## Solution Checklist

- [ ] Backend is running on port 5000
- [ ] Employees exist in MongoDB
- [ ] Employees have correct organizationId (matches org's _id)
- [ ] organizationId is ObjectId type (not string)
- [ ] Backend filter uses `currentUser._id`
- [ ] Backend returns array
- [ ] Frontend reloads after creating employee
- [ ] No errors in browser console
- [ ] No errors in backend console

---

## Quick Test

**Run this to verify everything:**

```bash
# 1. Check backend
curl http://localhost:5000/api/health

# 2. Login as organization
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"org@example.com","password":"password"}' \
  | jq -r '.token')

# 3. Get users
curl -s http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# Should show organization + their employees
```

---

## Most Likely Issue

Based on your description, the most likely issue is:

**Backend is not running or not using the correct routes from `backend-complete/` folder.**

**Solution:**
1. Make sure you copied all files from `backend-complete/`
2. Start backend: `cd backend && npm start`
3. Check backend logs when creating employee
4. Check backend logs when getting users
5. Verify API returns array with employees

**The frontend is correct. The issue is in the backend!** 🔧
