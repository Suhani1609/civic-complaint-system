import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const getDashboard = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'ward_officer') return '/officer';
  return '/dashboard';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(getDashboard(res.data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;