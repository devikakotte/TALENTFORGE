import { Link } from 'react-router-dom';
import { useMyApplications, useWithdrawApplication } from '../../hooks/useApplications';
import LoadingScreen from '../../components/common/LoadingScreen';
import { ROUTES } from '../../constants';

const STATUS_STYLES = {
  applied: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  shortlisted: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  hired: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  withdrawn: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
};

const WITHDRAWABLE_STATUSES = ['applied', 'shortlisted'];

function CandidateApplicationsPage() {
  const { data, isLoading } = useMyApplications();
  const withdrawApplication = useWithdrawApplication();

  if (isLoading) return <LoadingScreen label="Loading your applications..." />;

  const applications = data?.applications || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Applied jobs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track the status of every job you&apos;ve applied to.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          You haven&apos;t applied to any jobs yet.{' '}
          <Link to={ROUTES.JOBS} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <div key={application._id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={ROUTES.JOB_DETAILS.replace(':jobId', application.job._id)}
                  className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                >
                  {application.job.title}
                </Link>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {application.job.company?.companyName}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Applied {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    STATUS_STYLES[application.status] || STATUS_STYLES.applied
                  }`}
                >
                  {application.status}
                </span>
                {WITHDRAWABLE_STATUSES.includes(application.status) && (
                  <button
                    type="button"
                    onClick={() => withdrawApplication.mutate(application._id)}
                    className="btn-secondary text-sm"
                    disabled={withdrawApplication.isPending}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidateApplicationsPage;
