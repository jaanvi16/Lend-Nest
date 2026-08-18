const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRating,
  getUserRatings,
  getRatingStatus,
} = require('../controllers/ratingController');

// Public: view a user's ratings/reviews
router.get('/user/:userId', getUserRatings);

// Protected: check if current user already rated a given request
router.get('/status/:borrowRequestId', protect, getRatingStatus);

// Protected: submit a rating
router.post('/', protect, createRating);

module.exports = router;