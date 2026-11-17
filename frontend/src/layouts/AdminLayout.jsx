import { Briefcase, Building2, LayoutDashboard, Users, Bell } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { ROUTES } from '../constants';

const ADMIN_NAV_ITEMS = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: `${ROUTES.ADMIN_DASHBOARD}/users`, label: 'Users', icon: Users },
  { to: `${ROUTES.ADMIN_DASHBOARD}/companies`, label: 'Companies', icon: Building2 },
  { to: `${ROUTES.ADMIN_DASHBOARD}/jobs`, label: 'Jobs', icon: Briefcase },
  { to: `${ROUTES.ADMIN_DASHBOARD}/notifications`, label: 'Notifications', icon: Bell },
];

function AdminLayout() {
  return <DashboardLayout navItems={ADMIN_NAV_ITEMS} />;
}

export default AdminLayout;
