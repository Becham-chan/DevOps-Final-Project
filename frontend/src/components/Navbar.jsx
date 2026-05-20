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
    <nav className="backdrop-blur-md bg-white/80 border-b border-slate-100/80 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-800 hover:text-violet-600 transition-colors">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg p-2 shadow-md shadow-violet-100/50">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display tracking-tight text-slate-900 font-extrabold">LearnHub</span>
          </Link>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-600">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="hidden md:flex items-center gap-5">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-500">
                  Hi, <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{user?.first_name || user?.username}</span>
                </span>
                <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-600 hover:text-violet-600 font-semibold transition-all duration-200 text-sm hover:scale-[1.02]">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl hover:bg-rose-100 font-semibold transition-all duration-200 text-sm hover:scale-[1.02] cursor-pointer">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-violet-600 font-semibold transition-colors text-sm px-4 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-4 space-y-2 animate-fade-in">
          {isAuthenticated ? (
            <>
              <div className="px-2 py-1.5 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-50">
                Hi, {user?.first_name || user?.username}
              </div>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-all">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold w-full text-left transition-all cursor-pointer">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-all">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="block py-2.5 px-3 rounded-xl bg-violet-50 text-violet-600 font-bold hover:bg-violet-100 transition-all text-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
