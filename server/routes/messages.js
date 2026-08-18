const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMessages,
  sendMessage,
  getUnreadCount,
  getUnreadCountsByRequest,
} = require('../controllers/messageController');

// IMPORTANT: these specific routes must come BEFORE /:borrowRequestId,
// otherwise Express treats "unread-count" as a borrowRequestId value
// (same routing-order lesson learned earlier with /my-items).
router.get('/unread-count', protect, getUnreadCount);
router.get('/unread-counts', protect, getUnreadCountsByRequest);

router.get('/:borrowRequestId', protect, getMessages);
router.post('/:borrowRequestId', protect, sendMessage);

module.exports = router;