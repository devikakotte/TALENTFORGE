import { Outlet, Link } from 'react-router-dom';
import { Moon, Sun, Sparkles, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME, ROUTES } from '../constants';

function PublicLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f7fb] dark:bg-[#08090d]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,.16),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(6,182,212,.10),transparent_25%)]" />
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#08090d]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
              T
            </span>
            <span className="text-lg text-slate-900 dark:text-white">{APP_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to={ROUTES.JOBS} className="text-sm font-medium text-slate-600 hover:text-violet-500 dark:text-slate-300">Discover Jobs</Link>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-violet-500 dark:text-slate-300">How it works</a>
            <Link to={ROUTES.LOGIN} className="text-sm font-medium text-slate-600 hover:text-violet-500 dark:text-slate-300">Log in</Link>
            <Link to={ROUTES.REGISTER} className="btn-primary">Get Started</Link>
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Link to={ROUTES.JOBS} className="rounded-xl p-2 text-slate-600 dark:text-slate-300" aria-label="Search jobs"><Search size={18}/></Link>
            <Link to={ROUTES.REGISTER} className="btn-primary px-3">Join</Link>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-slate-200/70 px-4 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {APP_NAME} · Forge Your Next Opportunity.</p>
          <p className="flex items-center gap-1"><Sparkles size={14}/> Career intelligence, not just job listings.</p>
        </div>
      </footer>
    </div>
  );
}
export default PublicLayout;
