import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import FormField from '../../components/form/FormField';
import { ROUTES } from '../../constants';

function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Forgot your password?
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {isSent ? (
          <p className="rounded-lg bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-950 dark:text-brand-200">
            If that email is registered with TalentForge, a reset link is on its way.
            Please check your inbox.
          </p>
        ) : (
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

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered your password?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
