import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Bookmark, Briefcase, FileText, Sparkles, User } from 'lucide-react';
import { useCandidateProfile } from '../../hooks/useCandidateProfile';
import { useMyApplicationStats } from '../../hooks/useApplications';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';

const STATUS_COLORS = {
  applied: '#94a3b8',
  shortlisted: '#2563eb',
  hired: '#10b981',
  rejected: '#ef4444',
  withdrawn: '#cbd5e1',
};
const STATUS_LABELS = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

function CandidateDashboardPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useCandidateProfile();
  const { data: stats } = useMyApplicationStats();

  if (isLoading) return <LoadingScreen label="Loading your dashboard..." />;

  const chartData = Object.entries(stats?.applicationsByStatus || {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: STATUS_LABELS[status] || status, value: count, status }));

  const checklist = [
    { label: 'Headline & bio', done: Boolean(profile?.headline && profile?.bio) },
    { label: 'At least one skill', done: (profile?.skills?.length || 0) > 0 },
    {
      label: 'Education or experience',
      done: (profile?.education?.length || 0) > 0 || (profile?.experience?.length || 0) > 0,
    },
    { label: 'Resume uploaded', done: Boolean(profile?.resume?.url) },
  ];
  const completedCount = checklist.filter((item) => item.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s the state of your TalentForge profile.
        </p>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Profile completeness
          </h2>
          <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
            {completedCount}/{checklist.length}
          </span>
        </div>
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${(completedCount / checklist.length) * 100}%` }}
          />
        </div>
        <ul className="flex flex-col gap-2">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  item.done ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
              <span
                className={
                  item.done
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to={`${ROUTES.CANDIDATE_DASHBOARD}/profile`}
          className="card flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-700"
        >
          <User className="text-brand-600 dark:text-brand-400" size={22} />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">Edit profile</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Skills, education, experience &amp; more
            </p>
          </div>
        </Link>
        <Link
          to={`${ROUTES.CANDIDATE_DASHBOARD}/resume`}
          className="card flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-700"
        >
          <FileText className="text-brand-600 dark:text-brand-400" size={22} />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">Manage resume</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload, preview, or replace your resume
            </p>
          </div>
        </Link>
        <Link
          to={`${ROUTES.CANDIDATE_DASHBOARD}/applications`}
          className="card flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-700"
        >
          <Briefcase className="text-brand-600 dark:text-brand-400" size={22} />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">Applied jobs</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stats?.totalApplications || 0} application
              {stats?.totalApplications === 1 ? '' : 's'} so far
            </p>
          </div>
        </Link>
        <Link
          to={`${ROUTES.CANDIDATE_DASHBOARD}/saved-jobs`}
          className="card flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-700"
        >
          <Bookmark className="text-brand-600 dark:text-brand-400" size={22} />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">Saved jobs</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Jobs you&apos;ve bookmarked</p>
          </div>
        </Link>
        <Link
          to={`${ROUTES.CANDIDATE_DASHBOARD}/recommendations`}
          className="card flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-700"
        >
          <Sparkles className="text-brand-600 dark:text-brand-400" size={22} />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">Recommended for you</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-matched open jobs</p>
          </div>
        </Link>
      </div>

      {stats?.totalApplications > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Your applications by status
          </h2>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-56 w-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {chartData.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-2">
              {chartData.map((entry) => (
                <li key={entry.status} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[entry.status] || '#94a3b8' }}
                  />
                  {entry.name}: {entry.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateDashboardPage;
