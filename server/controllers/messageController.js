const mongoose = require('mongoose');
const Message = require('../models/Message');
const BorrowRequest = require('../models/BorrowRequest');

// Helper: confirm the current user is either the borrower or lender on this request
async function assertParticipant(borrowRequestId, userId) {
  const request = await BorrowRequest.findById(borrowRequestId);
  if (!request) {
    return { error: 'Borrow request not found', status: 404 };
  }
  const isParticipant =
    request.borrowerId.toString() === userId || request.lenderId.toString() === userId;
  if (!isParticipant) {
    return { error: 'Not authorized to view this conversation', status: 403 };
  }
  return { request };
}

/**
 * GET MESSAGES for a borrow request (the full conversation thread)
 * GET /api/messages/:borrowRequestId
 * Requires: Bearer token, must be borrower or lender on that request
 */
exports.getMessages = async (req, res) => {
  try {
    const { error, status } = await assertParticipant(req.params.borrowRequestId, req.userId);
    if (error) return res.status(status).json({ message: error });

    const messages = await Message.find({ borrowRequestId: req.params.borrowRequestId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });

    // Mark any messages sent by the OTHER person as read, since this user just viewed them
    await Message.updateMany(
      { borrowRequestId: req.params.borrowRequestId, senderId: { $ne: req.userId }, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('GetMessages error:', error);
    res.status(500).json({ message: error.message || 'Error fetching messages' });
  }
};

/**
 * SEND MESSAGE
 * POST /api/messages/:borrowRequestId
 * Requires: Bearer token, must be borrower or lender on that request
 * Body: { text }
 */
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const { error, status } = await assertParticipant(req.params.borrowRequestId, req.userId);
    if (error) return res.status(status).json({ message: error });

    const message = await Message.create({
      borrowRequestId: req.params.borrowRequestId,
      senderId: req.userId,
      text: text.trim(),
    });

    await message.populate('senderId', 'name');

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ message: error.message || 'Error sending message' });
  }
};

/**
 * GET UNREAD COUNT across all of the current user's requests
 * GET /api/messages/unread-count
 * Requires: Bearer token
 * Used to show a notification badge in the Navbar
 */
exports.getUnreadCount = async (req, res) => {
  try {
    // Find all requests this user is part of
    const requests = await BorrowRequest.find({
      $or: [{ borrowerId: req.userId }, { lenderId: req.userId }],
    }).select('_id');

    const requestIds = requests.map((r) => r._id);

    const count = await Message.countDocuments({
      borrowRequestId: { $in: requestIds },
      senderId: { $ne: req.userId },
      read: false,
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('GetUnreadCount error:', error);
    res.status(500).json({ message: error.message || 'Error fetching unread count' });
  }
};

/**
 * GET UNREAD COUNTS PER REQUEST — for showing a badge on each request's Message button
 * GET /api/messages/unread-counts
 * Requires: Bearer token
 * Returns: { counts: { [borrowRequestId]: number } } — only requests with count > 0 are included
 */
exports.getUnreadCountsByRequest = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({
      $or: [{ borrowerId: req.userId }, { lenderId: req.userId }],
    }).select('_id');

    const requestIds = requests.map((r) => r._id);

    // IMPORTANT: aggregate() does NOT auto-cast query values to ObjectId the
    // way find()/countDocuments() do. Without this explicit conversion,
    // comparing the string req.userId to the stored ObjectId senderId field
    // never matches as "equal" — which made $ne always true, incorrectly
    // counting the current user's OWN messages as unread.
    const currentUserObjectId = new mongoose.Types.ObjectId(req.userId);

    const unread = await Message.aggregate([
      {
        $match: {
          borrowRequestId: { $in: requestIds },
          senderId: { $ne: currentUserObjectId },
          read: false,
        },
      },
      { $group: { _id: '$borrowRequestId', count: { $sum: 1 } } },
    ]);

    const counts = {};
    unread.forEach((entry) => {
      counts[entry._id.toString()] = entry.count;
    });

    res.status(200).json({ success: true, counts });
  } catch (error) {
    console.error('GetUnreadCountsByRequest error:', error);
    res.status(500).json({ message: error.message || 'Error fetching unread counts' });
  }
};