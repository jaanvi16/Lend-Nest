const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  respondToRequest,
  updateStatus,
  cancelRequest,
} = require('../controllers/borrowRequestController');

// All borrow request routes require login
router.post('/', protect, createRequest);
router.get('/sent', protect, getSentRequests);
router.get('/received', protect, getReceivedRequests);
router.put('/:id/respond', protect, respondToRequest);
router.put('/:id/status', protect, updateStatus);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;