const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema(
  {
    // Parties involved
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must have a borrower'],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Request must reference an item'],
    },
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must have a lender'],
    },
    // Borrow dates
    requestedStartDate: {
      type: Date,
      required: [true, 'Please specify a start date'],
    },
    requestedEndDate: {
      type: Date,
      required: [true, 'Please specify an end date'],
    },
    actualStartDate: {
      type: Date,
      default: null, // When lender actually handed it over
    },
    actualEndDate: {
      type: Date,
      default: null, // When borrower actually returned it
    },
    // Message from borrower
    message: {
      type: String,
      maxlength: 500,
      default: '',
    },
    // Status workflow: requested → approved → borrowed → returned → completed
    // or: requested → rejected
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'borrowed', 'returned', 'completed', 'cancelled'],
      default: 'requested',
    },
    // If rejected, why?
    rejectionReason: {
      type: String,
      maxlength: 300,
      default: null,
    },
    // Deposit tracking (if applicable)
    depositRequired: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    depositReturned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ===== INDEXES =====
// Find requests for a specific user
borrowRequestSchema.index({ borrowerId: 1 });
borrowRequestSchema.index({ lenderId: 1 });
// Find requests for a specific item
borrowRequestSchema.index({ itemId: 1 });
// Find requests by status
borrowRequestSchema.index({ status: 1 });

// ===== STATIC METHODS =====
// Get all active requests (pending or active borrows)
borrowRequestSchema.statics.getActiveRequests = function (userId) {
  return this.find({
    $or: [{ borrowerId: userId }, { lenderId: userId }],
    status: { $in: ['requested', 'approved', 'borrowed'] },
  });
};

// ===== METHODS =====
// Check if the return date has passed
borrowRequestSchema.methods.isOverdue = function () {
  if (this.status !== 'borrowed') return false;
  return new Date() > this.requestedEndDate;
};

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
