import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/form/FormField';
import { ROUTES, USER_ROLES, getDashboardRouteForRole } from '../../constants';

function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: USER_ROLES.CANDIDATE,
    },
  });

  const password = watch('password');

  const onSubmit = async ({ confirmPassword, ...values }) => {
    setIsSubmitting(true);
    try {
      const newUser = await registerUser(values);
      toast.success('Account created! Please verify your email.');
      navigate(getDashboardRouteForRole(newUser.role), { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Create your account
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Join TalentForge as a candidate or recruiter.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Full name" id="fullName" error={errors.fullName}>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className="input-field"
              {...register('fullName', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Full name is too short' },
              })}
            />
          </FormField>

          <FormField label="Email" id="email" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input-field"
              {...register('email', { required: 'Email is required' })}
            />
          </FormField>

          <FormField label="I am a..." id="role" error={errors.role}>
            <select id="role" className="input-field" {...register('role')}>
              <option value={USER_ROLES.CANDIDATE}>Candidate — looking for jobs</option>
              <option value={USER_ROLES.RECRUITER}>Recruiter — hiring talent</option>
            </select>
          </FormField>

          <FormField label="Password" id="password" error={errors.password}>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input-field"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                  message: 'Password must include a letter and a number',
                },
              })}
            />
          </FormField>

          <FormField label="Confirm password" id="confirmPassword" error={errors.confirmPassword}>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="input-field"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
          </FormField>

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
