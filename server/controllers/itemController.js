const Item = require('../models/Item');
const User = require('../models/User');

/**
 * CREATE ITEM: Lender posts a new item to lend
 * POST /api/items
 * Requires: Bearer token
 * Body (multipart/form-data): title, description, category, condition, requiresDeposit, depositAmount, maxBorrowDays
 * File: photo (optional, uploaded via multer)
 */
exports.createItem = async (req, res) => {
  try {
    const { title, description, category, condition, requiresDeposit, depositAmount, maxBorrowDays } = req.body;

    // ===== VALIDATION =====
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    // Get lender's current location from database
    const lender = await User.findById(req.userId);
    if (!lender) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!lender.location || !lender.location.coordinates) {
      return res.status(400).json({ message: 'Please set your location in your profile first' });
    }

    // With Cloudinary storage, req.file.path is the full hosted image URL
    // (not a local filename) — this is what gets saved to the database.
    const photoUrl = req.file ? req.file.path : null;

    // ===== CREATE ITEM =====
    const item = new Item({
      lenderId: req.userId,
      title,
      description: description || '',
      category,
      photoUrl,
      location: {
        type: 'Point',
        coordinates: lender.location.coordinates, // Use user's location
      },
      condition: condition || 'Good',
      requiresDeposit: requiresDeposit === 'true' || requiresDeposit === true,
      depositAmount: depositAmount || 0,
      maxBorrowDays: maxBorrowDays || 14,
      isAvailable: true,
    });

    await item.save();

    // Populate lender info before sending
    await item.populate('lenderId', 'name email averageRating');

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item,
    });
  } catch (error) {
    console.error('CreateItem error:', error);
    res.status(500).json({ message: error.message || 'Error creating item' });
  }
};

/**
 * GET ALL ITEMS: Browse all items (optionally filtered by location)
 * GET /api/items
 * Query params: ?latitude=40.7128&longitude=-74.0060&distance=5000&category=Books&search=keywords
 *   - latitude, longitude: borrower's current location
 *   - distance: max distance in meters (default 10000 = 10km)
 *   - category: filter by category
 *   - search: search by title/description keywords
 *   - available: filter by availability (true/false)
 */
exports.getAllItems = async (req, res) => {
  try {
    const { latitude, longitude, distance = 10000, category, search, available } = req.query;

    let query = {};

    // ===== GEOSPATIAL SEARCH (Most Important!) =====
    if (latitude && longitude) {
      // Convert lat/long to numbers
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude' });
      }

      // MongoDB geospatial query: find items near the borrower's location
      // $near returns items sorted by distance (closest first)
      // $maxDistance is in METERS
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat], // [longitude, latitude]
          },
          $maxDistance: parseInt(distance) || 10000,
        },
      };
    }

    // ===== ADDITIONAL FILTERS =====
    if (category && category !== 'All') {
      query.category = category;
    }

    if (available === 'true') {
      query.isAvailable = true;
    }

    // Keyword search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // ===== EXECUTE QUERY =====
    // Populate lender info and sort by distance (if geospatial search was used)
    const items = await Item.find(query)
      .populate('lenderId', 'name email profilePhoto averageRating totalRatings')
      .sort(latitude && longitude ? { 'location': 1 } : { createdAt: -1 });

    // ===== CALCULATE DISTANCE FOR RESPONSE =====
    // If geospatial search was used, add distance to each item
    let itemsWithDistance = items;
    if (latitude && longitude) {
      const borrowerCoordinates = [parseFloat(longitude), parseFloat(latitude)];
      itemsWithDistance = items.map((item) => {
        const distance = calculateDistance(
          borrowerCoordinates,
          item.location.coordinates
        );
        return {
          ...item.toObject(),
          distanceInKm: (distance / 1000).toFixed(1), // Convert to km
          distanceInMeters: Math.round(distance),
        };
      });
    }

    res.status(200).json({
      success: true,
      count: itemsWithDistance.length,
      items: itemsWithDistance,
    });
  } catch (error) {
    console.error('GetAllItems error:', error);
    res.status(500).json({ message: error.message || 'Error fetching items' });
  }
};

/**
 * GET SINGLE ITEM: Get details of one item
 * GET /api/items/:id
 */
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'lenderId',
      'name email profilePhoto bio averageRating totalRatings'
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('GetItem error:', error);
    res.status(500).json({ message: error.message || 'Error fetching item' });
  }
};

/**
 * UPDATE ITEM: Edit an item (only by lender)
 * PUT /api/items/:id
 * Requires: Bearer token (must be the item's lender)
 * Body (multipart/form-data): title, description, category, condition, requiresDeposit, depositAmount, maxBorrowDays, isAvailable
 * File: photo (optional — only sent if the user is replacing the photo)
 */
exports.updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check authorization: only lender can update
    if (item.lenderId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    // Update allowed fields
    const { title, description, category, condition, requiresDeposit, depositAmount, maxBorrowDays, isAvailable } = req.body;

    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (requiresDeposit !== undefined) item.requiresDeposit = requiresDeposit === 'true' || requiresDeposit === true;
    if (depositAmount !== undefined) item.depositAmount = depositAmount;
    if (maxBorrowDays) item.maxBorrowDays = maxBorrowDays;
    if (isAvailable !== undefined) item.isAvailable = isAvailable === 'true' || isAvailable === true;

    // Only replace the photo if a new one was uploaded (Cloudinary URL)
    if (req.file) {
      item.photoUrl = req.file.path;
    }

    await item.save();

    await item.populate('lenderId', 'name email averageRating');

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item,
    });
  } catch (error) {
    console.error('UpdateItem error:', error);
    res.status(500).json({ message: error.message || 'Error updating item' });
  }
};

/**
 * DELETE ITEM: Remove an item (only by lender)
 * DELETE /api/items/:id
 * Requires: Bearer token (must be the item's lender)
 */
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check authorization: only lender can delete
    if (item.lenderId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('DeleteItem error:', error);
    res.status(500).json({ message: error.message || 'Error deleting item' });
  }
};

/**
 * GET ITEMS BY LENDER: Get all items listed by a specific user
 * GET /api/items/lender/:lenderId
 */
exports.getItemsByLender = async (req, res) => {
  try {
    const items = await Item.find({ lenderId: req.params.lenderId })
      .populate('lenderId', 'name email profilePhoto averageRating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('GetItemsByLender error:', error);
    res.status(500).json({ message: error.message || 'Error fetching items' });
  }
};

/**
 * GET MY ITEMS: Get all items listed by the current user
 * GET /api/items/my-items
 * Requires: Bearer token
 */
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ lenderId: req.userId })
      .populate('lenderId', 'name email profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('GetMyItems error:', error);
    res.status(500).json({ message: error.message || 'Error fetching items' });
  }
};

/**
 * HELPER: Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(coord1, coord2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = (coord1[1] * Math.PI) / 180; // latitude
  const φ2 = (coord2[1] * Math.PI) / 180;
  const Δφ = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const Δλ = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}