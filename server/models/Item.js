const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    // Lender info
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must have a lender'],
    },
    // Item details
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    category: {
      type: String,
      enum: ['Books', 'Tools', 'Sports', 'Electronics', 'Furniture', 'Gadgets', 'Other'],
      required: [true, 'Please select a category'],
    },
    photoUrl: {
      type: String, // URL to uploaded photo
      default: null,
    },
    // Location (geospatial)
    // This is the lender's location where they have the item
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Item must have a location'],
      },
    },
    // Availability
    isAvailable: {
      type: Boolean,
      default: true,
    },
    borrowStartDate: {
      type: Date,
      default: null, // When the item was borrowed
    },
    borrowEndDate: {
      type: Date,
      default: null, // When it's expected to be returned
    },
    // Condition
    condition: {
      type: String,
      enum: ['Like New', 'Good', 'Fair', 'Poor'],
      default: 'Good',
    },
    // Borrowing restrictions (optional)
    requiresDeposit: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    maxBorrowDays: {
      type: Number,
      default: 14, // Default 2 weeks
    },
  },
  {
    timestamps: true,
  }
);

// ===== INDEXES =====
// CRITICAL: 2dsphere index for geospatial queries
// This allows MongoDB to find items sorted by distance from a point
itemSchema.index({ location: '2dsphere' });
// Index for faster lender lookups
itemSchema.index({ lenderId: 1 });
// Index for category filtering
itemSchema.index({ category: 1 });
// Index for availability status
itemSchema.index({ isAvailable: 1 });

// ===== METHODS =====
// Calculate distance from a point (in meters)
// Used after $near query to show actual distance
itemSchema.methods.distanceFrom = function (coordinates) {
  if (!this.location || !this.location.coordinates) return null;
  
  const R = 6371000; // Earth radius in meters
  const φ1 = (this.location.coordinates[1] * Math.PI) / 180;
  const φ2 = (coordinates[1] * Math.PI) / 180;
  const Δφ = ((coordinates[1] - this.location.coordinates[1]) * Math.PI) / 180;
  const Δλ = ((coordinates[0] - this.location.coordinates[0]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

module.exports = mongoose.model('Item', itemSchema);
