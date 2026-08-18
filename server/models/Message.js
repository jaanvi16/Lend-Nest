const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Every message is tied to a specific borrow request — this scopes the
    // conversation to that exchange rather than a generic open DM system
    borrowRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: [true, 'Message must be tied to a borrow request'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender'],
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      maxlength: 1000,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Fast lookup of all messages for a given request, in order
messageSchema.index({ borrowRequestId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);