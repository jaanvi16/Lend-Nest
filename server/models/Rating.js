const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    // Who is rating whom
    raterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rating must have a rater'],
    },
    rateeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rating must specify who is being rated'],
    },
    // Which borrow request is this rating for?
    borrowRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: [true, 'Rating must be tied to a borrow request'],
    },
    // The rating
    score: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 500,
      default: '',
    },
    // Role of the rater
    role: {
      type: String,
      enum: ['lender', 'borrower'],
      required: [true, 'Rating must specify rater role'],
    },
  },
  {
    timestamps: true,
  }
);

// ===== INDEXES =====
// Find all ratings for a user
ratingSchema.index({ rateeId: 1 });
// Find ratings from a user
ratingSchema.index({ raterId: 1 });
// Find rating for a specific request
ratingSchema.index({ borrowRequestId: 1 });
// Composite index for ensuring one rating per request per user
ratingSchema.index({ borrowRequestId: 1, raterId: 1 }, { unique: true });

// ===== HOOKS =====
// After a rating is created, update the user's average rating
ratingSchema.post('save', async function () {
  const User = mongoose.model('User');
  
  // Calculate average rating for the ratee
  const ratings = await this.constructor.find({ rateeId: this.rateeId });
  const avgScore = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
    : 0;

  await User.findByIdAndUpdate(this.rateeId, {
    averageRating: avgScore,
    totalRatings: ratings.length,
  });
});

module.exports = mongoose.model('Rating', ratingSchema);
