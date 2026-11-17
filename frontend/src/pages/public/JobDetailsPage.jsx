import { useParams } from 'react-router-dom';
import { Building2, Calendar, MapPin } from 'lucide-react';
import { useJobDetails } from '../../hooks/usePublicJobs';
import LoadingScreen from '../../components/common/LoadingScreen';
import JobCard from '../../components/jobs/JobCard';
import JobApplyAction from '../../components/jobs/JobApplyAction';
import InterviewPrepPanel from '../../components/jobs/InterviewPrepPanel';
import NotFoundPage from './NotFoundPage';

function formatSalaryRange(job) {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.currency || 'USD';
  if (job.salaryMin && job.salaryMax) {
    return `${currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
  }
  return `${currency} ${(job.salaryMin || job.salaryMax).toLocaleString()}+`;
}

function JobDetailsPage() {
  const { jobId } = useParams();
  const { data, isLoading, isError } = useJobDetails(jobId);

  if (isLoading) return <LoadingScreen label="Loading job details..." />;
  if (isError || !data?.job) return <NotFoundPage />;

  const { job, relatedJobs } = data;
  const salaryRange = formatSalaryRange(job);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            {job.company?.logo?.url ? (
              <img src={job.company.logo.url} alt={job.company.companyName} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="text-slate-400" size={26} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{job.title}</h1>
            <p className="text-slate-500 dark:text-slate-400">{job.company?.companyName}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium capitalize text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {job.jobType.replace('-', ' ')}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {job.experienceLevel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {job.category.replace('-', ' ')}
          </span>
          {job.isRemote && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Remote
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={15} />
              {job.location}
            </span>
          )}
          {salaryRange && <span>{salaryRange}</span>}
          {job.applicationDeadline && (
            <span className="flex items-center gap-1.5">
              <Calendar size={15} />
              Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
          <JobApplyAction jobId={job._id} />
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Description</h2>
        <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{job.description}</p>
      </div>

      {job.responsibilities?.length > 0 && (
        <div className="card mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Responsibilities</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {job.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {job.requirements?.length > 0 && (
        <div className="card mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Requirements</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {job.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {job.skills?.length > 0 && (
        <div className="card mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {job.company?.description && (
        <div className="card mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
            About {job.company.companyName}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{job.company.description}</p>
        </div>
      )}

      <InterviewPrepPanel jobId={job._id} />

      {relatedJobs?.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Related jobs</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedJobs.map((relatedJob) => (
              <JobCard key={relatedJob._id} job={relatedJob} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default JobDetailsPage;
