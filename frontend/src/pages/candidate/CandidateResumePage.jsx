import { useRef, useState } from 'react';
import { FileText, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCandidateProfile,
  useDeleteResume,
  useUploadResume,
} from '../../hooks/useCandidateProfile';
import { useAnalyzeResume, useSavedResumeAnalysis, useAtsScore, useParseResume } from '../../hooks/useAi';
import LoadingScreen from '../../components/common/LoadingScreen';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

function CandidateResumePage() {
  const { data: profile, isLoading } = useCandidateProfile();
  const uploadResume = useUploadResume();
  const deleteResume = useDeleteResume();
  const fileInputRef = useRef(null);
  const { data: analysis, isLoading: isAnalysisLoading } = useSavedResumeAnalysis();
  const analyzeResume = useAnalyzeResume();
  const ats = useAtsScore();
  const [jobDescription, setJobDescription] = useState('');
  const parseResume = useParseResume();

  if (isLoading) return <LoadingScreen label="Loading your resume..." />;

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File must be under 5MB');
      return;
    }
    uploadResume.mutate(file);
  };

  const resume = profile?.resume;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Resume</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload the resume recruiters will see when you apply to jobs.
        </p>
      </div>

      <div className="card">
        {resume?.url ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <FileText className="text-brand-600 dark:text-brand-400" size={28} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-slate-50">
                  {resume.originalFileName}
                </p>
                <p className="text-xs text-slate-400">
                  Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary shrink-0 text-sm"
              >
                Preview
              </a>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary gap-1.5 text-sm"
                disabled={uploadResume.isPending}
              >
                <UploadCloud size={16} />
                {uploadResume.isPending ? 'Uploading...' : 'Replace resume'}
              </button>
              <button
                type="button"
                onClick={() => parseResume.mutate()}
                className="btn-secondary gap-1.5 text-sm"
                disabled={parseResume.isPending}
              >
                <Sparkles size={16} />
                {parseResume.isPending ? 'Extracting...' : 'Extract profile with AI'}
              </button>
              <button
                type="button"
                onClick={() => deleteResume.mutate()}
                className="btn-secondary gap-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                disabled={deleteResume.isPending}
              >
                <Trash2 size={16} />
                {deleteResume.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
            <UploadCloud className="text-slate-400" size={32} />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              PDF or Word document, up to 5MB
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
              disabled={uploadResume.isPending}
            >
              {uploadResume.isPending ? 'Uploading...' : 'Upload resume'}
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {parseResume.data && (
        <div className="card">
          <div className="mb-4 flex items-center gap-2"><Sparkles size={17} className="text-cyan-300"/><div><p className="eyebrow">AI extraction</p><h2 className="font-bold">Resume profile signal</h2></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-xs text-slate-500">Headline</p><p className="mt-1 text-sm font-semibold">{parseResume.data.headline || 'Not detected'}</p></div>
            <div><p className="text-xs text-slate-500">Skills</p><div className="mt-1 flex flex-wrap gap-1.5">{(parseResume.data.skills||[]).slice(0,10).map(s=><span key={s} className="rounded-full bg-violet-500/10 px-2 py-1 text-xs">{s}</span>)}</div></div>
            <div><p className="text-xs text-slate-500">Experience</p><p className="mt-1 text-sm">{parseResume.data.experience?.length || 0} entries detected</p></div>
            <div><p className="text-xs text-slate-500">Projects</p><p className="mt-1 text-sm">{parseResume.data.projects?.length || 0} entries detected</p></div>
          </div>
          <p className="mt-4 text-xs text-amber-400">Review extracted information before saving it to your profile.</p>
        </div>
      )}

      {resume?.url && (
        <div className="card">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div><p className="eyebrow">Job-specific ATS</p><h2 className="mt-1 text-lg font-bold">Test your resume against a real role</h2><p className="mt-1 text-xs text-slate-500">The ATS score is a resume-to-job match signal, not model accuracy.</p></div>
            <Sparkles size={18} className="text-cyan-300"/>
          </div>
          <textarea rows="6" value={jobDescription} onChange={e=>setJobDescription(e.target.value)} className="input-field" placeholder="Paste the job description here..."/>
          <button className="btn-primary mt-3" onClick={()=>ats.mutate(jobDescription)} disabled={ats.isPending||jobDescription.trim().length<40}>{ats.isPending?'Analyzing match...':'Run ATS analysis'}</button>
          {ats.data && <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-violet-500/10 p-4"><p className="text-xs text-slate-500">ATS Match</p><p className="mt-1 text-3xl font-black">{ats.data.atsScore}<span className="text-sm text-slate-500">/100</span></p></div>
            <div className="rounded-xl bg-cyan-500/10 p-4"><p className="text-xs text-slate-500">Keyword coverage</p><p className="mt-1 text-3xl font-black">{ats.data.keywordCoverage}%</p></div>
            <div className="rounded-xl bg-emerald-500/10 p-4"><p className="text-xs text-slate-500">Experience match</p><p className="mt-1 text-3xl font-black">{ats.data.experienceMatch}%</p></div>
            <div className="sm:col-span-3 grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">Matched skills</p><div className="flex flex-wrap gap-2">{(ats.data.matchedSkills||[]).map(s=><span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs">{s}</span>)}</div></div><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">Missing skills</p><div className="flex flex-wrap gap-2">{(ats.data.missingSkills||[]).map(s=><span key={s} className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs">{s}</span>)}</div></div></div>
          </div>}
        </div>
      )}

      {resume?.url && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50">
              <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
              AI resume analysis
            </h2>
            <button
              type="button"
              onClick={() => analyzeResume.mutate()}
              className="btn-secondary text-sm"
              disabled={analyzeResume.isPending}
            >
              {analyzeResume.isPending
                ? 'Analyzing...'
                : analysis
                  ? 'Re-analyze'
                  : 'Analyze with AI'}
            </button>
          </div>

          {isAnalysisLoading ? (
            <LoadingScreen label="Loading analysis..." />
          ) : !analysis && !analyzeResume.isPending ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Get AI feedback on your resume's strengths, weaknesses, and ATS-readiness.
            </p>
          ) : analysis ? (
            <div className="flex flex-col gap-4">
              {typeof analysis.atsScore === 'number' && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">ATS readiness score</p>
                  <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                    {analysis.atsScore}
                    <span className="text-base text-slate-400">/100</span>
                  </p>
                </div>
              )}
              {analysis.summary && (
                <p className="text-sm text-slate-600 dark:text-slate-300">{analysis.summary}</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {analysis.strengths?.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      Strengths
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                      {analysis.strengths.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.weaknesses?.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
                      Areas to improve
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                      {analysis.weaknesses.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {analysis.suggestions?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Suggestions
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {analysis.suggestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-slate-400">
                Generated {new Date(analysis.generatedAt).toLocaleString()}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default CandidateResumePage;
