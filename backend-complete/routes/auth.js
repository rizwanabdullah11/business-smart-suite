const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Email and password are required' 
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid email or password' 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid email or password' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return token and user data
    const userData = user.toObject();
    delete userData.password;
    
    console.log('Login successful:', user.email, 'Role:', user.role);
    
    res.json({
      token,
      user: userData
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * POST /api/auth/signup
 * Create new user
 */
router.post('/signup', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, role, organizationId, organizationName, organizationEmail } = req.body;
    const currentUser = req.user;
    
    console.log('Signup attempt:', email, 'Role:', role, 'By:', currentUser.email);
    
    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Name, email, password, and role are required' 
      });
    }
    
    // Role validation
    if (!['Admin', 'Organization', 'Employee'].includes(role)) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Invalid role' 
      });
    }
    
    // Permission check
    if (currentUser.role === 'Organization' && role !== 'Employee') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Organizations can only create Employee users' 
      });
    }
    
    if (currentUser.role === 'Employee') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Employees cannot create users' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'User with this email already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Prepare user data
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    };
    
    // Handle organizationId
    if (role === 'Employee') {
      if (currentUser.role === 'Organization') {
        // Organization creating employee - auto-assign to their org
        userData.organizationId = currentUser._id;
      } else if (organizationId) {
        // Admin creating employee - use provided organizationId
        userData.organizationId = organizationId;
      }
    }
    
    // Handle organization-specific fields
    if (role === 'Organization') {
      userData.organizationName = organizationName || name;
      userData.organizationEmail = organizationEmail || email;
    }
    
    // Create user
    const newUser = await User.create(userData);
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    console.log('User created successfully:', newUser.email, 'Role:', newUser.role);
    
    res.status(201).json(userResponse);
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    
    res.json(user);
    
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * GET /api/auth/dashboard
 * Get dashboard data (for compatibility)
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    
    res.json({
      user,
      message: 'Dashboard data'
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;
