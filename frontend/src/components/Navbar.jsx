import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-blue-600">
          <BookOpen size={28} />
          Course Platform
        </Link>

        {/* Mobile menu button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 px-4 py-4 space-y-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="block bg-blue-600 text-white px-4 py-2 rounded-lg">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
``
