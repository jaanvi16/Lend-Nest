const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * Public Routes (no token required)
 */

// POST /api/auth/signup
// Body: { name, email, password, latitude, longitude }
// Returns: { token, user }
router.post('/signup', signup);

// POST /api/auth/login
// Body: { email, password }
// Returns: { token, user }
router.post('/login', login);

/**
 * Protected Routes (require JWT token)
 */

// GET /api/auth/me
// Returns: authenticated user's profile
router.get('/me', protect, getMe);

// PUT /api/auth/profile
// Body: { name, bio, profilePhoto, latitude, longitude }
// Returns: updated user
router.put('/profile', protect, updateProfile);

module.exports = router;
