# Complete Backend API - Role-Based User Management

## Features

✅ Role-based authentication (Admin, Organization, Employee)
✅ Complete CRUD operations for users
✅ Role-based access control
✅ JWT authentication
✅ MongoDB database
✅ Express.js REST API

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend-complete
npm install
```

### 2. Configure Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and set your values
nano .env
```

**Required environment variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB service
sudo service mongod start
```

### 4. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Expected output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📍 API URL: http://localhost:5000/api
🔗 Frontend URL: http://localhost:3000
```

---

## API Endpoints

### Authentication

#### POST /api/auth/login
Login user and get JWT token

**Request:**
```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6999eff86d53b0c6371",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "Admin"
  }
}
```

#### POST /api/auth/signup
Create new user (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Employee",
  "organizationId": "org_id_here"
}
```

**Response:**
```json
{
  "_id": "new_user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Employee",
  "organizationId": "org_id_here"
}
```

#### GET /api/auth/me
Get current user info

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "6999eff86d53b0c6371",
  "name": "Admin User",
  "email": "admin@test.com",
  "role": "Admin"
}
```

---

### User Management

#### GET /api/users
Get list of users (role-based filtered)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "6999eff86d53b0c6371",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "Admin"
  },
  {
    "_id": "6999eff86d53b0c6372",
    "name": "Acme Corp",
    "email": "admin@acme.com",
    "role": "Organization"
  }
]
```

**Role-based filtering:**
- **Admin:** Returns ALL users
- **Organization:** Returns only their employees + themselves
- **Employee:** Returns 403 Forbidden

#### GET /api/users/:id
Get specific user by ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "6999eff86d53b0c6371",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Employee",
  "organizationId": "org_id"
}
```

#### PUT /api/users/:id
Update user

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Response:**
```json
{
  "_id": "6999eff86d53b0c6371",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "Employee"
}
```

**Restrictions:**
- **Admin:** Can edit any user
- **Organization:** Can edit their employees only (cannot change role or organizationId)
- **Employee:** Cannot edit users (403)

#### DELETE /api/users/:id
Delete user

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Restrictions:**
- **Admin:** Can delete any user
- **Organization:** Can delete their employees (not themselves)
- **Employee:** Cannot delete users (403)

---

### Organizations

#### GET /api/organizations
Get list of organizations

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "org_id_1",
    "name": "Acme Corporation",
    "email": "admin@acme.com",
    "role": "Organization"
  },
  {
    "_id": "org_id_2",
    "name": "Tech Solutions",
    "email": "admin@tech.com",
    "role": "Organization"
  }
]
```

**Role-based filtering:**
- **Admin:** Returns ALL organizations
- **Organization:** Returns only themselves
- **Employee:** Returns 403 Forbidden

---

## Role-Based Access Control

### Admin Role
- ✅ View ALL users
- ✅ Create any role (Admin, Organization, Employee)
- ✅ Edit any user
- ✅ Delete any user
- ✅ View all organizations

### Organization Role
- ✅ View their employees + themselves
- ✅ Create employees (auto-assigned to their org)
- ✅ Edit their employees (cannot change role or organizationId)
- ✅ Delete their employees (not themselves)
- ❌ Cannot view other organizations
- ❌ Cannot view admin users

### Employee Role
- ❌ Cannot access user management (403 Forbidden)
- ✅ Can view their own profile
- ✅ Can access other allowed endpoints

---

## Database Schema

### User Model

```javascript
{
  name: String,              // User's full name
  email: String,             // Unique email (lowercase)
  password: String,          // Hashed password
  role: String,              // 'Admin', 'Organization', 'Employee'
  organizationId: ObjectId,  // Reference to Organization user
  organizationName: String,  // For Organization role
  organizationEmail: String, // For Organization role
  isActive: Boolean,         // Account status
  createdAt: Date,           // Creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

---

## Testing

### Test with cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

**Get Users:**
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create User:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"Employee"}'
```

---

## File Structure

```
backend-complete/
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── User.js              # User model schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── users.js             # User management routes
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # This file
```

---

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
1. Make sure MongoDB is running
2. Check MONGODB_URI in .env
3. Try: `sudo service mongod start`

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### JWT Token Invalid

**Error:** `Unauthorized: Invalid token`

**Solution:**
1. Check JWT_SECRET in .env matches
2. Token might be expired (24h expiry)
3. Re-login to get new token

---

## Security Notes

1. **Change JWT_SECRET** in production to a strong random string
2. **Use HTTPS** in production
3. **Set strong passwords** for users
4. **Enable rate limiting** for login endpoint
5. **Validate all inputs** before processing
6. **Use environment variables** for sensitive data

---

## Next Steps

1. ✅ Start the server
2. ✅ Test endpoints with Postman or cURL
3. ✅ Connect frontend to this backend
4. ✅ Create test users
5. ✅ Test role-based access control

---

## Support

If you encounter any issues:
1. Check server console for error messages
2. Verify MongoDB is running
3. Check .env configuration
4. Test endpoints with cURL
5. Review logs for detailed error information

---

## License

ISC
