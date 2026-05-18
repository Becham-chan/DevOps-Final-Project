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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-100 rounded-2xl p-3 mb-4">
            <GraduationCap size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to continue learning</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input id="password" type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} className="input-field pr-11"
                placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" id="login-submit" disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
        </p>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
          <p className="font-semibold text-gray-600 mb-1">Demo credentials</p>
          <p>student1@example.com / testpass123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
