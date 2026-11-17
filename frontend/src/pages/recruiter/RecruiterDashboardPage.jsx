import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Briefcase, Building2, Eye, Plus, Users } from 'lucide-react';
import { useCompanyProfile } from '../../hooks/useCompanyProfile';
import { useMyJobs, useMyJobStats } from '../../hooks/useJobs';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';

const STATUS_LABELS = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
  withdrawn: 'Withdrawn',
};

function RecruiterDashboardPage() {
  const { user } = useAuth();
  const { data: company, isLoading: isCompanyLoading } = useCompanyProfile();
  const { data: jobsData, isLoading: isJobsLoading } = useMyJobs({ limit: 5 });
  const { data: stats, isLoading: isStatsLoading } = useMyJobStats();

  if (isCompanyLoading || isJobsLoading || isStatsLoading) {
    return <LoadingScreen label="Loading your dashboard..." />;
  }

  const jobs = jobsData?.jobs || [];
  const chartData = Object.entries(stats?.applicationsByStatus || {}).map(([status, count]) => ({
    status: STATUS_LABELS[status] || status,
    count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{company?.companyName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="card">
          <p className="text-sm text-slate-500 dark:text-slate-400">Open jobs</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {stats?.jobsByStatus?.open || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500 dark:text-slate-400">Drafts</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {stats?.jobsByStatus?.draft || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500 dark:text-slate-400">Closed</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {stats?.jobsByStatus?.closed || 0}
          </p>
        </div>
        <div className="card">
          <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <Eye size={14} /> Total views
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {stats?.totalViews || 0}
          </p>
        </div>
        <div className="card">
          <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <Users size={14} /> Applicants
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {stats?.totalApplications || 0}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to={`${ROUTES.RECRUITER_DASHBOARD}/company`}
          className="card flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-700"
        >
          <Building2 className="text-brand-600 dark:text-brand-400" size={22} />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">Company profile</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Details candidates see on your job posts
            </p>
          </div>
        </Link>
        <Link
          to={`${ROUTES.RECRUITER_DASHBOARD}/jobs/new`}
          className="card flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-700"
        >
          <Plus className="text-brand-600 dark:text-brand-400" size={22} />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">Post a new job</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create a draft, then publish when ready
            </p>
          </div>
        </Link>
      </div>

      {stats?.totalApplications > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Applicants by status
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Recent jobs</h2>
          <Link
            to={`${ROUTES.RECRUITER_DASHBOARD}/jobs`}
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            <Briefcase size={14} />
            View all
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            You haven&apos;t posted any jobs yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {jobs.map((job) => (
              <li key={job._id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{job.title}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboardPage;
