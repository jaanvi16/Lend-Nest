# Setup Guide: Models & Database

This document explains the MongoDB models and how to get everything running.

## What I've Created So Far

### 1. **User Model** (`server/models/User.js`)
Stores information about each user (both lenders and borrowers).

**Key Fields:**
- `name`, `email`, `password` — Basic auth info
- `profilePhoto`, `bio` — User profile
- `location` — Geospatial Point `[longitude, latitude]` where the user is located
- `averageRating`, `totalRatings` — Aggregated from ratings
- **Geospatial Index** — The `location` field has a `2dsphere` index for proximity queries

**Special Features:**
- Password is hashed using bcrypt before saving (hook in `save`)
- Has a `.matchPassword()` method for login verification
- `.toJSON()` method removes password before sending to frontend

### 2. **Item Model** (`server/models/Item.js`)
Represents an item available for lending.

**Key Fields:**
- `lenderId` — Reference to the User who owns this item
- `title`, `description`, `category` — Item details
- `photoUrl` — URL to uploaded image
- `location` — Geospatial Point `[longitude, latitude]` (the lender's location)
- `isAvailable` — Whether the item can be borrowed
- `borrowStartDate`, `borrowEndDate` — When it's currently borrowed
- `condition`, `requiresDeposit`, `maxBorrowDays` — Terms of lending

**Special Features:**
- **2dsphere geospatial index** on `location` — Critical for your "nearest lender" search!
- When you search for items near a point, MongoDB uses this index to quickly find nearby items
- Has a `.distanceFrom()` method to calculate the actual distance from coordinates

### 3. **BorrowRequest Model** (`server/models/BorrowRequest.js`)
Tracks the lifecycle of a borrow transaction.

**Key Fields:**
- `borrowerId`, `lenderId`, `itemId` — The parties involved
- `requestedStartDate`, `requestedEndDate` — What the borrower asked for
- `actualStartDate`, `actualEndDate` — What actually happened
- `status` — Workflow: `requested` → `approved` → `borrowed` → `returned` → `completed`
- `message` — Borrower can explain why they need the item
- `depositAmount`, `depositReturned` — For items requiring deposits

**Workflow:**
1. Borrower creates request (status: `requested`)
2. Lender approves or rejects (status: `approved` or `rejected`)
3. Lender marks as picked up (status: `borrowed`)
4. Borrower returns item (status: `returned`)
5. Both parties complete rating (status: `completed`)

### 4. **Rating Model** (`server/models/Rating.js`)
Records reviews and ratings between users.

**Key Fields:**
- `raterId`, `rateeId` — Who rated whom
- `borrowRequestId` — The borrow request this rating is for
- `score` (1-5), `review` — The rating and review text
- `role` — Whether the rater was a `lender` or `borrower`

**Special Feature:**
- When a rating is saved, it automatically recalculates the `ratee`'s `averageRating` and `totalRatings` on the User model

---

## Getting Your MongoDB Atlas Connection String

Your `.env` file needs `MONGODB_URI`. Here's how to get it:

### Step 1: Create MongoDB Atlas Account
1. Go to https://cloud.mongodb.com
2. Sign up (free tier available)
3. Create an organization and project

### Step 2: Create a Cluster
1. Click "Create a Deployment"
2. Choose "Free" tier (good for learning)
3. Pick a region (closer to your location is better for latency)
4. Click "Create Cluster"

### Step 3: Get Connection String
1. Once the cluster is created, click "Connect"
2. Choose "Drivers" → "Node.js" → Copy the connection string
3. It looks like: `mongodb+srv://<username>:<password>@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority`

### Step 4: Create Database User
1. In MongoDB Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Create a username and password (remember these!)
4. Click "Add User"

### Step 5: Whitelist Your IP
1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development only!)
4. Or add your specific IP address for security

### Step 6: Fill in Your `.env`
1. In `server/.env`, replace the placeholders in `MONGODB_URI`:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster-name.mongodb.net/lending-library?retryWrites=true&w=majority
   ```
2. Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with the credentials you created
3. The database name `lending-library` can be anything — MongoDB will create it automatically

### Step 7: Generate JWT Secret
In PowerShell (Windows), run:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy that long hex string into `JWT_SECRET` in your `.env`

---

## Next Steps

Once you confirm you're ready, I'll show you:

1. **Authentication Routes** — Login, signup with JWT tokens
2. **Item Listing Routes** — Create, read, update, delete items
3. **Geospatial Search** — Finding nearby items using the 2dsphere index
4. **Map Component** — React component with Leaflet to show items on a map
5. **Borrow Request Workflow** — Creating, approving, tracking requests
6. **Rating System** — Allowing users to rate each other after borrows

---

**Are you ready to continue, or do you have questions about the models?**
