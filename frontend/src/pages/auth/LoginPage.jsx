import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/form/FormField';
import { ROUTES, getDashboardRouteForRole } from '../../constants';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const redirectFrom = location.state?.from?.pathname;

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(values);
      toast.success('Welcome back!');
      navigate(redirectFrom || getDashboardRouteForRole(loggedInUser.role), { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-50">Log in</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Welcome back to TalentForge.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" id="email" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input-field"
              {...register('email', { required: 'Email is required' })}
            />
          </FormField>

          <FormField label="Password" id="password" error={errors.password}>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input-field"
              {...register('password', { required: 'Password is required' })}
            />
          </FormField>

          <div className="flex justify-end">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
