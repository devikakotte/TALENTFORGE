import { useState } from 'react';
import { useAdminUsers, useSetUserActiveStatus } from '../../hooks/useAdmin';
import LoadingScreen from '../../components/common/LoadingScreen';

const ROLE_FILTERS = [
  { value: '', label: 'All roles' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'recruiter', label: 'Recruiters' },
  { value: 'admin', label: 'Admins' },
];

function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers({ search: search || undefined, role: role || undefined, page, limit: 20 });
  const setActiveStatus = useSetUserActiveStatus();

  const users = data?.users || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">User management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search, filter, and activate or deactivate accounts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
          className="input-field max-w-xs"
        />
        <select
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          {ROLE_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingScreen label="Loading users..." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-50">{user.fullName}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">{user.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStatus.mutate({ userId: user._id, isActive: !user.isActive })
                        }
                        className="btn-secondary text-xs"
                        disabled={setActiveStatus.isPending}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="btn-secondary text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            disabled={page >= pagination.totalPages}
            className="btn-secondary text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
