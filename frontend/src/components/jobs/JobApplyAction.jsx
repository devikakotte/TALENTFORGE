import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApplyToJob } from '../../hooks/useApplications';
import { useSaveJob, useSavedJobs, useUnsaveJob } from '../../hooks/useSavedJobs';
import { ROUTES, USER_ROLES } from '../../constants';

function JobApplyAction({ jobId }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [showCoverLetterForm, setShowCoverLetterForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const applyToJob = useApplyToJob();
  const isCandidate = user?.role === USER_ROLES.CANDIDATE;
  const { data: savedJobsData } = useSavedJobs({}, { enabled: isAuthenticated && isCandidate });
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  const isSaved = (savedJobsData?.savedJobs || []).some((entry) => entry.job?._id === jobId);
  const hasApplied = applyToJob.isSuccess;

  if (!isAuthenticated) {
    return (
      <Link to={ROUTES.LOGIN} state={{ from: location }} className="btn-primary">
        Log in to apply
      </Link>
    );
  }

  if (!isCandidate) {
    return (
      <p className="text-sm text-slate-400">Only candidate accounts can apply to jobs.</p>
    );
  }

  const handleApply = () => {
    applyToJob.mutate(
      { jobId, coverLetter },
      { onSuccess: () => setShowCoverLetterForm(false) },
    );
  };

  const toggleSave = () => {
    if (isSaved) unsaveJob.mutate(jobId);
    else saveJob.mutate(jobId);
  };

  return (
    <div className="flex flex-col gap-3">
      {hasApplied ? (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          You&apos;ve applied to this job.
        </p>
      ) : showCoverLetterForm ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={coverLetter}
            onChange={(event) => setCoverLetter(event.target.value)}
            placeholder="Add a cover letter (optional)"
            rows={4}
            className="input-field"
            maxLength={5000}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary"
              disabled={applyToJob.isPending}
            >
              {applyToJob.isPending ? 'Submitting...' : 'Submit application'}
            </button>
            <button type="button" onClick={() => setShowCoverLetterForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowCoverLetterForm(true)} className="btn-primary">
            Apply now
          </button>
          <button
            type="button"
            onClick={toggleSave}
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isSaved
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            disabled={saveJob.isPending || unsaveJob.isPending}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

export default JobApplyAction;
