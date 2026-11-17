import { useState } from 'react';
import { Search, ShieldCheck, User } from 'lucide-react';
import { useTalentSearch } from '../../hooks/useCompanyProfile';
import LoadingScreen from '../../components/common/LoadingScreen';

function RecruiterTalentSearchPage() {
  const [skillsDraft, setSkillsDraft] = useState('');
  const [locationDraft, setLocationDraft] = useState('');
  const [filters, setFilters] = useState({ page: 1, limit: 12 });

  const { data, isLoading, isFetching } = useTalentSearch(filters);
  const candidates = data?.candidates || [];
  const pagination = data?.pagination;

  const handleSearch = (event) => {
    event.preventDefault();
    setFilters((prev) => ({
      ...prev,
      skills: skillsDraft || undefined,
      location: locationDraft || undefined,
      page: 1,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Talent search</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Proactively find candidates who&apos;ve opted in to being discovered — no job posting required.
        </p>
      </div>

      <form onSubmit={handleSearch} className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={skillsDraft}
            onChange={(event) => setSkillsDraft(event.target.value)}
            placeholder="Skills, comma-separated (e.g. React, Node.js)"
            className="input-field pl-9"
          />
        </div>
        <input
          type="text"
          value={locationDraft}
          onChange={(event) => setLocationDraft(event.target.value)}
          placeholder="Location"
          className="input-field flex-1 min-w-[150px]"
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {isLoading ? (
        <LoadingScreen label="Searching candidates..." />
      ) : candidates.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          No discoverable candidates match your search yet.
        </div>
      ) : (
        <div className={`grid gap-4 sm:grid-cols-2 ${isFetching ? 'opacity-60' : ''}`}>
          {candidates.map((candidate) => (
            <div key={candidate._id} className="card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  {candidate.profilePhoto?.url ? (
                    <img
                      src={candidate.profilePhoto.url}
                      alt={candidate.user?.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="text-slate-400" size={20} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-50">
                    {candidate.user?.fullName}
                  </p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{candidate.headline}</p>
                </div>
              </div>

              {candidate.location && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{candidate.location}</p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {(candidate.skills || []).slice(0, 8).map((skill) => {
                  const isVerified = (candidate.verifiedSkills || []).some(
                    (v) => v.toLowerCase() === skill.toLowerCase(),
                  );
                  return (
                    <span
                      key={skill}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isVerified && <ShieldCheck size={11} />}
                      {skill}
                    </span>
                  );
                })}
              </div>

              {candidate.resume?.url && (
                <a
                  href={candidate.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  View resume
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={filters.page <= 1}
            className="btn-secondary text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))
            }
            disabled={filters.page >= pagination.totalPages}
            className="btn-secondary text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default RecruiterTalentSearchPage;
