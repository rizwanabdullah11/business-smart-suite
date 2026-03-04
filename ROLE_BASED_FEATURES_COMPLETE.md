# ✅ Complete Role-Based Features Guide

## Overview

This system has 3 roles with different permissions and access levels:
1. **Admin** - Full access to everything
2. **Organization** - Manages their employees only
3. **Employee** - Read-only access

---

## 🎯 Role-Based Features Matrix

### Admin Role

**User Management:**
- ✅ View ALL users (admins, organizations, employees)
- ✅ Create any role (Admin, Organization, Employee)
- ✅ Edit any user
- ✅ Delete any user
- ✅ See organization dropdown when creating employees
- ✅ Can assign employees to any organization

**Filter Tabs:**
- All Users (shows everyone)
- Organizations (shows all organizations)
- Admins (shows all admins)
- Employees (shows all employees)

**Organization Dropdown:**
- Shows ALL organizations in the system
- Can select any organization for new employees
- Can leave empty (no organization)

### Organization Role

**User Management:**
- ✅ View ONLY their employees + themselves
- ✅ Create employees (auto-assigned to their organization)
- ✅ Edit their employees only
- ✅ Delete their employees (not themselves)
- ❌ Cannot see other organizations
- ❌ Cannot create admins or organizations
- ❌ No organization dropdown (auto-assigned)

**Filter Tabs:**
- All Users (shows their employees only)
- Organizations (shows 0 - they can't see other orgs)
- Admins (shows 0 - they can't see admins)
- Employees (shows their employees)

**Organization Dropdown:**
- NOT SHOWN (employees auto-assigned to their org)

### Employee Role

**User Management:**
- ❌ Cannot access user management page
- ❌ Redirected to unauthorized page (403)
- ❌ Cannot create users
- ❌ Cannot edit users
- ❌ Cannot delete users

**Access:**
- Can view their own profile
- Can access allowed pages (dashboard, etc.)

---

## 🔧 Current Implementation Status

### ✅ What's Working

1. **Permission System:**
   - 50+ granular permissions defined
   - Role-based permission checking
   - Permission gates in UI

2. **User Management UI:**
   - Complete CRUD interface
   - Filter tabs
   - Search functionality
   - Role-based visibility

3. **API Routes:**
   - Dynamic filtering based on role
   - Fallback system when backend unavailable
   - Multi-method endpoint detection

4. **Token Refresh:**
   - Automatic refresh on role switch
   - No hard reload needed
   - Multi-tab synchronization

### ⚠️ What Needs Backend Running

1. **Organization Dropdown:**
   - Currently empty because backend not running
   - Will populate once backend starts
   - Fetches from `/api/organizations`

2. **User List:**
   - Currently shows 1 user (mock data)
   - Will show all users once backend starts
   - Fetches from `/api/users`

3. **Role-Based Filtering:**
   - Logic is implemented
   - Needs backend to return filtered data
   - Backend must implement filtering by role

---

## 🚀 How to Make Everything Work

### Step 1: Start Backend Server

```bash
# Check if backend is running
node check-backend.js

# If not running, start it
cd path/to/your/backend
npm start
```

**Expected output:**
```
Server running on port 5000
MongoDB connected
```

### Step 2: Verify Backend Endpoints

Go to: http://localhost:3000/admin/diagnostics

**Should show:**
- ✅ Auth - Me (GET /auth/me)
- ✅ Users - List (GET /users)
- ✅ Users - Get by ID (GET /users/:id)
- ✅ Users - Update (PUT /users/:id)
- ✅ Users - Delete (DELETE /users/:id)

### Step 3: Create Test Users

**Create Organization User:**
1. Login as Admin
2. Go to User Management
3. Click "Add User"
4. Fill in:
   - Name: `Acme Corporation`
   - Email: `admin@acme.com`
   - Password: `password123`
   - Role: **Organization**
5. Click "Create User"

**Create Employee User:**
1. Still logged in as Admin
2. Click "Add User" again
3. Fill in:
   - Name: `John Doe`
   - Email: `john@acme.com`
   - Password: `password123`
   - Role: **Employee**
   - Organization: **Acme Corporation** (should appear in dropdown)
5. Click "Create User"

### Step 4: Test Role-Based Features

**Test as Admin:**
1. Login as admin
2. Go to User Management
3. Verify:
   - ✅ See all users (admin, organization, employee)
   - ✅ Organization dropdown shows "Acme Corporation"
   - ✅ Can edit any user
   - ✅ Can delete any user

**Test as Organization:**
1. Logout
2. Login as `admin@acme.com`
3. Go to User Management
4. Verify:
   - ✅ See only "John Doe" (their employee)
   - ✅ See themselves
   - ✅ Don't see other organizations
   - ✅ Don't see admin users
   - ✅ No organization dropdown when creating employee
   - ✅ New employees auto-assigned to their org

**Test as Employee:**
1. Logout
2. Login as `john@acme.com`
3. Try to access User Management
4. Verify:
   - ✅ Redirected to unauthorized page (403)
   - ✅ Cannot access user management

---

## 📊 Backend Implementation Required

Your backend needs these endpoints with role-based filtering:

### GET /api/users

```javascript
router.get('/users', authMiddleware, async (req, res) => {
  const currentUser = req.user;
  let query = {};
  
  // Role-based filtering
  if (currentUser.role === 'Organization') {
    // Organizations see their employees + themselves
    query = {
      $or: [
        { organizationId: currentUser._id },
        { _id: currentUser._id }
      ]
    };
  } else if (currentUser.role === 'Employee') {
    // Employees cannot access user management
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Admin: No filter, sees everyone
  
  const users = await User.find(query).select('-password');
  res.json(users);
});
```

### GET /api/organizations

```javascript
router.get('/organizations', authMiddleware, async (req, res) => {
  const currentUser = req.user;
  let query = { role: 'Organization' };
  
  // Organizations can only see themselves
  if (currentUser.role === 'Organization') {
    query._id = currentUser._id;
  }
  
  const organizations = await User.find(query).select('-password');
  res.json(organizations);
});
```

**Files ready to copy:**
- `backend-files/routes/users.js` - Complete routes
- `backend-files/controllers/userController-additions.js` - Controller functions

---

## 🔍 Troubleshooting

### Issue: Organization dropdown empty

**Cause:** Backend not running or no organizations exist

**Solution:**
1. Start backend: `npm start`
2. Create organization user
3. Reopen "Add User" modal
4. Dropdown should populate

**Debug:**
```javascript
// In browser console
fetch('/api/organizations', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(data => console.log('Organizations:', data))
```

### Issue: Admin sees only 1 user

**Cause:** Backend not running, using fallback mode

**Solution:**
1. Start backend server
2. Refresh user management page
3. Should see all users from database

**Debug:**
```bash
node check-backend.js
```

### Issue: Organization sees all users (not filtered)

**Cause:** Backend not implementing role-based filtering

**Solution:**
1. Check backend `/users` endpoint
2. Ensure it filters by `organizationId` for Organization role
3. See `backend-files/routes/users.js` for implementation

**Test:**
```bash
# As organization user
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ORG_TOKEN"

# Should return only their employees
```

### Issue: Employee can access user management

**Cause:** Permission check not working

**Solution:**
1. Check `usePermissions()` hook is used
2. Verify `Permission.VIEW_USERS` is checked
3. Backend should return 403 for employees

**Check:**
```typescript
// In component
const { can } = usePermissions()

useEffect(() => {
  if (!can(Permission.VIEW_USERS)) {
    router.push('/unauthorized')
  }
}, [can])
```

---

## ✅ Verification Checklist

### Admin Role
- [ ] Can see all users in table
- [ ] Filter tabs show accurate counts
- [ ] Organization dropdown shows all organizations
- [ ] Can create Admin, Organization, Employee
- [ ] Can edit any user
- [ ] Can delete any user
- [ ] "Show Admin Users" toggle works

### Organization Role
- [ ] Can see only their employees
- [ ] Can see themselves in table
- [ ] Cannot see other organizations
- [ ] Cannot see admin users
- [ ] Filter tabs show their employees only
- [ ] No organization dropdown (auto-assigned)
- [ ] Can create employees
- [ ] Can edit their employees
- [ ] Can delete their employees (not themselves)

### Employee Role
- [ ] Cannot access user management page
- [ ] Redirected to unauthorized page
- [ ] 403 error in console
- [ ] Can access dashboard
- [ ] Can view their profile

### Backend
- [ ] Server running on port 5000
- [ ] MongoDB connected
- [ ] GET /users endpoint exists
- [ ] GET /users implements role-based filtering
- [ ] GET /organizations endpoint exists
- [ ] POST /users (signup) works
- [ ] PUT /users/:id works
- [ ] DELETE /users/:id works

### Frontend
- [ ] No ECONNREFUSED errors
- [ ] Organizations load when modal opens
- [ ] Users list updates after CRUD operations
- [ ] Token refresh works on role switch
- [ ] No hard reload needed
- [ ] Console shows helpful logs

---

## 🎯 Expected Behavior Examples

### Example 1: Admin Creates Employee

1. Admin logs in
2. Clicks "Add User"
3. Sees organization dropdown with options:
   - Acme Corporation
   - Tech Solutions
   - Global Industries
4. Selects "Acme Corporation"
5. Creates employee
6. Employee is assigned to Acme Corporation
7. Acme Corporation can now see this employee

### Example 2: Organization Creates Employee

1. Organization logs in (Acme Corporation)
2. Clicks "Add User"
3. Role is pre-set to "Employee"
4. NO organization dropdown shown
5. Creates employee
6. Employee is automatically assigned to Acme Corporation
7. Employee appears in their user list

### Example 3: Organization Views Users

1. Organization logs in (Acme Corporation)
2. Goes to User Management
3. Sees table with:
   - Acme Corporation (themselves)
   - John Doe (their employee)
   - Jane Smith (their employee)
4. Does NOT see:
   - Admin users
   - Other organizations
   - Other organizations' employees

### Example 4: Employee Tries to Access

1. Employee logs in
2. Tries to access User Management
3. Immediately redirected to unauthorized page
4. Sees message: "You don't have permission to access this page"
5. Can still access dashboard and other allowed pages

---

## 📚 Related Documentation

- **START_BACKEND_SERVER.md** - Backend setup guide
- **ORGANIZATION_DROPDOWN_GUIDE.md** - Organization dropdown troubleshooting
- **TOKEN_REFRESH_GUIDE.md** - Token refresh system
- **ROLE_COMPARISON.md** - Detailed role comparison

---

## 🎉 Success Criteria

Your system is working correctly when:

1. ✅ Backend server is running
2. ✅ Admin sees ALL users
3. ✅ Organization sees ONLY their employees
4. ✅ Employee CANNOT access user management
5. ✅ Organization dropdown populates for admin
6. ✅ No organization dropdown for organization role
7. ✅ Filter tabs show accurate counts per role
8. ✅ CRUD operations work for all allowed roles
9. ✅ Token refresh works without hard reload
10. ✅ No ECONNREFUSED errors in console

**Once all criteria are met, you have a fully functional role-based user management system!** 🚀
