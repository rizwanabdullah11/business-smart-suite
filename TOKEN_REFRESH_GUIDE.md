# 🔄 Token Refresh & Role Switching Guide

## Overview

The system now supports seamless role switching without hard reloads. When you logout and login with a different role, the application automatically refreshes all role-based features.

---

## ✅ What's Fixed

### 1. Automatic Token Refresh
- Login clears old tokens before setting new ones
- Auth context automatically detects token changes
- No hard reload needed when switching roles

### 2. Role-Based Features Update
- Permissions refresh automatically
- Sidebar updates based on new role
- User management filters update
- Organization dropdown updates

### 3. Clean Logout
- All tokens cleared (localStorage + cookies)
- User state reset immediately
- Smooth redirect to login page

---

## 🔄 How It Works

### Login Flow

```
User enters credentials
    ↓
Clear old tokens (if any)
    ↓
Backend validates credentials
    ↓
Store new token + user data
    ↓
Trigger storage event
    ↓
Auth context refreshes
    ↓
Redirect to dashboard
    ↓
Role-based features load
```

### Logout Flow

```
User clicks logout
    ↓
Clear localStorage tokens
    ↓
Clear cookies
    ↓
Reset user state
    ↓
Redirect to login
    ↓
Ready for new login
```

### Role Switch Flow

```
Logout as Admin
    ↓
Login as Organization
    ↓
Token refreshed automatically
    ↓
Permissions updated
    ↓
UI updates (no reload)
    ↓
See organization-specific features
```

---

## 🎯 Testing Role-Based Features

### Test Scenario 1: Admin → Organization

1. **Login as Admin:**
   - Email: `admin@example.com`
   - See: All users, all organizations, all employees

2. **Logout:**
   - Click logout button
   - Redirected to login page

3. **Login as Organization:**
   - Email: `org@example.com`
   - See: Only your employees, no other organizations

4. **Verify:**
   - ✅ No hard reload needed
   - ✅ User management shows filtered users
   - ✅ Sidebar shows organization-specific items
   - ✅ Permissions updated automatically

### Test Scenario 2: Organization → Employee

1. **Login as Organization:**
   - Can access user management
   - Can create employees

2. **Logout and Login as Employee:**
   - Cannot access user management (403)
   - Redirected to unauthorized page

3. **Verify:**
   - ✅ Permissions enforced immediately
   - ✅ No access to restricted pages

### Test Scenario 3: Multiple Tab Sync

1. **Open two browser tabs**

2. **Login in Tab 1:**
   - Token stored

3. **Tab 2 automatically updates:**
   - Detects token change
   - Loads user data
   - Shows dashboard

4. **Logout in Tab 1:**
   - Token cleared

5. **Tab 2 automatically updates:**
   - Detects token removal
   - Clears user state
   - Shows login page

---

## 🔍 Console Logs

When switching roles, you'll see these logs:

### Login
```
🔄 Auth: Storage event detected, refreshing user...
🔍 Auth: Fetching user data...
✅ Auth: User loaded - John Doe (organization)
```

### Logout
```
🚪 Auth: Logging out...
✅ Auth: Logout complete, redirecting to login...
```

### Role Change
```
🔄 Auth: Token changed, refreshing user...
🔍 Auth: Fetching user data...
✅ Auth: User loaded - Jane Smith (admin)
🔄 Loading organizations...
✅ Organizations loaded: 3 organizations
```

---

## 🛠️ Technical Implementation

### Auth Context (`contexts/auth-context.tsx`)

**Features:**
- Listens for storage events (token changes)
- Automatically refreshes user data
- Provides logout function
- Exposes role-based helpers

**Key Functions:**
```typescript
fetchUser()      // Loads user from /api/auth/me
logout()         // Clears tokens and redirects
refreshUser()    // Manual refresh trigger
```

### Login Page (`app/login/page.tsx`)

**Features:**
- Clears old tokens before login
- Stores new token + user data
- Triggers storage event
- Delays redirect for auth context update

**Key Changes:**
```typescript
// Clear old data
localStorage.removeItem("token")
localStorage.removeItem("user")

// Set new data
localStorage.setItem("token", data.token)
localStorage.setItem("user", JSON.stringify(data.user))

// Trigger refresh
window.dispatchEvent(new Event('storage'))
```

### App Layout (`components/layout/AppLayout.tsx`)

**Features:**
- Uses AuthContext instead of local state
- Automatic redirect if not authenticated
- Unified logout handler
- No duplicate auth checks

**Key Changes:**
```typescript
const { user, loading, isAuthenticated, logout } = useAuth()

// Redirect if not authenticated
useEffect(() => {
  if (!loading && !isAuthenticated) {
    router.push('/login')
  }
}, [loading, isAuthenticated])
```

---

## 📊 Role-Based Feature Matrix

### Admin Role
- ✅ View all users
- ✅ Create any role (Admin, Organization, Employee)
- ✅ Edit any user
- ✅ Delete any user
- ✅ See all organizations
- ✅ Access all pages

### Organization Role
- ✅ View their employees only
- ✅ Create employees (auto-assigned to their org)
- ✅ Edit their employees
- ✅ Delete their employees
- ❌ Cannot see other organizations
- ❌ Cannot create admins or organizations

### Employee Role
- ❌ Cannot access user management
- ❌ Cannot create users
- ❌ Cannot edit users
- ❌ Cannot delete users
- ✅ Can view their own profile
- ✅ Can access allowed pages

---

## 🐛 Troubleshooting

### Issue: Hard reload still needed

**Possible causes:**
1. Browser cache
2. Service worker
3. Old code version

**Solution:**
```bash
# Clear browser cache
Ctrl+Shift+Delete (Windows)
Cmd+Shift+Delete (Mac)

# Hard refresh
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# Restart dev server
npm run dev
```

### Issue: Permissions not updating

**Check console for:**
```
✅ Auth: User loaded - [name] ([role])
```

**If not appearing:**
1. Check token in localStorage
2. Verify /api/auth/me endpoint
3. Check backend is running

**Solution:**
```javascript
// In browser console
localStorage.getItem('token')  // Should return token
fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(console.log)
```

### Issue: Organization dropdown empty after role switch

**Cause:** Organizations not reloading

**Solution:**
1. Close and reopen "Add User" modal
2. Organizations load when modal opens
3. Check console for:
   ```
   🔄 Loading organizations...
   ✅ Organizations loaded: X organizations
   ```

### Issue: Still seeing old role's data

**Cause:** Component state not refreshing

**Solution:**
1. Check if component uses `usePermissions()` hook
2. Verify `can()` function is used for permissions
3. Add dependency on `user` in useEffect:
   ```typescript
   useEffect(() => {
     loadData()
   }, [user])  // Reload when user changes
   ```

---

## ✅ Verification Checklist

After implementing token refresh:

### Login/Logout
- [ ] Can login with different roles
- [ ] Logout clears all tokens
- [ ] No hard reload needed
- [ ] Smooth transitions

### Role-Based Features
- [ ] Admin sees all users
- [ ] Organization sees their employees only
- [ ] Employee cannot access user management
- [ ] Permissions update automatically

### UI Updates
- [ ] Sidebar updates based on role
- [ ] User management filters correctly
- [ ] Organization dropdown populates
- [ ] No stale data displayed

### Console Logs
- [ ] See "Auth: User loaded" on login
- [ ] See "Auth: Logging out" on logout
- [ ] See "Loading organizations" when needed
- [ ] No error messages

### Multi-Tab Sync
- [ ] Login in one tab updates others
- [ ] Logout in one tab updates others
- [ ] Token changes sync across tabs

---

## 🎯 Best Practices

### For Developers

1. **Always use AuthContext:**
   ```typescript
   const { user, isAdmin, can } = useAuth()
   ```

2. **Check permissions before rendering:**
   ```typescript
   {can(Permission.VIEW_USERS) && <UserManagement />}
   ```

3. **Reload data when user changes:**
   ```typescript
   useEffect(() => {
     loadData()
   }, [user])
   ```

4. **Use permission gates:**
   ```typescript
   <PermissionGate permission={Permission.CREATE_USER}>
     <CreateButton />
   </PermissionGate>
   ```

### For Users

1. **Logout before switching roles:**
   - Don't just close the tab
   - Use the logout button

2. **Wait for loading states:**
   - Don't click during transitions
   - Wait for "Loading..." to finish

3. **Check console for errors:**
   - Open browser console (F12)
   - Look for red error messages
   - Report any issues

---

## 📚 Related Documentation

- **PERMISSIONS_GUIDE.md** - Permission system
- **ROLE_BASED_USER_FILTERING.md** - Filtering logic
- **USER_MANAGEMENT_GUIDE.md** - User management features
- **ROLE_COMPARISON.md** - Role differences

---

## 🎉 Success!

You now have a fully functional role-based system with:
- ✅ Automatic token refresh
- ✅ Seamless role switching
- ✅ No hard reloads needed
- ✅ Multi-tab synchronization
- ✅ Clean logout flow
- ✅ Role-based feature updates

**Test it out:**
1. Login as Admin
2. Logout
3. Login as Organization
4. See different features - no reload needed! 🚀
