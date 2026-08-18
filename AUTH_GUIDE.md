# Authentication System Explained

## How It Works

### 1. **JWT (JSON Web Tokens)**
A JWT is like a digital ID card that proves you're logged in. It's issued by the server and stored by the client.

**Structure:** `header.payload.signature`
- **Header**: Algorithm used (HS256)
- **Payload**: User ID + expiration time (7 days)
- **Signature**: Proves the token hasn't been tampered with (using `JWT_SECRET`)

### 2. **Flow**

```
SIGNUP:
1. User sends: { name, email, password, latitude, longitude }
2. Server hashes password with bcrypt
3. Server stores user in MongoDB
4. Server generates JWT token (valid for 7 days)
5. Client receives token and stores it (usually in localStorage)

LOGIN:
1. User sends: { email, password }
2. Server finds user by email
3. Server compares password using bcrypt.compare()
4. If match, server generates JWT token
5. Client receives token

ACCESSING PROTECTED ROUTES:
1. Client sends request with: Authorization: Bearer <token>
2. Middleware `protect` verifies the token using JWT_SECRET
3. If valid, extracts user ID and attaches to req.userId
4. Controller accesses req.userId to identify the user
```

---

## API Endpoints

### Public Endpoints (No Login Required)

#### **POST /api/auth/signup**
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "latitude": 40.7128,      // Optional: user's current location
  "longitude": -74.0060
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "location": [-74.0060, 40.7128]
  }
}
```

---

#### **POST /api/auth/login**
Log in with existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "location": [-74.0060, 40.7128],
    "averageRating": 4.5
  }
}
```

---

### Protected Endpoints (Requires Login Token)

#### **GET /api/auth/me**
Get the current authenticated user's profile.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePhoto": "https://...",
    "bio": "I love lending books!",
    "location": [-74.0060, 40.7128],
    "averageRating": 4.5,
    "totalRatings": 12
  }
}
```

---

#### **PUT /api/auth/profile**
Update your profile information.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all optional):**
```json
{
  "name": "Jane Doe",
  "bio": "Updated bio text",
  "profilePhoto": "https://example.com/photo.jpg",
  "latitude": 40.7150,
  "longitude": -74.0070
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Code Structure

### `middleware/auth.js`
```
protect middleware
  ├─ Looks for token in Authorization header
  ├─ Verifies token using JWT_SECRET
  ├─ Extracts user ID and attaches to req.userId
  └─ Passes control to next middleware/controller
```

### `controllers/authController.js`
```
signup(req, res)
  ├─ Validate inputs
  ├─ Check if email already exists
  ├─ Create new user (password hashed automatically)
  ├─ Generate JWT token
  └─ Send token + user info

login(req, res)
  ├─ Validate inputs
  ├─ Find user by email
  ├─ Compare password using bcrypt.compare()
  ├─ Generate JWT token
  └─ Send token + user info

getMe(req, res)
  ├─ Uses req.userId from protect middleware
  ├─ Find user in database
  └─ Return user profile

updateProfile(req, res)
  ├─ Uses req.userId from protect middleware
  ├─ Update user fields
  └─ Save and return updated user
```

### `routes/auth.js`
```
POST   /api/auth/signup      → signup (public)
POST   /api/auth/login       → login (public)
GET    /api/auth/me          → getMe (protected)
PUT    /api/auth/profile     → updateProfile (protected)
```

---

## How the `protect` Middleware Works

When a request comes to a protected route:

```
CLIENT:
  GET /api/auth/me
  Headers: { Authorization: "Bearer abc123xyz..." }
        ↓
SERVER:
  protect middleware:
    1. Extract token from header
    2. jwt.verify(token, JWT_SECRET)
       ↓ if valid
    3. Decode user ID from token
    4. req.userId = "507f1f77bcf86cd799439011"
    5. next() → call the controller
        ↓
  getMe controller:
    1. Use req.userId to find user
    2. Return user profile
        ↓
CLIENT:
  Response 200 with user data
```

---

## Security Features

1. **Password Hashing** — Passwords are hashed with bcrypt before storage (never stored as plain text)
2. **Token Expiration** — Tokens expire after 7 days; users must log in again
3. **Secret Key** — JWT tokens are signed with a secret; if tampered with, verification fails
4. **Select('+password')** — Password field is hidden by default; only fetched when needed for login
5. **HTTPS (in production)** — Tokens should only be sent over HTTPS to prevent interception

---

## Next Steps

The auth system is ready! When you're ready, we'll build:

1. **Item Routes** — Create, search, update, delete listings
2. **Geospatial Search** — Find items sorted by distance using $near query
3. **React Frontend** — Pages, login form, item listing, map view

---

**Testing the Auth Routes:**

You can test with a tool like **Postman** or **curl**:

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "password123",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'

# Get current user (use the token you got from login/signup)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
