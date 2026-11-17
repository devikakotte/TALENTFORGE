import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Page not found</h1>
      <p className="text-slate-600 dark:text-slate-300">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link to={ROUTES.HOME} className="btn-primary">
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundPage;
