# Complete Backend Setup - Dynamic APIs 🚀

## Overview

Your diagnostics show that `/users` endpoints are returning 404. Here's the complete backend implementation you need.

## Backend Structure

```
backend/
├── models/
│   └── User.js          # User model with all fields
├── routes/
│   ├── auth.js          # Authentication routes (existing)
│   └── users.js         # User management routes (NEW)
├── middleware/
│   └── auth.js          # Auth middleware (existing)
└── server.js            # Main server file
```

## Step 1: Update User Model

**File: `models/User.js`**

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Organization', 'Employee'],
    default: 'Employee'
  },
  // For Employee users - links to their organization
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'Employee';
    }
  },
  // For Organization users - their organization details
  organizationName: {
    type: String,
    required: function() {
      return this.role === 'Organization';
    }
  },
  organizationEmail: {
    type: String,
    required: function() {
      return this.role === 'Organization';
    }
  },
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ organizationId: 1 });

// Method to get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
```

## Step 2: Create Users Routes

**File: `routes/users.js`**

```javascript
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/users
 * Get list of users with role-based filtering
 */
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const { organizationId, role, _id } = req.query;
    
    let query = {};
    
    // Role-based access control
    if (currentUser.role === 'Organization') {
      // Organizations can only see their employees + themselves
      query = {
        $or: [
          { organizationId: currentUser._id },
          { _id: currentUser._id }
        ]
      };
    } else if (currentUser.role === 'Employee') {
      // Employees cannot access user management
      return res.status(403).json({ 
        error: 'Forbidden - Employees cannot access user management' 
      });
    }
    // Admin: No filter, can see everyone
    
    // Apply query parameters
    if (organizationId) query.organizationId = organizationId;
    if (role) query.role = role;
    if (_id) query._id = _id;
    
    // Fetch users (exclude password)
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message 
    });
  }
});

/**
 * GET /api/users/:id
 * Get specific user by ID
 */
router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Access control
    if (currentUser.role === 'Organization') {
      if (user.organizationId?.toString() !== currentUser._id.toString() && 
          user._id.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } else if (currentUser.role === 'Employee') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;
    const updates = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Access control
    if (currentUser.role === 'Organization') {
      if (user.organizationId?.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      // Organizations cannot change role or organizationId
      delete updates.role;
      delete updates.organizationId;
    } else if (currentUser.role === 'Employee') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Don't allow password updates through this endpoint
    delete updates.password;
    
    // Update user
    Object.assign(user, updates);
    await user.save();
    
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user
 */
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Access control
    if (currentUser.role === 'Organization') {
      if (user.organizationId?.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (user._id.toString() === currentUser._id.toString()) {
        return res.status(403).json({ error: 'Cannot delete yourself' });
      }
    } else if (currentUser.role === 'Employee') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
```

## Step 3: Update Auth Routes

**File: `routes/auth.js`** (Update signup endpoint)

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ... existing login, me, dashboard routes ...

/**
 * POST /api/auth/signup
 * Register new user
 */
router.post('/auth/signup', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role,
      organizationId,      // For Employee users
      organizationName,    // For Organization users
      organizationEmail    // For Organization users
    } = req.body;
    
    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Name, email, password, and role are required' 
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // Validate role-specific fields
    if (role === 'Employee' && !organizationId) {
      return res.status(400).json({ 
        error: 'organizationId is required for Employee role' 
      });
    }
    
    if (role === 'Organization') {
      if (!organizationName || !organizationEmail) {
        return res.status(400).json({ 
          error: 'organizationName and organizationEmail are required for Organization role' 
        });
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      organizationId: role === 'Employee' ? organizationId : undefined,
      organizationName: role === 'Organization' ? organizationName : undefined,
      organizationEmail: role === 'Organization' ? organizationEmail : undefined,
    });
    
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      message: error.message 
    });
  }
});

module.exports = router;
```

## Step 4: Register Routes in Server

**File: `server.js`** (or `app.js`)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

// Register routes
app.use('/api', authRoutes);
app.use('/api', usersRoutes);  // ADD THIS LINE

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

## Step 5: Test the APIs

### Test 1: Create Organization

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "password": "password123",
    "role": "Organization",
    "organizationName": "Acme Corporation",
    "organizationEmail": "contact@acme.com"
  }'
```

### Test 2: Create Employee

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Employee",
    "email": "john@acme.com",
    "password": "password123",
    "role": "Employee",
    "organizationId": "ORGANIZATION_ID_FROM_STEP_1"
  }'
```

### Test 3: Get All Users (as Admin)

```bash
# First login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Then get users
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Step 6: Verify in Frontend

1. Restart your backend server
2. Go to `/admin/diagnostics` in your frontend
3. Click "Refresh"
4. All endpoints should show ✅ (200 status)
5. Go to `/admin/users`
6. You should see all users in the table!

## Environment Variables

Make sure your `.env` file has:

```env
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-secret-key
PORT=5000
```

## Troubleshooting

### Still getting 404?
- Make sure you added `app.use('/api', usersRoutes)` in server.js
- Restart your backend server
- Check console for any errors

### Getting 403 Forbidden?
- You're logged in as Employee
- Login as Admin or Organization

### Getting 500 errors?
- Check backend console for error messages
- Verify MongoDB is running
- Check User model is properly defined

## Summary

Once you implement these changes:
1. ✅ All 4 user endpoints will work
2. ✅ Diagnostics will show green checkmarks
3. ✅ User management page will display all users
4. ✅ Create, edit, delete will work
5. ✅ Role-based filtering will work automatically

The APIs are now fully dynamic and role-aware!
