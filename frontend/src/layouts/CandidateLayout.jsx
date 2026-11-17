import { LayoutDashboard, User, FileText, Briefcase, Bookmark, Bell, Sparkles, ShieldCheck, BrainCircuit, Bot } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { ROUTES } from '../constants';

const CANDIDATE_NAV_ITEMS = [
  { to: ROUTES.CANDIDATE_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/profile`, label: 'Profile', icon: User },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/resume`, label: 'Resume', icon: FileText },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/applications`, label: 'Applied Jobs', icon: Briefcase },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/saved-jobs`, label: 'Saved Jobs', icon: Bookmark },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/recommendations`, label: 'Recommended', icon: Sparkles },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/resume-builder`, label: 'Resume Builder', icon: Sparkles },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/career-suggestions`, label: 'Career Tips', icon: Sparkles },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/skill-verification`, label: 'Skill Verification', icon: ShieldCheck },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/readiness`, label: 'Readiness Lab', icon: BrainCircuit },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/assistant`, label: 'AI Copilot', icon: Bot },
  { to: `${ROUTES.CANDIDATE_DASHBOARD}/notifications`, label: 'Notifications', icon: Bell },
];

function CandidateLayout() {
  return <DashboardLayout navItems={CANDIDATE_NAV_ITEMS} />;
}

export default CandidateLayout;
