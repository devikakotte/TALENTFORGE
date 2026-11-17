import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { ROUTES } from '../../constants';

function formatSalaryRange(job) {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.currency || 'USD';
  if (job.salaryMin && job.salaryMax) {
    return `${currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
  }
  return `${currency} ${(job.salaryMin || job.salaryMax).toLocaleString()}+`;
}

function JobCard({ job }) {
  const jobDetailsPath = ROUTES.JOB_DETAILS.replace(':jobId', job._id);
  const salaryRange = formatSalaryRange(job);

  return (
    <Link to={jobDetailsPath} className="card flex flex-col gap-3 hover:border-brand-300 dark:hover:border-brand-700">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
          {job.company?.logo?.url ? (
            <img src={job.company.logo.url} alt={job.company.companyName} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="text-slate-400" size={20} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900 dark:text-slate-50">{job.title}</p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {job.company?.companyName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 font-medium capitalize text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {job.jobType.replace('-', ' ')}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {job.experienceLevel}
        </span>
        {job.isRemote && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Remote
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {job.location}
          </span>
        )}
        {salaryRange && <span>{salaryRange}</span>}
      </div>
    </Link>
  );
}

export default JobCard;
