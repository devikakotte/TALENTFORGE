import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import FormField from '../../components/form/FormField';
import { ROUTES } from '../../constants';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { password: '', confirmPassword: '' } });

  const password = watch('password');

  const onSubmit = async ({ password: newPassword }) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token, password: newPassword });
      toast.success('Password reset. Please log in with your new password.');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Reset link is invalid or has expired';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Reset your password
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Choose a new password for your account.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="New password" id="password" error={errors.password}>
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

          <FormField label="Confirm new password" id="confirmPassword" error={errors.confirmPassword}>
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
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to={ROUTES.LOGIN} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Back to log in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ResetPasswordPage;
