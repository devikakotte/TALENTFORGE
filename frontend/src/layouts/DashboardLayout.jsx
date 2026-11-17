import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut, Moon, Sun, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/common/NotificationBell';
import { APP_NAME, ROUTES } from '../constants';

function navLinkClasses({ isActive }) {
  return [
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
    isActive
      ? 'bg-gradient-to-r from-violet-600/20 to-cyan-400/10 text-violet-500 dark:text-violet-200 ring-1 ring-violet-500/20'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[.05]',
  ].join(' ');
}

function DashboardLayout({ navItems = [] }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const mobileItems = navItems.filter((item) => !item.label.toLowerCase().includes('notifications')).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f7f7fb] dark:bg-[#08090d]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,.12),transparent_28%),radial-gradient(circle_at_10%_70%,rgba(6,182,212,.07),transparent_25%)]" />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200/70 bg-white/75 p-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0b0c11]/80 lg:flex lg:flex-col">
        <Link to={ROUTES.HOME} className="mb-7 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 font-bold text-white">T</span>
          <div><div className="font-bold text-slate-900 dark:text-white">{APP_NAME}</div><div className="text-[10px] uppercase tracking-widest text-slate-500">Career OS</div></div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">{navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClasses} end={item.end}>
            <item.icon size={18} />{item.label}
          </NavLink>
        ))}</nav>
        <div className="mt-4 rounded-2xl border bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[.03]">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white">{user?.fullName?.[0] || 'T'}</div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.fullName}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10">{theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}</button>
            <button type="button" onClick={logout} className="flex flex-1 items-center justify-center gap-2 rounded-xl p-2 text-sm font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10"><LogOut size={16}/> Log out</button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/70 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-[#08090d]/70 sm:px-6">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 lg:hidden"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 font-bold text-white">T</span><span className="font-bold">{APP_NAME}</span></Link>
          <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex"><Sparkles size={15} className="text-violet-400"/> Intelligent career workspace</div>
          <NotificationBell />
        </header>
        <div className="page-shell pb-24 lg:pb-8"><Outlet /></div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-2xl border bg-white/90 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#111218]/95 lg:hidden">
        {mobileItems.map((item) => <NavLink key={item.to} to={item.to} className={({isActive}) => `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold ${isActive ? 'bg-violet-500/15 text-violet-500 dark:text-violet-300' : 'text-slate-500'}`} end={item.end}><item.icon size={17}/>{item.label}</NavLink>)}
      </nav>
    </div>
  );
}
export default DashboardLayout;
