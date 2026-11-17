import { Briefcase, Building2, LayoutDashboard, Bell, Search } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { ROUTES } from '../constants';

const RECRUITER_NAV_ITEMS = [
  { to: ROUTES.RECRUITER_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: `${ROUTES.RECRUITER_DASHBOARD}/company`, label: 'Company', icon: Building2 },
  { to: `${ROUTES.RECRUITER_DASHBOARD}/jobs`, label: 'Jobs', icon: Briefcase },
  { to: `${ROUTES.RECRUITER_DASHBOARD}/talent-search`, label: 'Talent Search', icon: Search },
  { to: `${ROUTES.RECRUITER_DASHBOARD}/notifications`, label: 'Notifications', icon: Bell },
];

function RecruiterLayout() {
  return <DashboardLayout navItems={RECRUITER_NAV_ITEMS} />;
}

export default RecruiterLayout;
