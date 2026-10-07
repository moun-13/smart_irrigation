import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form);
      login(data);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-brand-light/50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Farmer Login</h1>
        <p className="text-text-muted mb-6">Access your irrigation dashboard and prediction history.</p>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
          />
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-green text-white font-semibold hover:bg-brand-green-dark transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-text-muted mt-6">
          No account yet?{' '}
          <Link className="text-brand-blue font-semibold hover:underline" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

