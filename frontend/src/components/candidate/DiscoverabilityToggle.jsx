import { Eye, EyeOff } from 'lucide-react';
import { useUpdateProfile } from '../../hooks/useCandidateProfile';

function DiscoverabilityToggle({ isDiscoverable }) {
  const updateProfile = useUpdateProfile();

  const handleToggle = () => {
    updateProfile.mutate({ isDiscoverable: !isDiscoverable });
  };

  return (
    <div className="card flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        {isDiscoverable ? (
          <Eye className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400" size={20} />
        ) : (
          <EyeOff className="mt-0.5 shrink-0 text-slate-400" size={20} />
        )}
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-50">Visible to recruiters</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            When on, recruiters can find your profile in Talent Search — even for jobs you haven&apos;t
            applied to. Requires a headline to be set.
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isDiscoverable}
        onClick={handleToggle}
        disabled={updateProfile.isPending}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          isDiscoverable ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            isDiscoverable ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default DiscoverabilityToggle;
