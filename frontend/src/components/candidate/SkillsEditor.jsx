import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { ROUTES } from '../../constants';

function SkillsEditor({ skills, verifiedSkills = [], onChange, isSaving }) {
  const [draft, setDraft] = useState('');

  const isVerified = (skill) =>
    verifiedSkills.some((verified) => verified.toLowerCase() === skill.toLowerCase());

  const addSkill = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (skills.some((skill) => skill.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...skills, trimmed]);
    setDraft('');
  };

  const removeSkill = (skillToRemove) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="card">
      <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Skills</h2>
      <div className="mb-3 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
              isVerified(skill)
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
            }`}
          >
            {isVerified(skill) && <ShieldCheck size={12} aria-label="Verified" />}
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              aria-label={`Remove ${skill}`}
              className="text-current opacity-70 hover:opacity-100"
            >
              <X size={13} />
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">No skills added yet.</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill and press Enter"
          className="input-field"
          disabled={isSaving}
        />
        <button type="button" onClick={addSkill} className="btn-secondary" disabled={isSaving}>
          Add
        </button>
      </div>
      {skills.length > 0 && (
        <Link
          to={`${ROUTES.CANDIDATE_DASHBOARD}/skill-verification`}
          className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Verify a skill with an AI quiz →
        </Link>
      )}
    </div>
  );
}

export default SkillsEditor;
