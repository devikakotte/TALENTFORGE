import { Sparkles } from 'lucide-react';
import { useGenerateCareerSuggestions, useSavedCareerSuggestions } from '../../hooks/useAi';
import LoadingScreen from '../../components/common/LoadingScreen';

function CandidateCareerSuggestionsPage() {
  const { data: saved, isLoading } = useSavedCareerSuggestions();
  const generate = useGenerateCareerSuggestions();

  const suggestions = generate.data || saved;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
          <Sparkles size={22} className="text-brand-600 dark:text-brand-400" />
          Career suggestions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI-generated next steps based on your profile.
        </p>
      </div>

      <div className="card">
        <button
          type="button"
          onClick={() => generate.mutate()}
          className="btn-primary"
          disabled={generate.isPending}
        >
          {generate.isPending ? 'Thinking...' : suggestions ? 'Regenerate' : 'Get suggestions'}
        </button>
      </div>

      {isLoading ? (
        <LoadingScreen label="Loading suggestions..." />
      ) : suggestions ? (
        <div className="card">
          <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
            {suggestions.content}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Generated {new Date(suggestions.generatedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          No suggestions yet — click the button above to generate some.
        </div>
      )}
    </div>
  );
}

export default CandidateCareerSuggestionsPage;
