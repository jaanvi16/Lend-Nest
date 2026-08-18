const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');

// ===== CREATE A BORROW REQUEST =====
// POST /api/requests
// Borrower requests to borrow an item
exports.createRequest = async (req, res) => {
  try {
    const { itemId, requestedStartDate, requestedEndDate, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.isAvailable) {
      return res.status(400).json({ message: 'This item is not currently available' });
    }

    // Prevent someone from requesting their own item
    if (item.lenderId.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot borrow your own item' });
    }

    const request = await BorrowRequest.create({
      borrowerId: req.userId,
      itemId: item._id,
      lenderId: item.lenderId,
      requestedStartDate,
      requestedEndDate,
      message: message || '',
      depositRequired: item.requiresDeposit,
      depositAmount: item.depositAmount,
    });

    res.status(201).json({ request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GET REQUESTS I'VE SENT (as borrower) =====
// GET /api/requests/sent
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ borrowerId: req.userId })
      .populate('itemId', 'title photoUrl category')
      .populate('lenderId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GET REQUESTS I'VE RECEIVED (as lender) =====
// GET /api/requests/received
exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ lenderId: req.userId })
      .populate('itemId', 'title photoUrl category')
      .populate('borrowerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== RESPOND TO A REQUEST (approve/reject) — lender only =====
// PUT /api/requests/:id/respond
exports.respondToRequest = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.lenderId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the lender can respond to this request' });
    }

    if (request.status !== 'requested') {
      return res.status(400).json({ message: 'This request has already been responded to' });
    }

    if (action === 'approve') {
      request.status = 'approved';
      // Mark item as unavailable while this request is active
      await Item.findByIdAndUpdate(request.itemId, { isAvailable: false });
    } else if (action === 'reject') {
      request.status = 'rejected';
      request.rejectionReason = rejectionReason || 'No reason given';
    } else {
      return res.status(400).json({ message: 'Action must be approve or reject' });
    }

    await request.save();
    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE STATUS (borrowed / returned / completed) =====
// PUT /api/requests/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'borrowed', 'returned', 'completed'

    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only borrower or lender involved can update
    const isBorrower = request.borrowerId.toString() === req.userId;
    const isLender = request.lenderId.toString() === req.userId;
    if (!isBorrower && !isLender) {
      return res.status(403).json({ message: 'Not authorized for this request' });
    }

    request.status = status;

    if (status === 'borrowed') {
      request.actualStartDate = new Date();
    }
    if (status === 'returned') {
      request.actualEndDate = new Date();
      // Make item available again
      await Item.findByIdAndUpdate(request.itemId, { isAvailable: true });
    }
    if (status === 'completed') {
      // Final state after both sides confirm return + rating
    }

    await request.save();
    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== CANCEL A REQUEST — borrower only, before approval =====
// PUT /api/requests/:id/cancel
exports.cancelRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.borrowerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the borrower can cancel this request' });
    }

    if (!['requested', 'approved'].includes(request.status)) {
      return res.status(400).json({ message: 'This request can no longer be cancelled' });
    }

    request.status = 'cancelled';
    await request.save();

    // Free up the item if it had been marked unavailable
    await Item.findByIdAndUpdate(request.itemId, { isAvailable: true });

    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};