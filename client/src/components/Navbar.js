import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { messageAPI } from '../services/messageAPI';

const UNREAD_POLL_MS = 10000; // check for new messages every 10 seconds

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const loadUnread = async () => {
      try {
        const res = await messageAPI.getUnreadCount();
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error('Failed to load unread count', err);
      }
    };

    loadUnread();
    const interval = setInterval(loadUnread, UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo className="h-9 w-9 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xl font-extrabold text-white hidden sm:inline tracking-tight">
              Lend<span className="text-accent-500">Nest</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-200 font-medium hover:text-accent-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/browse"
                  className="px-3 py-2 text-gray-200 hover:text-accent-500 transition-colors font-medium"
                >
                  Browse
                </Link>
                <Link
                  to="/create-item"
                  className="px-3 py-2 text-gray-200 hover:text-accent-500 transition-colors font-medium hidden md:inline"
                >
                  List Item
                </Link>
                <Link
                  to="/my-items"
                  className="px-3 py-2 text-gray-200 hover:text-accent-500 transition-colors font-medium hidden md:inline"
                >
                  My Items
                </Link>
                <Link
                  to="/my-requests"
                  className="relative px-3 py-2 text-gray-200 hover:text-accent-500 transition-colors font-medium hidden md:inline"
                >
                  My Requests
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="pl-3 border-l border-gray-700 hidden sm:block">
                  <p className="text-sm font-medium text-gray-200">{user?.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 hover:scale-105 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}