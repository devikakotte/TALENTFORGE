import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCloseJob, useDeleteJob, useMyJobs, usePublishJob } from '../../hooks/useJobs';
import LoadingScreen from '../../components/common/LoadingScreen';
import JobStatusBadge from '../../components/recruiter/JobStatusBadge';
import { ROUTES } from '../../constants';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

function RecruiterJobsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyJobs({ status: status || undefined, page, limit: 10 });
  const publishJob = usePublishJob();
  const closeJob = useCloseJob();
  const deleteJob = useDeleteJob();

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Manage jobs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, publish, and track your job postings.
          </p>
        </div>
        <Link to={`${ROUTES.RECRUITER_DASHBOARD}/jobs/new`} className="btn-primary gap-1.5">
          <Plus size={16} />
          New job
        </Link>
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
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
        <LoadingScreen label="Loading your jobs..." />
      ) : jobs.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          No jobs found for this filter.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <div key={job._id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-medium text-slate-900 dark:text-slate-50">{job.title}</p>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
                  {job.jobType.replace('-', ' ')} · {job.location || 'Remote'}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  to={`${ROUTES.RECRUITER_DASHBOARD}/jobs/${job._id}/applicants`}
                  className="btn-secondary text-sm"
                >
                  Applicants ({job.applicationsCount || 0})
                </Link>
                <Link
                  to={`${ROUTES.RECRUITER_DASHBOARD}/jobs/${job._id}/edit`}
                  className="btn-secondary gap-1.5 text-sm"
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                {job.status !== 'open' && job.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => publishJob.mutate(job._id)}
                    className="btn-primary text-sm"
                    disabled={publishJob.isPending}
                  >
                    Publish
                  </button>
                )}
                {job.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => closeJob.mutate(job._id)}
                    className="btn-secondary text-sm"
                    disabled={closeJob.isPending}
                  >
                    Close
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteJob.mutate(job._id)}
                  className="btn-secondary gap-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  disabled={deleteJob.isPending}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="btn-secondary text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            disabled={page >= pagination.totalPages}
            className="btn-secondary text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default RecruiterJobsPage;
