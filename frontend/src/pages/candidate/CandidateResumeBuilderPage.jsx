import { useState } from 'react';
import { Copy, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGenerateResumeDraft } from '../../hooks/useAi';

function CandidateResumeBuilderPage() {
  const [draft, setDraft] = useState(null);
  const generateDraft = useGenerateResumeDraft();

  const handleGenerate = () => {
    generateDraft.mutate(undefined, {
      onSuccess: (result) => setDraft(result),
    });
  };

  const handleCopy = async () => {
    if (!draft?.draft) return;
    await navigator.clipboard.writeText(draft.draft);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
          <Sparkles size={22} className="text-brand-600 dark:text-brand-400" />
          AI resume builder
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generates a draft resume from your profile — headline, skills, experience, and education.
        </p>
      </div>

      <div className="card">
        <button
          type="button"
          onClick={handleGenerate}
          className="btn-primary"
          disabled={generateDraft.isPending}
        >
          {generateDraft.isPending
            ? 'Generating...'
            : draft
              ? 'Regenerate draft'
              : 'Generate resume draft'}
        </button>
        <p className="mt-2 text-xs text-slate-400">
          Uses your profile data only — keep your profile up to date for the best result.
        </p>
      </div>

      {draft?.draft && (
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Draft</h2>
            <button type="button" onClick={handleCopy} className="btn-secondary gap-1.5 text-sm">
              <Copy size={14} />
              Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
            {draft.draft}
          </pre>
        </div>
      )}
    </div>
  );
}

export default CandidateResumeBuilderPage;
