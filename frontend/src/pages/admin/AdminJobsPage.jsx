import { useState } from 'react';
import { useAdminJobs, useDeleteJobAsAdmin, useModerateCloseJob } from '../../hooks/useAdmin';
import LoadingScreen from '../../components/common/LoadingScreen';
import JobStatusBadge from '../../components/recruiter/JobStatusBadge';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

function AdminJobsPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminJobs({ status: status || undefined, search: search || undefined });
  const closeJob = useModerateCloseJob();
  const deleteJob = useDeleteJobAsAdmin();

  const jobs = data?.jobs || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Job moderation</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review and moderate every job posted on the platform.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search job title"
          className="input-field max-w-xs"
        />
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              status === filter.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingScreen label="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">No jobs found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div key={job._id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-medium text-slate-900 dark:text-slate-50">{job.title}</p>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {job.company?.companyName} · Posted by {job.recruiter?.fullName} ({job.recruiter?.email})
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {job.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => closeJob.mutate(job._id)}
                    className="btn-secondary text-sm"
                    disabled={closeJob.isPending}
                  >
                    Force close
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteJob.mutate(job._id)}
                  className="btn-secondary text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  disabled={deleteJob.isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminJobsPage;
