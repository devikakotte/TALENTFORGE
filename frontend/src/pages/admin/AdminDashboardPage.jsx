import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Briefcase, Building2, ShieldCheck, Users } from 'lucide-react';
import { usePlatformAnalytics } from '../../hooks/useAdmin';
import LoadingScreen from '../../components/common/LoadingScreen';

const JOB_STATUS_COLORS = { draft: '#94a3b8', open: '#10b981', closed: '#ef4444' };
const APPLICATION_STATUS_LABELS = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
  withdrawn: 'Withdrawn',
};

function AdminDashboardPage() {
  const { data: analytics, isLoading } = usePlatformAnalytics();

  if (isLoading) return <LoadingScreen label="Loading platform analytics..." />;

  const jobStatusData = Object.entries(analytics?.jobsByStatus || {}).map(([status, count]) => ({
    name: status,
    value: count,
    status,
  }));
  const applicationStatusData = Object.entries(analytics?.applicationsByStatus || {}).map(
    ([status, count]) => ({ status: APPLICATION_STATUS_LABELS[status] || status, count }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Admin dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Platform-wide overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Users size={14} /> Total users
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {analytics?.totalUsers || 0}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {analytics?.usersByRole?.candidate || 0} candidates ·{' '}
            {analytics?.usersByRole?.recruiter || 0} recruiters
          </p>
        </div>
        <div className="card">
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Building2 size={14} /> Companies
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {analytics?.totalCompanies || 0}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={12} /> {analytics?.companiesByVerification?.verified || 0} verified
          </p>
        </div>
        <div className="card">
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Briefcase size={14} /> Total jobs
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {analytics?.totalJobs || 0}
          </p>
          <p className="mt-1 text-xs text-slate-400">{analytics?.jobsByStatus?.open || 0} open</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total applications</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {analytics?.totalApplications || 0}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {analytics?.applicationsByStatus?.hired || 0} hired
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Jobs by status</h2>
          <div className="flex items-center gap-4">
            <div className="h-52 w-52 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={jobStatusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                    {jobStatusData.map((entry) => (
                      <Cell key={entry.status} fill={JOB_STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-2">
              {jobStatusData.map((entry) => (
                <li key={entry.status} className="flex items-center gap-2 text-sm capitalize text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: JOB_STATUS_COLORS[entry.status] || '#94a3b8' }}
                  />
                  {entry.name}: {entry.value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Applications by status
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationStatusData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
