import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, Sparkles } from 'lucide-react';
import { useApplicantsForJob, useUpdateApplicationStatus } from '../../hooks/useApplications';
import { useMyJob } from '../../hooks/useJobs';
import LoadingScreen from '../../components/common/LoadingScreen';
import { ROUTES } from '../../constants';
import { useCandidateRanking } from '../../hooks/useAi';

const STATUS_STYLES = {
  applied: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  shortlisted: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  hired: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  withdrawn: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
};

const NEXT_ACTIONS = {
  applied: [
    { status: 'shortlisted', label: 'Shortlist', style: 'btn-primary' },
    { status: 'rejected', label: 'Reject', style: 'btn-secondary text-red-600 hover:bg-red-50 dark:text-red-400' },
  ],
  shortlisted: [
    { status: 'hired', label: 'Hire', style: 'btn-primary' },
    { status: 'rejected', label: 'Reject', style: 'btn-secondary text-red-600 hover:bg-red-50 dark:text-red-400' },
  ],
  rejected: [],
  hired: [],
  withdrawn: [],
};

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
];

function RecruiterApplicantsPage() {
  const { jobId } = useParams();
  const [status, setStatus] = useState('');
  const { data: job, isLoading: isJobLoading } = useMyJob(jobId);
  const { data, isLoading: isApplicantsLoading } = useApplicantsForJob(jobId, {
    status: status || undefined,
  });
  const updateStatus = useUpdateApplicationStatus(jobId);
  const ranking = useCandidateRanking(jobId, { enabled: false });

  if (isJobLoading || isApplicantsLoading) {
    return <LoadingScreen label="Loading applicants..." />;
  }

  const applications = data?.applications || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to={`${ROUTES.RECRUITER_DASHBOARD}/jobs`}
          className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          <ArrowLeft size={14} />
          Back to jobs
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Applicants</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{job?.title}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" onClick={() => ranking.refetch()} disabled={ranking.isFetching}>
          <BrainCircuit size={16}/>{ranking.isFetching ? 'AI ranking...' : 'Rank with AI'}
        </button>
        <span className="text-xs text-slate-500">Advisory ranking — recruiter review remains required.</span>
      </div>

      {ranking.data?.candidates?.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2"><Sparkles size={17} className="text-cyan-300"/><h2 className="font-bold">AI candidate signal</h2></div>
          <div className="grid gap-3 md:grid-cols-2">
            {ranking.data.candidates.slice(0,6).map((candidate, index) => (
              <div key={candidate.applicationId} className="rounded-xl border bg-white/[.03] p-4 dark:border-white/10">
                <div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{index + 1}. {candidate.candidate?.fullName}</p><p className="text-xs text-slate-500">{candidate.status}</p></div><span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-bold text-violet-300">{candidate.score}% fit</span></div>
                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{candidate.explanation}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{candidate.matchedSkills.map(skill=><span key={skill} className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">{skill}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
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

      {applications.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          No applicants for this filter yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <div key={application._id} className="card flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    {application.candidate?.fullName}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[application.status] || STATUS_STYLES.applied
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{application.candidate?.email}</p>
                {application.coverLetter && (
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                    {application.coverLetter}
                  </p>
                )}
                {application.resumeSnapshot?.url && (
                  <a
                    href={application.resumeSnapshot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    View resume
                  </a>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                {(NEXT_ACTIONS[application.status] || []).map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    onClick={() =>
                      updateStatus.mutate({ applicationId: application._id, status: action.status })
                    }
                    className={`${action.style} text-sm`}
                    disabled={updateStatus.isPending}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecruiterApplicantsPage;
