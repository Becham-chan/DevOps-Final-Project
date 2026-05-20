import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-violet-650/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-650/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none z-0" />

      <div className="backdrop-blur-md bg-white/95 border border-white/20 rounded-3.5xl shadow-2xl w-full max-w-md p-8 sm:p-10 relative z-10 hover:border-violet-100/30 transition-all duration-350">
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-tr from-violet-600 to-indigo-650 rounded-2xl p-3 mb-4.5 shadow-lg shadow-violet-500/10">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">Welcome Back</h1>
          <p className="text-slate-400 mt-2 font-medium text-sm">Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-semibold animate-shake">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">Email Address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field shadow-sm" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">Password</label>
            <div className="relative">
              <input id="password" type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} className="input-field pr-11 shadow-sm"
                placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" id="login-submit" disabled={loading}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-violet-100">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-6 text-sm font-medium">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-violet-650 font-bold hover:text-violet-750 transition-colors hover:underline">Create one free</Link>
        </p>

        <div className="mt-6 p-4 bg-slate-50 border border-slate-100/60 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
          <p className="font-bold text-slate-600 mb-1 flex items-center gap-1">🔑 Demo Credentials</p>
          <p className="font-medium">Username: <span className="font-bold text-slate-700">student1@example.com</span></p>
          <p className="font-medium">Password: <span className="font-bold text-slate-700">testpass123</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
