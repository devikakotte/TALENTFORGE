import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInterviewPrep } from '../../hooks/useAi';
import { USER_ROLES } from '../../constants';

function InterviewPrepPanel({ jobId }) {
  const { isAuthenticated, user } = useAuth();
  const [hasRequested, setHasRequested] = useState(false);
  const { data: prep, isLoading, isError, error } = useInterviewPrep(jobId, {
    enabled: hasRequested,
  });

  if (!isAuthenticated || user?.role !== USER_ROLES.CANDIDATE) {
    return null;
  }

  return (
    <div className="card mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50">
          <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
          Interview preparation
        </h2>
        {!hasRequested && (
          <button type="button" onClick={() => setHasRequested(true)} className="btn-secondary text-sm">
            Generate prep
          </button>
        )}
      </div>

      {!hasRequested ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Get AI-generated practice questions tailored to this role and your background.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">Generating questions...</p>
      ) : isError ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          {error.response?.data?.message || 'Could not generate interview prep right now.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {prep?.questions?.map((item) => (
            <li key={item.question} className="border-l-2 border-brand-200 pl-3 dark:border-brand-900">
              <p className="font-medium text-slate-900 dark:text-slate-50">{item.question}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.tip}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default InterviewPrepPanel;
