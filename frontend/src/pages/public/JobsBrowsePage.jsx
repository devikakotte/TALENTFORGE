import { useState } from 'react';
import { Search } from 'lucide-react';
import { useBrowseJobs } from '../../hooks/usePublicJobs';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import LoadingScreen from '../../components/common/LoadingScreen';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'salaryHigh', label: 'Salary: High to low' },
  { value: 'salaryLow', label: 'Salary: Low to high' },
];

function JobsBrowsePage() {
  const [filters, setFilters] = useState({ page: 1, limit: 12, sort: 'newest' });
  const [searchDraft, setSearchDraft] = useState('');
  const { data, isLoading, isFetching } = useBrowseJobs(filters);

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchDraft || undefined, page: 1 }));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Browse jobs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pagination ? `${pagination.total} open positions` : 'Find your next opportunity'}
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search job titles, skills, or keywords"
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <JobFilters filters={filters} onChange={setFilters} />

        <div>
          <div className="mb-4 flex justify-end">
            <select
              value={filters.sort}
              onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value, page: 1 }))}
              className="input-field w-auto"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <LoadingScreen label="Loading jobs..." />
          ) : jobs.length === 0 ? (
            <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
              No jobs match your filters. Try broadening your search.
            </div>
          ) : (
            <div className={`grid gap-4 sm:grid-cols-2 ${isFetching ? 'opacity-60' : ''}`}>
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
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
      </div>
    </section>
  );
}

export default JobsBrowsePage;
