import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useCandidateProfile } from '../../hooks/useCandidateProfile';
import { useGenerateSkillQuiz, useSubmitSkillQuiz } from '../../hooks/useAi';
import LoadingScreen from '../../components/common/LoadingScreen';

function CandidateSkillVerificationPage() {
  const { data: profile, isLoading } = useCandidateProfile();
  const generateQuiz = useGenerateSkillQuiz();
  const submitQuiz = useSubmitSkillQuiz();

  const [selectedSkill, setSelectedSkill] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  if (isLoading) return <LoadingScreen label="Loading your skills..." />;

  const verifiedSet = new Set((profile?.verifiedSkills || []).map((s) => s.toLowerCase()));
  const unverifiedSkills = (profile?.skills || []).filter((skill) => !verifiedSet.has(skill.toLowerCase()));

  const quiz = generateQuiz.data;

  const startQuiz = (skill) => {
    setSelectedSkill(skill);
    setAnswers({});
    setResult(null);
    generateQuiz.mutate(skill);
  };

  const handleSubmit = () => {
    const orderedAnswers = quiz.questions.map((_, i) => answers[i]);
    submitQuiz.mutate(
      { quizId: quiz.quizId, answers: orderedAnswers },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const allAnswered = quiz && quiz.questions.every((_, i) => answers[i] !== undefined);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
          <ShieldCheck size={22} className="text-brand-600 dark:text-brand-400" />
          Skill verification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pass a short AI-generated quiz to earn a verified badge recruiters can see — a real signal
          beyond a self-reported skill tag.
        </p>
      </div>

      {!quiz && !result && (
        <div className="card">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Pick a skill to verify
          </h2>
          {unverifiedSkills.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {(profile?.skills || []).length === 0
                ? 'Add some skills to your profile first.'
                : "You've verified every skill on your profile already. Nice."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unverifiedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => startQuiz(skill)}
                  className="btn-secondary text-sm"
                  disabled={generateQuiz.isPending}
                >
                  {generateQuiz.isPending && selectedSkill === skill ? 'Generating...' : `Verify ${skill}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {quiz && !result && (
        <div className="card flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {quiz.skill} — {quiz.questions.length} questions
          </h2>
          {quiz.questions.map((question, qIndex) => (
            <div key={question.question} className="flex flex-col gap-2">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {qIndex + 1}. {question.question}
              </p>
              <div className="flex flex-col gap-1.5">
                {question.options.map((option, optIndex) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={answers[qIndex] === optIndex}
                      onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
              disabled={!allAnswered || submitQuiz.isPending}
            >
              {submitQuiz.isPending ? 'Grading...' : 'Submit answers'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="card flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {result.passed ? `🎉 ${result.skill} verified!` : `Scored ${Math.round(result.score * 100)}%`}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {result.correctCount} of {result.totalQuestions} correct.{' '}
            {result.passed
              ? 'This skill now shows a verified badge on your profile.'
              : 'You need 70% to earn the badge — you can try again anytime.'}
          </p>
          <div>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                generateQuiz.reset();
              }}
              className="btn-secondary text-sm"
            >
              Verify another skill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateSkillVerificationPage;
