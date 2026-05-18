import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, LogOut, LayoutDashboard, Menu, X, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-indigo-600 hover:text-indigo-700 transition-colors">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <GraduationCap size={22} className="text-white" />
            </div>
            LearnHub
          </Link>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500">
                  Hi, <span className="font-semibold text-gray-800">{user?.first_name || user?.username}</span>
                </span>
                <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-700 hover:text-indigo-600 font-medium transition-colors text-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 font-medium transition-colors text-sm">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-sm px-4 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 font-medium">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-red-600 font-medium w-full">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2 text-gray-700 font-medium">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="block py-2 text-indigo-600 font-semibold">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
