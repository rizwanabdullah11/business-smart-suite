const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/users
 * Get list of users with role-based filtering
 * 
 * Admin: Returns ALL users
 * Organization: Returns only their employees + themselves
 * Employee: Returns 403 Forbidden
 */
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    let query = {};
    
    console.log('GET /users - Current user:', currentUser.email, 'Role:', currentUser.role);
    
    // Role-based filtering
    if (currentUser.role === 'Admin') {
      // Admin sees ALL users
      query = {};
      console.log('Admin: No filter, returning all users');
    } 
    else if (currentUser.role === 'Organization') {
      // Organization sees their employees + themselves
      query = {
        $or: [
          { organizationId: currentUser._id },
          { _id: currentUser._id }
        ]
      };
      console.log('Organization: Filtering by organizationId:', currentUser._id);
    } 
    else if (currentUser.role === 'Employee') {
      // Employees cannot access user management
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

/**
 * GET /api/users/:id
 * Get specific user by ID
 * 
 * Admin: Can view any user
 * Organization: Can view their employees + themselves
 * Employee: Cannot access
 */
router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;
    
    console.log('GET /users/:id - User ID:', userId, 'Current user:', currentUser.email);
    
    // Find user
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Access control
    if (currentUser.role === 'Organization') {
      // Organizations can only view their employees or themselves
      const isTheirEmployee = user.organizationId?.toString() === currentUser._id.toString();
      const isThemselves = user._id.toString() === currentUser._id.toString();
      
      if (!isTheirEmployee && !isThemselves) {
        console.log('Organization: Access denied - not their employee');
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You can only view your own employees' 
        });
      }
    } 
    else if (currentUser.role === 'Employee') {
      console.log('Employee: Access denied');
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Employees cannot access user management' 
      });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      message: error.message 
    });
  }
});

/**
 * PUT /api/users/:id
 * Update user
 * 
 * Admin: Can edit any user
 * Organization: Can edit their employees only (not role or organizationId)
 * Employee: Cannot access
 */
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;
    const updates = req.body;
    
    console.log('PUT /users/:id - User ID:', userId, 'Updates:', Object.keys(updates));
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Access control
    if (currentUser.role === 'Organization') {
      // Organizations can only edit their employees
      const isTheirEmployee = user.organizationId?.toString() === currentUser._id.toString();
      
      if (!isTheirEmployee) {
        console.log('Organization: Access denied - not their employee');
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You can only edit your own employees' 
        });
      }
      
      // Organizations cannot change role or organizationId
      delete updates.role;
      delete updates.organizationId;
      console.log('Organization: Removed role and organizationId from updates');
    } 
    else if (currentUser.role === 'Employee') {
      console.log('Employee: Access denied');
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Employees cannot edit users' 
      });
    }
    
    // Don't allow password updates through this endpoint
    delete updates.password;
    
    // Update user
    Object.assign(user, updates);
    await user.save();
    
    // Return updated user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    console.log('User updated successfully:', user.email);
    res.json(updatedUser);
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user
 * 
 * Admin: Can delete any user
 * Organization: Can delete their employees (not themselves)
 * Employee: Cannot access
 */
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;
    
    console.log('DELETE /users/:id - User ID:', userId, 'Current user:', currentUser.email);
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Access control
    if (currentUser.role === 'Organization') {
      // Organizations can only delete their employees
      const isTheirEmployee = user.organizationId?.toString() === currentUser._id.toString();
      const isThemselves = user._id.toString() === currentUser._id.toString();
      
      if (!isTheirEmployee) {
        console.log('Organization: Access denied - not their employee');
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You can only delete your own employees' 
        });
      }
      
      if (isThemselves) {
        console.log('Organization: Cannot delete themselves');
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You cannot delete yourself' 
        });
      }
    } 
    else if (currentUser.role === 'Employee') {
      console.log('Employee: Access denied');
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Employees cannot delete users' 
      });
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    console.log('User deleted successfully:', user.email);
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      message: error.message 
    });
  }
});

/**
 * GET /api/organizations
 * Get list of organizations
 * 
 * Admin: Returns ALL organizations
 * Organization: Returns only themselves
 * Employee: Returns 403 Forbidden
 */
router.get('/organizations', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    let query = { role: 'Organization' };
    
    console.log('GET /organizations - Current user:', currentUser.email, 'Role:', currentUser.role);
    
    // Role-based filtering
    if (currentUser.role === 'Admin') {
      // Admin sees all organizations
      query = { role: 'Organization' };
      console.log('Admin: Returning all organizations');
    } 
    else if (currentUser.role === 'Organization') {
      // Organizations see only themselves
      query = { 
        role: 'Organization',
        _id: currentUser._id 
      };
      console.log('Organization: Returning only themselves');
    } 
    else if (currentUser.role === 'Employee') {
      console.log('Employee: Access denied');
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Employees cannot access organizations' 
      });
    }
    
    // Fetch organizations
    const organizations = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${organizations.length} organizations`);
    res.json(organizations);
    
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch organizations',
      message: error.message 
    });
  }
});

module.exports = router;
