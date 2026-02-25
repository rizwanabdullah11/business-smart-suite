# 🚀 START YOUR BACKEND SERVER

## ⚠️ CRITICAL ISSUE
Your backend server is **NOT RUNNING**. The frontend is showing only 1 user because it's in fallback mode.

**Error:** `ECONNREFUSED` when connecting to `http://localhost:5000/api/auth/me`

---

## 📋 STEP-BY-STEP BACKEND SETUP

### Step 1: Locate Your Backend Directory
Your backend is separate from this Next.js frontend. Find your backend folder (usually named `backend`, `server`, or similar).

```bash
# Navigate to your backend directory
cd path/to/your/backend
```

### Step 2: Copy Required Files

Copy these files from the `backend-files/` folder to your backend:

#### A. User Routes (`routes/users.js`)
```bash
# Copy from: backend-files/routes/users.js
# To: your-backend/routes/users.js
```

This file contains:
- `GET /api/users` - List all users with role-based filtering
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### B. User Controller Functions (`controllers/userController.js`)
Add these functions to your existing `userController.js`:
- `getUsers()`
- `getUser()`
- `updateUser()`
- `deleteUser()`

You already have `getCounts()` - these follow the same pattern.

**File location:** `backend-files/controllers/userController-additions.js`

#### C. User Model (`models/User.js`)
Ensure your User model has these fields:
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // 'Admin', 'Organization', 'Employee'
  organizationId: ObjectId, // Reference to Organization user
  organizationName: String, // For Organization role
  organizationEmail: String, // For Organization role
  createdAt: Date,
  updatedAt: Date
}
```

**Reference file:** `backend-files/models/User.js`

### Step 3: Register Routes in `server.js`

Add this to your `server.js` or `app.js`:

```javascript
const usersRoutes = require('./routes/users');

// Register routes
app.use('/api', usersRoutes);
```

### Step 4: Verify Auth Middleware

Your auth middleware should:
1. Extract JWT token from `Authorization: Bearer <token>` header
2. Verify token
3. Attach user to `req.user` with fields: `_id`, `role`, `organizationId`

### Step 5: Start Backend Server

```bash
# Install dependencies (if needed)
npm install

# Start server
npm start
# OR
node server.js
# OR
npm run dev
```

**Expected output:**
```
Server running on port 5000
MongoDB connected
```

### Step 6: Verify Backend is Running

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test auth endpoint (with your token)
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer YOUR_TOKEN"

# Test users endpoint (with your token)
curl http://localhost:5000/api/users -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 TROUBLESHOOTING

### Backend Not Starting?

1. **Check MongoDB Connection**
   - Is MongoDB running?
   - Is connection string correct in `.env`?

2. **Check Port 5000**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # If port is in use, kill the process or change port
   ```

3. **Check Dependencies**
   ```bash
   npm install express mongoose jsonwebtoken bcryptjs dotenv cors
   ```

### Still Getting ECONNREFUSED?

1. **Verify backend URL in frontend `.env.local`:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

2. **Check CORS settings in backend:**
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

3. **Restart both servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

---

## ✅ VERIFICATION CHECKLIST

After starting backend, check the Diagnostics page:
- Go to: http://localhost:3000/admin/diagnostics
- All endpoints should show ✅ Available

Expected results:
- ✅ `/auth/me` - Current user info
- ✅ `/users` - User list (role-based filtered)
- ✅ `/organizations` - Organization list

---

## 📊 WHAT HAPPENS AFTER BACKEND STARTS?

1. **User Management Page** (`/admin/users`) will show:
   - Admin: ALL users (admins, organizations, employees)
   - Organization: Their employees + themselves
   - Employee: 403 Forbidden

2. **Organization Dropdown** will populate with real organizations

3. **Filter Tabs** will show accurate counts:
   - All Users
   - Organizations
   - Admins
   - Employees

4. **CRUD Operations** will work:
   - Create new users
   - Edit existing users
   - Delete users (with role-based restrictions)

---

## 🎯 QUICK START (TL;DR)

```bash
# 1. Navigate to backend
cd path/to/backend

# 2. Copy files from backend-files/ folder

# 3. Register routes in server.js
# app.use('/api', require('./routes/users'));

# 4. Start backend
npm start

# 5. Verify at http://localhost:3000/admin/diagnostics
```

---

## 📞 NEED HELP?

If you're still having issues:
1. Share your backend `server.js` file
2. Share your backend folder structure
3. Share any error messages from backend console
4. Check MongoDB connection status

The frontend is ready and waiting - it just needs the backend to be running! 🚀
