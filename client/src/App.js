import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageTransition } from './components/PageTransition';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { BrowseItemsPage } from './pages/BrowseItemsPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { CreateItemPage } from './pages/CreateItemPage';
import { MyItemsPage } from './pages/MyItemsPage';
import { MyRequestsPage } from './pages/MyRequestsPage';

// Wraps <Routes> so AnimatePresence can detect path changes via useLocation
// (useLocation only works inside <Router>, so this can't live directly in App)
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/browse" element={<PageTransition><BrowseItemsPage /></PageTransition>} />
        <Route path="/item/:id" element={<PageTransition><ItemDetailPage /></PageTransition>} />

        {/* Protected Routes */}
        <Route
          path="/create-item"
          element={
            <ProtectedRoute>
              <PageTransition><CreateItemPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-items"
          element={
            <ProtectedRoute>
              <PageTransition><MyItemsPage /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <PageTransition><MyRequestsPage /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#FDE68A]">
          <Navbar />
          <AnimatedRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;