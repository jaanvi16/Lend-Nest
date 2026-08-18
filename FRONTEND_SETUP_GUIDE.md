# Lending Library - React Frontend Setup Guide

## ✅ Frontend Complete!

The full React frontend has been scaffolded and built with all pages, components, and styling. Here's what's been created:

---

## Project Structure

```
client/
├── public/
│   └── index.html              # React entry point with Leaflet CSS
├── src/
│   ├── App.js                  # Main routing and provider wrapper
│   ├── index.js                # React DOM render (auto-generated)
│   ├── index.css               # Global Tailwind and custom styles
│   ├── context/
│   │   └── AuthContext.js      # Global auth state with token persistence
│   ├── services/
│   │   ├── apiClient.js        # Axios client with JWT interceptor
│   │   └── itemAPI.js          # Item CRUD and search wrapper functions
│   ├── utils/
│   │   └── helpers.js          # Geolocation, formatting, rating utilities
│   ├── components/
│   │   ├── Navbar.js           # Navigation with conditional rendering
│   │   ├── ProtectedRoute.js   # Route wrapper for authenticated pages
│   │   └── ItemCard.js         # Reusable item card with edit/delete actions
│   └── pages/
│       ├── HomePage.js         # Landing page with features
│       ├── LoginPage.js        # Login form
│       ├── SignupPage.js       # Signup with geolocation
│       ├── BrowseItemsPage.js  # Geospatial search with filters
│       ├── ItemDetailPage.js   # Single item view
│       ├── CreateItemPage.js   # Item listing form
│       └── MyItemsPage.js      # User's items management
├── package.json                # Dependencies (all pre-configured)
├── .env.example                # Environment template
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS for Tailwind
└── README.md                   # React app instructions
```

---

## Pages Built

### 1. **HomePage** (`/`)
- **Purpose**: Landing page with features and CTA buttons
- **Features**:
  - Hero section with app description
  - Different CTAs for authenticated vs. public users
  - Features section highlighting "How It Works"
  - Community stats section
  - Fully responsive design

### 2. **LoginPage** (`/login`)
- **Purpose**: User authentication
- **Features**:
  - Email and password fields
  - Error message display
  - Loading state on submit button
  - Link to signup page
  - Redirects to `/browse` on successful login

### 3. **SignupPage** (`/signup`)
- **Purpose**: New user registration with location capture
- **Features**:
  - Name, email, password fields
  - **Geolocation Integration**:
    - Requests browser location on load
    - Shows location status (✓ saved or ❌ denied)
    - Fallback manual latitude/longitude input if denied
  - Form validation before submit
  - Redirects to `/browse` on success
  - Link to login page

### 4. **BrowseItemsPage** (`/browse`)
- **Purpose**: Search and filter items by location
- **Features**:
  - **Geospatial Search**:
    - Automatically requests user's location
    - Calls `/api/items?latitude=X&longitude=Y&distance=Z`
    - Results sorted by distance (nearest first)
  - **Search Bar**: Filter by keyword (title/description)
  - **Category Filter**: Dropdown to filter by category
  - **Distance Slider**: Adjust search radius (1-50 km)
  - **Grid Display**: Responsive ItemCard grid showing distance for each item
  - **Empty State**: Message when no items found

### 5. **ItemDetailPage** (`/item/:id`)
- **Purpose**: Full item view with lender profile
- **Features**:
  - Item image (or placeholder)
  - Title, category, condition, availability
  - Full description
  - Item details (max borrow days, deposit info, listed date)
  - **Lender Profile**:
    - Name, email, bio
    - Profile photo
    - Rating and review count
  - "Request to Borrow" button (placeholder for future functionality)
  - "Back to Browse" link
  - Error handling for missing items

### 6. **CreateItemPage** (`/create-item`) - **Protected**
- **Purpose**: List new items for borrowing
- **Features**:
  - Form fields:
    - Title (required)
    - Description (optional)
    - Category dropdown
    - Condition dropdown
    - Photo URL
    - Max borrow days
    - Deposit toggle + amount
  - **Automatic Location**: Displays logged-in user's profile location
  - Form validation before submit
  - Redirects to `/my-items` on success
  - Cancel button returns to my-items
  - Error message display

### 7. **MyItemsPage** (`/my-items`) - **Protected**
- **Purpose**: Manage user's listed items
- **Features**:
  - Grid display of user's items using ItemCard
  - ItemCard with `showActions=true` for edit/delete buttons
  - "List New Item" button linking to `/create-item`
  - Delete confirmation dialog
  - Removes item from grid on delete
  - Empty state with CTA when no items exist
  - Error handling

---

## Components Built

### **Navbar**
- **Location**: `src/components/Navbar.js`
- **Features**:
  - Logo with emoji (📚)
  - Conditional rendering:
    - **Not logged in**: Shows "Login" and "Sign Up" links
    - **Logged in**: Shows "Browse", "List Item", "My Items", and "Logout"
  - Displays user's name when logged in
  - Responsive design (hamburger menu can be added)
  - Logout clears auth and redirects to login

### **ProtectedRoute**
- **Location**: `src/components/ProtectedRoute.js`
- **Features**:
  - Wraps pages requiring authentication
  - Redirects to `/login` if not authenticated
  - Shows "Loading..." during auth verification
  - Usage: `<ProtectedRoute><CreateItemPage /></ProtectedRoute>`

### **ItemCard**
- **Location**: `src/components/ItemCard.js`
- **Features**:
  - Image display or placeholder (📦)
  - Availability badge (yellow "Available" or gray "Unavailable")
  - Category badge (blue pill)
  - Title with 2-line clamp
  - Condition display
  - Lender name with rating stars
  - Optional distance display (formatted nicely)
  - Max borrow days
  - Optional edit/delete buttons (for owner's items)
  - Link to detail page (`/item/:id`)
  - Hover effects (shadow, image scale)
  - Props: `item`, `showDistance`, `showActions`, `onEdit`, `onDelete`

---

## Services & Utilities

### **AuthContext** (`src/context/AuthContext.js`)
- **State**:
  - `user`: Current user object
  - `token`: JWT token
  - `isAuthenticated`: Boolean flag
  - `loading`: During auth verification
- **Functions**:
  - `signup(name, email, password, latitude, longitude)`: Creates account
  - `login(email, password)`: Authenticates user
  - `logout()`: Clears auth and localStorage
  - `updateProfile(name, bio, profilePhoto, latitude, longitude)`: Updates user
  - `verifyToken()`: Called on mount to restore session
- **Persistence**: Token stored in `localStorage` with key `lendingLibrary_token`
- **Hook**: `useAuth()` - Use in any component to access auth state

### **apiClient** (`src/services/apiClient.js`)
- **Base URL**: `process.env.REACT_APP_API_URL || 'http://localhost:5000/api'`
- **JWT Interceptor**: Automatically attaches `Authorization: Bearer <token>` header
- **401 Handler**: On unauthorized, clears token and redirects to `/login`
- **Error Pass-through**: All errors passed to calling code

### **itemAPI** (`src/services/itemAPI.js`)
- **Functions**:
  - `getAllItems(latitude, longitude, distance, category, search)`: Geospatial search
  - `getItem(id)`: Fetch single item
  - `createItem(itemData)`: Create new item
  - `updateItem(id, itemData)`: Update item
  - `deleteItem(id)`: Delete item
  - `getMyItems()`: Get logged-in user's items
  - `getItemsByLender(lenderId)`: Get items by specific lender

### **helpers** (`src/utils/helpers.js`)
- `getCurrentLocation()`: Promise-based Geolocation API wrapper
  - Returns: `{ latitude, longitude }`
  - Throws on permission denied
- `formatDistance(meters)`: Formats as "X.X km" if ≥ 1000m, else "X m"
- `formatDate(string)`: Formats to "MMM DD, YYYY"
- `renderStars(rating)`: JSX with star emoji display

---

## Styling

### **Tailwind CSS Configuration**
- **Primary Color**: Blue (blue-600, blue-700, blue-800)
  - Used for: Buttons, navbar, links, primary CTAs
- **Accent Color**: Yellow (yellow-400, yellow-500)
  - Used for: "Available" badges, highlights
- **Backgrounds**: White/light gray (gray-50, gray-100)
- **Text**: Gray shades for hierarchy

### **Custom CSS Classes** (`src/index.css`)
- `.btn-primary`: Blue button styling
- `.btn-secondary`: Secondary button styling
- `.card`: Card container with shadow and rounded corners
- `.input-field`: Form input styling
- `.badge-available`: Yellow availability badge
- `.badge-unavailable`: Gray unavailability badge

---

## Environment Setup

### **Create `.env` file in client folder:**
```bash
REACT_APP_API_URL=http://localhost:5000
```

Or copy from `.env.example`:
```bash
cp .env.example .env
```

---

## Ready to Run!

### **1. Install dependencies:**
```bash
cd client
npm install
```

### **2. Start development server:**
```bash
npm start
```

The app will open at `http://localhost:3000`

### **3. Make sure backend is running:**
```bash
cd server
npm start
```

Backend should be running at `http://localhost:5000`

---

## Feature Workflow

### **New User Flow**:
1. Land on `/` (HomePage)
2. Click "Get Started" → `/signup`
3. Enter name, email, password
4. Grant geolocation permission (or enter manually)
5. Redirected to `/browse` (already logged in)
6. Browse items filtered by location

### **Browsing Items**:
1. On `/browse`, app automatically detects location
2. Displays items within 10 km (adjustable)
3. Search by keyword (title/description)
4. Filter by category
5. Click ItemCard → `/item/:id` for details
6. See lender profile and ratings

### **Listing Items**:
1. Authenticated user clicks "List Item"
2. Redirected to `/create-item`
3. Fill form (uses logged-in user's location automatically)
4. Submit → Item created
5. Redirected to `/my-items`
6. Can edit (placeholder) or delete items

### **Managing Items**:
1. Click "My Items" in navbar
2. View all listed items in grid
3. Edit button (placeholder for future)
4. Delete button with confirmation
5. "List New Item" button to add more

---

## Future Enhancements

These features are scaffolded but not yet implemented:

1. **Borrow Request Workflow**
   - "Request to Borrow" button on ItemDetailPage
   - BorrowRequestPage to manage requests
   - Accept/Reject functionality for lenders
   - Track borrowed item status

2. **Rating System**
   - Rate borrower after return
   - Rate lender after completing borrow
   - Display aggregate ratings

3. **Leaflet Map Integration**
   - Show items on interactive map
   - Cluster markers by location
   - Visual distance representation

4. **Photo Upload**
   - Direct file upload (currently URL-only)
   - Image compression and optimization
   - Multiple photo support per item

5. **User Profile Page**
   - View full profile with ratings
   - Edit profile (name, bio, photo, location)
   - View lending/borrowing history

6. **Edit Item Page**
   - Pre-fill CreateItemPage with existing item data
   - Route to `/create-item/:id` for editing
   - Or inline editing in MyItemsPage

---

## Testing Checklist

- [ ] Create account with geolocation permission
- [ ] Browse items near your location
- [ ] Search by keyword
- [ ] Filter by category
- [ ] View item details and lender profile
- [ ] List a new item
- [ ] View my items
- [ ] Delete an item
- [ ] Logout and login again (token persists)
- [ ] Try without geolocation permission (manual entry)

---

## Notes

- All pages are responsive (mobile-first design)
- Error handling and user feedback throughout
- Loading states on async operations
- Automatic token refresh on app load
- 401 responses redirect to login
- All forms have basic validation
- Blue/yellow color scheme applied consistently

---

## Next Steps

Once you've tested the frontend:

1. Implement Borrow Request workflow (backend routes + frontend pages)
2. Implement Rating system (backend routes + frontend pages)
3. Add Leaflet map component to BrowseItemsPage
4. Implement photo upload functionality
5. Create User Profile page
6. Add edit item functionality

Enjoy your Lending Library app! 📚
