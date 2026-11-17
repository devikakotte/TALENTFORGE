import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useJobRecommendations } from '../../hooks/useAi';
import LoadingScreen from '../../components/common/LoadingScreen';
import { ROUTES } from '../../constants';

function CandidateRecommendationsPage() {
  const { data: recommendations, isLoading, isError, error } = useJobRecommendations(8);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
          <Sparkles size={22} className="text-brand-600 dark:text-brand-400" />
          Recommended for you
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Open jobs matched to the skills on your profile.
        </p>
      </div>

      {isLoading ? (
        <LoadingScreen label="Finding matches..." />
      ) : isError ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          {error.response?.data?.message || 'Could not load recommendations right now.'}
        </div>
      ) : recommendations?.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          No matching jobs yet — try adding more skills to your{' '}
          <Link to={`${ROUTES.CANDIDATE_DASHBOARD}/profile`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            profile
          </Link>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recommendations.map((rec) => (
            <Link
              key={rec.job._id}
              to={ROUTES.JOB_DETAILS.replace(':jobId', rec.job._id)}
              className="card flex flex-col gap-2 hover:border-brand-300 dark:hover:border-brand-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{rec.job.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {rec.job.company?.companyName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {rec.matchScore}% match
                </span>
              </div>
              {rec.whyItFits && (
                <p className="text-sm italic text-slate-600 dark:text-slate-300">
                  &quot;{rec.whyItFits}&quot;
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {rec.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidateRecommendationsPage;
