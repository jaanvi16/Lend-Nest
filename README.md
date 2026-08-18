# 📚 LendNest — Peer-to-Peer Lending Library

A full-stack web platform where users can lend items they own (books, tools, gadgets, and more) to people nearby, and find the **nearest available lender** for something they need — powered by real geospatial search.

Built as a 4th-year college full-stack development project.

---

## ✨ Features

- 🔐 **Authentication** — secure signup/login with JWT and hashed passwords
- 📍 **Geospatial "nearest lender" search** — MongoDB `2dsphere` geospatial queries return items sorted by real distance from the borrower's current location
- 📦 **Item listings** — create, edit, delete items with category, condition, and borrow terms
- 📸 **Photo uploads** — upload real photos from any device (phone camera/gallery or laptop)
- 🔄 **Full borrow request workflow** — request → approve/reject → handed over → returned → completed
- 💬 **In-app messaging** — chat with the other party once a request is approved, to arrange pickup/drop-off, with unread message notifications
- ⭐ **Two-way ratings** — borrower and lender rate each other after a completed exchange, building trust and a visible reputation score
- 🎨 **Polished, animated UI** — custom black-and-gold theme, smooth scroll animations and page transitions (Framer Motion)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcrypt |
| File Uploads | Multer |
| Geolocation | Browser Geolocation API + MongoDB `2dsphere` index |

---

## 🚀 Live Demo

🔗 **[Live App](#)** — *(link coming soon)*

---

## 📂 Project Structure

```
lending-library/
├── client/              # React frontend
│   └── src/
│       ├── components/  # Reusable UI components (Navbar, ItemCard, ChatModal, etc.)
│       ├── pages/        # Route-level pages
│       ├── context/       # Auth context (global state)
│       ├── services/       # API call layer (axios)
│       └── utils/           # Helper functions
└── server/               # Express backend
    ├── config/            # Database connection
    ├── controllers/        # Route logic
    ├── middleware/           # Auth + file upload middleware
    ├── models/                # Mongoose schemas
    ├── routes/                 # API route definitions
    └── uploads/                 # Uploaded item photos
```

---

## ⚙️ Getting Started (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### 1. Clone the repository
```bash
git clone https://github.com/jaanvi16/lending-library.git
cd lending-library
```

### 2. Backend setup
```bash
cd server
npm install
```
Create a `.env` file in `server/` (see `.env.example` for the template) with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_random_secret_string
FRONTEND_URL=http://localhost:3000
```
Then start the backend:
```bash
npm start
```

### 3. Frontend setup
```bash
cd ../client
npm install
```
Create a `.env` file in `client/` with:
```
REACT_APP_API_URL=http://localhost:5000/api
```
Then start the frontend:
```bash
npm start
```

The app will be running at `http://localhost:3000`, with the API at `http://localhost:5000`.

---

## 🔑 Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create a new account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/items?latitude=&longitude=&distance=` | Geospatial item search |
| POST | `/api/items` | Create a new item listing (with photo upload) |
| POST | `/api/requests` | Send a borrow request |
| PUT | `/api/requests/:id/respond` | Approve/reject a request |
| POST | `/api/ratings` | Rate the other party after an exchange |
| GET/POST | `/api/messages/:borrowRequestId` | View/send messages for a request |

---

## 📸 Screenshots

*(Add screenshots of your Home, Browse Items, and Item Detail pages here once your redesign is finalized.)*

---

## 🧑‍💻 Author

Built by [Jaanvi Mahant] as a Full-Stack college project.

---

## 📄 License

This project is for academic/educational purposes.