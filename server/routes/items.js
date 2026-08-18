const express = require('express');
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItem,
  updateItem,
  deleteItem,
  getItemsByLender,
  getMyItems,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * Public Routes (no auth required)
 */

// GET /api/items
router.get('/', getAllItems);

// GET /api/items/lender/:lenderId
router.get('/lender/:lenderId', getItemsByLender);

/**
 * Protected Routes (require JWT token)
 * IMPORTANT: /my-items must come BEFORE /:id, otherwise Express treats
 * "my-items" as an :id value and the request never reaches this route.
 */

// GET /api/items/my-items
router.get('/my-items', protect, getMyItems);

// POST /api/items
// upload.single('photo') processes a single file sent under the 'photo' field name
router.post('/', protect, upload.single('photo'), createItem);

// GET /api/items/:id
router.get('/:id', getItem);

// PUT /api/items/:id
router.put('/:id', protect, upload.single('photo'), updateItem);

// DELETE /api/items/:id
router.delete('/:id', protect, deleteItem);

module.exports = router;