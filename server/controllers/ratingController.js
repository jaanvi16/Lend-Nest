const Rating = require('../models/Rating');
const BorrowRequest = require('../models/BorrowRequest');

/**
 * CREATE RATING: Rate the other party after a completed borrow
 * POST /api/ratings
 * Requires: Bearer token
 * Body: { borrowRequestId, score, review }
 */
exports.createRating = async (req, res) => {
  try {
    const { borrowRequestId, score, review } = req.body;

    if (!borrowRequestId || !score) {
      return res.status(400).json({ message: 'borrowRequestId and score are required' });
    }
    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }

    const request = await BorrowRequest.findById(borrowRequestId);
    if (!request) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Only the borrower or lender on this exact request can rate
    const isBorrower = request.borrowerId.toString() === req.userId;
    const isLender = request.lenderId.toString() === req.userId;
    if (!isBorrower && !isLender) {
      return res.status(403).json({ message: 'Not authorized to rate this exchange' });
    }

    // Can only rate once the exchange has actually happened
    if (!['returned', 'completed'].includes(request.status)) {
      return res.status(400).json({ message: 'You can only rate after the item has been returned' });
    }

    // Determine who is being rated (the other party) and the rater's role
    const rateeId = isBorrower ? request.lenderId : request.borrowerId;
    const role = isBorrower ? 'borrower' : 'lender';

    // Prevent duplicate ratings (also enforced by the unique index on the model)
    const existing = await Rating.findOne({ borrowRequestId, raterId: req.userId });
    if (existing) {
      return res.status(400).json({ message: 'You have already rated this exchange' });
    }

    const rating = await Rating.create({
      raterId: req.userId,
      rateeId,
      borrowRequestId,
      score,
      review: review || '',
      role,
    });

    // If both sides have now rated, mark the request as fully completed
    const bothRated = await Rating.countDocuments({ borrowRequestId });
    if (bothRated >= 2 && request.status !== 'completed') {
      request.status = 'completed';
      await request.save();
    }

    res.status(201).json({ success: true, rating });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already rated this exchange' });
    }
    console.error('CreateRating error:', error);
    res.status(500).json({ message: error.message || 'Error creating rating' });
  }
};

/**
 * GET RATINGS FOR A USER: Public — see someone's reviews
 * GET /api/ratings/user/:userId
 */
exports.getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ rateeId: req.params.userId })
      .populate('raterId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: ratings.length, ratings });
  } catch (error) {
    console.error('GetUserRatings error:', error);
    res.status(500).json({ message: error.message || 'Error fetching ratings' });
  }
};

/**
 * GET RATING STATUS FOR A REQUEST: Has the current user already rated this exchange?
 * GET /api/ratings/status/:borrowRequestId
 * Requires: Bearer token
 */
exports.getRatingStatus = async (req, res) => {
  try {
    const existing = await Rating.findOne({
      borrowRequestId: req.params.borrowRequestId,
      raterId: req.userId,
    });

    res.status(200).json({ success: true, hasRated: !!existing, rating: existing || null });
  } catch (error) {
    console.error('GetRatingStatus error:', error);
    res.status(500).json({ message: error.message || 'Error checking rating status' });
  }
};