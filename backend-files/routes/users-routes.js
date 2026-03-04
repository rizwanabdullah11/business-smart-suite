/**
 * ADD THESE ROUTES TO YOUR BACKEND
 * 
 * File: routes/users.js (or add to existing routes file)
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // Your existing auth middleware

// GET /api/users - List all users (with role-based filtering)
router.get('/users', authMiddleware, userController.getUsers);

// GET /api/users/counts - Get user counts by role (you already have this!)
router.get('/users/counts', authMiddleware, userController.getCounts);

// GET /api/users/:id - Get single user by ID
router.get('/users/:id', authMiddleware, userController.getUser);

// PUT /api/users/:id - Update user
router.put('/users/:id', authMiddleware, userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/users/:id', authMiddleware, userController.deleteUser);

module.exports = router;
