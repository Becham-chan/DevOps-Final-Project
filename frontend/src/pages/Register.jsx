import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, AlertCircle } from 'lucide-react';

// Defined OUTSIDE Register so React doesn't unmount/remount on every keystroke
const Field = ({ label, name, type = 'text', placeholder, required, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="input-field shadow-sm"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const Register = () => {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '', firstName: '', lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.firstName, form.lastName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
          <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">Create Account</h1>
          <p className="text-slate-400 mt-2 font-medium text-sm">Join thousands of learners today</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-semibold animate-shake">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First Name" name="firstName" placeholder="John"
              value={form.firstName} onChange={handle}
            />
            <Field
              label="Last Name" name="lastName" placeholder="Doe"
              value={form.lastName} onChange={handle}
            />
          </div>
          <Field
            label="Username" name="username" placeholder="johndoe"
            value={form.username} onChange={handle} required
          />
          <Field
            label="Email" name="email" type="email" placeholder="you@example.com"
            value={form.email} onChange={handle} required
          />
          <Field
            label="Password" name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={handle} required
          />
          <Field
            label="Confirm Password" name="confirm" type="password" placeholder="••••••••"
            value={form.confirm} onChange={handle} required
          />

          <button
            type="submit"
            id="register-submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-violet-100"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-500 mt-6 text-sm font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-650 font-bold hover:text-violet-750 transition-colors hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
