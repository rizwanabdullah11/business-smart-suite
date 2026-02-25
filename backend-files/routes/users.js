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
