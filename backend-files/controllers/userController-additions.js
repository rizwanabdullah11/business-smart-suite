/**
 * ADD THESE FUNCTIONS TO YOUR EXISTING userController.js
 * 
 * You already have getCounts - these follow the same pattern
 */

const User = require('../models/User');

// Get all users with role-based filtering
exports.getUsers = async (req, res) => {
  try {
    let baseQuery = {};
    
    // Apply organization filtering (same logic as your getCounts)
    if (req.user.role === 'Organization') {
      // Organizations see their employees + themselves
      baseQuery = {
        $or: [
          { organizationId: req.user._id },
          { _id: req.user._id }
        ]
      };
    } else if (req.user.role === 'Employee') {
      // Employees cannot access user management
      return res.status(403).json({ msg: "Forbidden - Employees cannot access user management" });
    }
    // Admin sees everyone (no filter)
    
    // Apply query parameters for additional filtering
    const { role, organizationId, _id } = req.query;
    
    if (role && !baseQuery.$or) {
      baseQuery.role = role;
    }
    if (organizationId && !baseQuery.$or) {
      baseQuery.organizationId = organizationId;
    }
    if (_id) {
      baseQuery._id = _id;
    }
    
    // Fetch users (exclude password)
    const users = await User.find(baseQuery)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ msg: "Error fetching users", error: err.message });
  }
};

// Get single user by ID
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find user
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    // Access control
    if (req.user.role === 'Organization') {
      // Organizations can only view their employees or themselves
      if (user.organizationId?.toString() !== req.user._id.toString() && 
          user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Forbidden" });
      }
    } else if (req.user.role === 'Employee') {
      return res.status(403).json({ msg: "Forbidden" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ msg: "Error fetching user", error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    // Access control
    if (req.user.role === 'Organization') {
      // Organizations can only update their employees
      if (user.organizationId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Forbidden" });
      }
      // Organizations cannot change role or organizationId
      delete updates.role;
      delete updates.organizationId;
    } else if (req.user.role === 'Employee') {
      return res.status(403).json({ msg: "Forbidden" });
    }
    
    // Don't allow password updates through this endpoint
    delete updates.password;
    
    // Update user
    Object.assign(user, updates);
    await user.save();
    
    // Return user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ msg: "Error updating user", error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    // Access control
    if (req.user.role === 'Organization') {
      // Organizations can only delete their employees (not themselves)
      if (user.organizationId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Forbidden" });
      }
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(403).json({ msg: "Cannot delete yourself" });
      }
    } else if (req.user.role === 'Employee') {
      return res.status(403).json({ msg: "Forbidden" });
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    res.json({ 
      success: true, 
      msg: "User deleted successfully" 
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ msg: "Error deleting user", error: err.message });
  }
};

// You already have this - keeping for reference
exports.getCounts = async (req, res) => {
  try {
    let baseQuery = {};
    
    // Apply organization filtering
    if (req.user.role === 'Organization' || req.user.role === 'Employee') {
      baseQuery.organizationId = req.user.organizationId;
    }
    
    const [totalCount, orgCount, employeeCount, adminCount] = await Promise.all([
      User.countDocuments(baseQuery),
      User.countDocuments({ ...baseQuery, role: 'Organization' }),
      User.countDocuments({ ...baseQuery, role: 'Employee' }),
      User.countDocuments({ ...baseQuery, role: 'Admin' })
    ]);
    
    res.json({
      total: totalCount,
      organizations: orgCount,
      employees: employeeCount,
      admins: adminCount
    });
  } catch (err) {
    console.error("Get user counts error:", err);
    res.status(500).json({ msg: "Error fetching counts", error: err.message });
  }
};
