import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);
      // Navigation is handled by PublicRoute in AppRouter
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'farmer') navigate('/farmer/dashboard');
      else navigate('/viewer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mintBg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl ring-1 ring-secondary/20 p-8 sm:p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black font-outfit text-textPrimary">Welcome Back</h1>
          <p className="text-textMuted font-medium mt-2">Smart Irrigation Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              placeholder="name@farm.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-textMuted font-medium">Demo Accounts:</p>
          <div className="flex justify-center gap-4 mt-2 text-xs font-bold text-primary">
            <button onClick={() => { setEmail('admin@melekai.com'); setPassword('admin123'); }}>Admin</button>
            <button onClick={() => { setEmail('farmer@melekai.com'); setPassword('farmer123'); }}>Farmer</button>
            <button onClick={() => { setEmail('viewer@melekai.com'); setPassword('viewer123'); }}>Viewer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
