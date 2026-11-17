const CATEGORIES = [
  'engineering',
  'design',
  'product',
  'marketing',
  'sales',
  'customer-support',
  'operations',
  'finance',
  'hr',
  'other',
];
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];

function JobFilters({ filters, onChange }) {
  const update = (patch) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <div className="card flex flex-col gap-5">
      <div>
        <label htmlFor="filter-location" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Location
        </label>
        <input
          id="filter-location"
          type="text"
          value={filters.location || ''}
          onChange={(event) => update({ location: event.target.value })}
          placeholder="City or country"
          className="input-field"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          className="rounded"
          checked={filters.isRemote === 'true'}
          onChange={(event) => update({ isRemote: event.target.checked ? 'true' : undefined })}
        />
        Remote only
      </label>

      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Category</p>
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 text-sm capitalize text-slate-600 dark:text-slate-300">
              <input
                type="radio"
                name="category"
                className="rounded"
                checked={filters.category === category}
                onChange={() => update({ category })}
              />
              {category.replace('-', ' ')}
            </label>
          ))}
          <button
            type="button"
            onClick={() => update({ category: undefined })}
            className="mt-1 text-left text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Clear category
          </button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Job type</p>
        <div className="flex flex-col gap-1.5">
          {JOB_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm capitalize text-slate-600 dark:text-slate-300">
              <input
                type="radio"
                name="jobType"
                className="rounded"
                checked={filters.jobType === type}
                onChange={() => update({ jobType: type })}
              />
              {type.replace('-', ' ')}
            </label>
          ))}
          <button
            type="button"
            onClick={() => update({ jobType: undefined })}
            className="mt-1 text-left text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Clear job type
          </button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Experience</p>
        <div className="flex flex-col gap-1.5">
          {EXPERIENCE_LEVELS.map((level) => (
            <label key={level} className="flex items-center gap-2 text-sm capitalize text-slate-600 dark:text-slate-300">
              <input
                type="radio"
                name="experienceLevel"
                className="rounded"
                checked={filters.experienceLevel === level}
                onChange={() => update({ experienceLevel: level })}
              />
              {level}
            </label>
          ))}
          <button
            type="button"
            onClick={() => update({ experienceLevel: undefined })}
            className="mt-1 text-left text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Clear experience
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobFilters;
