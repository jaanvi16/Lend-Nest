const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
  });
};

/**
 * SIGNUP: Create a new user account
 * POST /api/auth/signup
 * Body: { name, email, password, latitude, longitude }
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    // ===== VALIDATION =====
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    // ===== CREATE USER =====
    user = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook in User model
      location: {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0], // [longitude, latitude] for geospatial
      },
    });

    // Save user (password gets hashed automatically)
    await user.save();

    // ===== GENERATE TOKEN =====
    const token = generateToken(user._id);

    // ===== SEND RESPONSE =====
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location.coordinates,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Error during signup' });
  }
};

/**
 * LOGIN: Authenticate user and issue token
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===== VALIDATION =====
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // ===== FIND USER & VERIFY PASSWORD =====
    // Note: We use .select('+password') because password is hidden by default
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Use the matchPassword method from User model to compare passwords
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ===== GENERATE TOKEN =====
    const token = generateToken(user._id);

    // ===== SEND RESPONSE =====
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location.coordinates,
        averageRating: user.averageRating,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Error during login' });
  }
};

/**
 * GET CURRENT USER: Fetch authenticated user's profile
 * GET /api/auth/me
 * Requires: Bearer token in Authorization header
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        location: user.location.coordinates,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: error.message || 'Error fetching user' });
  }
};

/**
 * UPDATE PROFILE: Update user profile info
 * PUT /api/auth/profile
 * Requires: Bearer token
 * Body: { name, bio, profilePhoto, latitude, longitude }
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePhoto, latitude, longitude } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (latitude && longitude) {
      user.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        location: user.location.coordinates,
      },
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};
