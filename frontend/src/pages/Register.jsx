import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, AlertCircle } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', firstName: '', lastName: '' });
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

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input id={name} type={type} name={name} value={form[name]} onChange={handle}
        className="input-field" placeholder={placeholder} required={required} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-100 rounded-2xl p-3 mb-4">
            <GraduationCap size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Join thousands of learners today</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertCircle size={18} className="shrink-0" /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" name="firstName" placeholder="John" />
            <Field label="Last Name" name="lastName" placeholder="Doe" />
          </div>
          <Field label="Username" name="username" placeholder="johndoe" required />
          <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
          <Field label="Password" name="password" type="password" placeholder="••••••••" required />
          <Field label="Confirm Password" name="confirm" type="password" placeholder="••••••••" required />

          <button type="submit" id="register-submit" disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
