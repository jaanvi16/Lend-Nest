# Item Routes & Geospatial Search Explained

## The Magic: How "Nearest Lender" Works

### MongoDB Geospatial Queries

The **key feature** of this app is finding items sorted by distance from the borrower's location. This uses MongoDB's `$near` operator with the `2dsphere` index on the Item model.

```javascript
// MongoDB Query:
db.items.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [-74.0060, 40.7128] },
      $maxDistance: 10000  // 10 km in meters
    }
  }
})
```

**Results:** Items sorted by distance (closest first)

### How It Works in Your App

```
BORROWER:
  Current location: [40.7128, -74.0060]
  Searches: "find books near me"
        ↓
FRONTEND:
  Gets browser geolocation (Geolocation API)
  Sends: GET /api/items?latitude=40.7128&longitude=-74.0060&distance=5000
        ↓
BACKEND (itemController.js):
  1. Extract latitude, longitude, distance from query
  2. Build MongoDB $near query
  3. Execute: db.items.find({ location: { $near: {...} } })
  4. Calculate actual distance for each item (Haversine formula)
  5. Return: [Item1 (0.5km away), Item2 (1.2km away), Item3 (2.3km away)]
        ↓
FRONTEND:
  Display results with distance: "0.5 km away", "1.2 km away", etc.
  Show on Leaflet map
```

---

## API Endpoints

### **Public Endpoints (No Login Required)**

#### **GET /api/items** 
Search and browse all items (with optional geospatial filtering).

**Query Parameters:**
```
latitude=40.7128          // Borrower's current latitude
longitude=-74.0060        // Borrower's current longitude
distance=5000             // Max distance in meters (default 10000)
category=Books            // Filter by category: Books, Tools, Sports, Electronics, etc.
search=python             // Search in title/description
available=true            // Only show available items
```

**Example Requests:**

```bash
# 1. Find all items near you (simplest)
GET /api/items?latitude=40.7128&longitude=-74.0060

# 2. Find books within 5km
GET /api/items?latitude=40.7128&longitude=-74.0060&distance=5000&category=Books

# 3. Search for "python" books within 10km
GET /api/items?latitude=40.7128&longitude=-74.0060&distance=10000&category=Books&search=python

# 4. Get all available items (no location filter)
GET /api/items?available=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Introduction to Python",
      "description": "Great condition, lightly used",
      "category": "Books",
      "photoUrl": "https://...",
      "lenderId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "averageRating": 4.8
      },
      "location": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128]
      },
      "isAvailable": true,
      "condition": "Good",
      "maxBorrowDays": 14,
      "requiresDeposit": false,
      "distanceInKm": "0.5",
      "distanceInMeters": 500
    },
    {
      "title": "Python Cookbook",
      "distanceInKm": "1.2",
      "distanceInMeters": 1200,
      ...
    }
  ]
}
```

---

#### **GET /api/items/:id**
Get full details of a single item.

**Example Request:**
```bash
GET /api/items/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Python",
    "description": "Great condition, lightly used",
    "category": "Books",
    "photoUrl": "https://...",
    "lenderId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePhoto": "https://...",
      "bio": "Love sharing books!",
      "averageRating": 4.8,
      "totalRatings": 15
    },
    "location": { "type": "Point", "coordinates": [-74.0060, 40.7128] },
    "isAvailable": true,
    "condition": "Good",
    "maxBorrowDays": 14,
    "requiresDeposit": false,
    "depositAmount": 0,
    "createdAt": "2026-08-14T10:00:00Z"
  }
}
```

---

#### **GET /api/items/lender/:lenderId**
Get all items listed by a specific user.

**Example Request:**
```bash
GET /api/items/lender/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "items": [ ... ]  // All items by that lender
}
```

---

### **Protected Endpoints (Require JWT Token)**

#### **POST /api/items**
Create a new item listing (lender only).

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "title": "Introduction to Python",
  "description": "Great condition, lightly used textbook",
  "category": "Books",
  "photoUrl": "https://example.com/book.jpg",
  "condition": "Good",
  "requiresDeposit": false,
  "depositAmount": 0,
  "maxBorrowDays": 14
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Item created successfully",
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to Python",
    "lenderId": { ... },
    "location": { "type": "Point", "coordinates": [-74.0060, 40.7128] },
    "isAvailable": true,
    ...
  }
}
```

**Important:** The item's location is automatically set to the lender's location from their profile. Make sure your location is set before creating items!

---

#### **PUT /api/items/:id**
Update an item listing (only the lender who created it can update).

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body (all fields optional):**
```json
{
  "title": "Advanced Python",
  "description": "Updated description",
  "isAvailable": false,
  "condition": "Like New"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "item": { ... }
}
```

---

#### **DELETE /api/items/:id**
Delete an item listing (only the lender who created it can delete).

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

#### **GET /api/items/my-items**
Get all items listed by the current authenticated user.

**Request Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "items": [ ... ]  // All items listed by current user
}
```

---

## Code Structure

### `itemController.js`

```
createItem(req, res)
  ├─ Validate input (title, category required)
  ├─ Get lender's location from User profile
  ├─ Create item with location
  └─ Return created item

getAllItems(req, res)
  ├─ Extract query params (latitude, longitude, distance, etc.)
  ├─ Build MongoDB $near geospatial query if location provided
  ├─ Apply additional filters (category, search, availability)
  ├─ Execute query (SORTED BY DISTANCE!)
  ├─ Calculate actual distance for each item
  └─ Return items with distanceInKm and distanceInMeters

getItem(req, res)
  ├─ Find item by ID
  ├─ Populate lender info
  └─ Return item details

updateItem(req, res)
  ├─ Find item by ID
  ├─ Check authorization (must be lender)
  ├─ Update fields
  └─ Return updated item

deleteItem(req, res)
  ├─ Find item by ID
  ├─ Check authorization (must be lender)
  ├─ Delete item
  └─ Return success message

getItemsByLender(req, res)
  ├─ Find all items by specific lender ID
  └─ Return sorted by creation date

getMyItems(req, res)
  ├─ Use req.userId from auth middleware
  ├─ Find all items by current user
  └─ Return items
```

---

## Distance Calculation

The app calculates distances using the **Haversine formula**, which gives accurate distances on Earth's surface:

```javascript
function calculateDistance(coord1, coord2) {
  const R = 6371000;  // Earth radius in meters
  const φ1 = (coord1[1] * Math.PI) / 180;
  const φ2 = (coord2[1] * Math.PI) / 180;
  const Δφ = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const Δλ = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;  // Distance in meters
}
```

---

## Workflow: Listing & Finding Items

### As a Lender:
```
1. Update profile with location (via PUT /api/auth/profile)
2. Create item (POST /api/items)
   → Item location automatically set to your profile location
3. View/edit your items (GET /api/items/my-items, PUT /api/items/:id)
4. Item is now visible to borrowers searching nearby
```

### As a Borrower:
```
1. Browser gets your current location (Geolocation API)
2. Search items: GET /api/items?latitude=40.7128&longitude=-74.0060
3. Results sorted by distance (nearest first)
4. See distance to each lender: "0.5 km away"
5. Click on item to see lender profile and full details
6. Create borrow request (coming next)
```

---

## Testing with curl/Postman

### Create an Item (as lender):
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Book",
    "category": "Books",
    "description": "Great condition"
  }'
```

### Search Items Near You:
```bash
curl "http://localhost:5000/api/items?latitude=40.7128&longitude=-74.0060&distance=5000"
```

### Get Your Items:
```bash
curl -X GET http://localhost:5000/api/items/my-items \
  -H "Authorization: Bearer <your_token>"
```

### Update Item (Mark as unavailable):
```bash
curl -X PUT http://localhost:5000/api/items/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": false}'
```

---

## Key Concepts

| Concept | Explanation |
|---------|-------------|
| **2dsphere Index** | MongoDB geospatial index that enables fast $near queries |
| **$near Query** | Finds documents within a distance, sorted by distance |
| **Coordinates** | Always `[longitude, latitude]` in MongoDB (opposite of lat/long!) |
| **Distance** | In meters; divide by 1000 to get kilometers |
| **Haversine** | Formula for accurate distance on Earth's surface |

---

**Item routes are now complete! Ready for next step?**
