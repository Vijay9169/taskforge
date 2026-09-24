import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutGrid, LogIn, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Auth() {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLogin) {
        login(data.token, data.user);
      } else {
        register(data.token, data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-300">
          <LayoutGrid size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            TaskForge <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">Kanban</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Agile Project & Task Management</p>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-3xl p-8 shadow-xl shadow-slate-200/80">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin
              ? 'Enter your credentials to access your workspace'
              : 'Sign up to start organizing tasks across your boards'}
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vijay Pandey"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. vijay@dev.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm transition shadow-md shadow-indigo-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              'Processing...'
            ) : isLogin ? (
              <>
                <LogIn size={16} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create Account
              </>
            )}
          </button>
        </form>

        {/* Switch Login / Register */}
        <div className="mt-6 pt-5 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'} <ArrowRight size={12} />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}