import { useState } from 'react';
import { Building2, ShieldCheck } from 'lucide-react';
import { useAdminCompanies, useUnverifyCompany, useVerifyCompany } from '../../hooks/useAdmin';
import LoadingScreen from '../../components/common/LoadingScreen';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Unverified' },
];

function AdminCompaniesPage() {
  const [isVerified, setIsVerified] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminCompanies({ isVerified: isVerified || undefined, search: search || undefined });
  const verifyCompany = useVerifyCompany();
  const unverifyCompany = useUnverifyCompany();

  const companies = data?.companies || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Company verification</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Verified companies get a trust badge visible to candidates.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search company name"
          className="input-field max-w-xs"
        />
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setIsVerified(filter.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isVerified === filter.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingScreen label="Loading companies..." />
      ) : companies.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">No companies found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {companies.map((company) => (
            <div key={company._id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  {company.logo?.url ? (
                    <img src={company.logo.url} alt={company.companyName} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="text-slate-400" size={20} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-slate-50">{company.companyName}</p>
                    {company.isVerified && (
                      <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{company.owner?.email}</p>
                </div>
              </div>

              {company.isVerified ? (
                <button
                  type="button"
                  onClick={() => unverifyCompany.mutate(company._id)}
                  className="btn-secondary text-sm"
                  disabled={unverifyCompany.isPending}
                >
                  Revoke verification
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => verifyCompany.mutate(company._id)}
                  className="btn-primary text-sm"
                  disabled={verifyCompany.isPending}
                >
                  Verify
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCompaniesPage;
