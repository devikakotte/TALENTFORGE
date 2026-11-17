import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useSavedJobs, useUnsaveJob } from '../../hooks/useSavedJobs';
import LoadingScreen from '../../components/common/LoadingScreen';
import JobCard from '../../components/jobs/JobCard';
import { ROUTES } from '../../constants';

function CandidateSavedJobsPage() {
  const { data, isLoading } = useSavedJobs();
  const unsaveJob = useUnsaveJob();

  if (isLoading) return <LoadingScreen label="Loading your saved jobs..." />;

  const savedJobs = (data?.savedJobs || []).filter((entry) => entry.job);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Saved jobs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Jobs you&apos;ve bookmarked to review later.
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          No saved jobs yet.{' '}
          <Link to={ROUTES.JOBS} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {savedJobs.map((entry) => (
            <div key={entry._id} className="relative">
              <JobCard job={entry.job} />
              <button
                type="button"
                onClick={() => unsaveJob.mutate(entry.job._id)}
                aria-label="Remove from saved jobs"
                className="absolute right-3 top-3 rounded-full bg-white p-1.5 text-brand-600 shadow-sm hover:bg-brand-50 dark:bg-slate-900 dark:text-brand-400 dark:hover:bg-slate-800"
                disabled={unsaveJob.isPending}
              >
                <Bookmark size={16} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidateSavedJobsPage;
