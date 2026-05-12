import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const SignupPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(res.data.user, res.data.accessToken);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Create account</h2>
      <p className="text-sm text-gray-500 mb-6">Join the civic complaint platform</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="label">Full name</label>
          <input
            type="text"
            className="input"
            placeholder="Your full name"
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

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
            placeholder="Min. 6 characters"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label">Confirm password</label>
          <input
            type="password"
            className="input"
            placeholder="Repeat your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;