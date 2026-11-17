import { useState } from 'react';
import { BrainCircuit, CheckCircle2, CircleAlert, Map, Target, Sparkles } from 'lucide-react';
import { useReadiness, useSkillGaps, useRoadmap } from '../../hooks/useAi';
import LoadingScreen from '../../components/common/LoadingScreen';

function CandidateReadinessPage() {
  const [targetRole, setTargetRole] = useState('');
  const [submittedRole, setSubmittedRole] = useState('');
  const params = { targetRole: submittedRole };
  const readiness = useReadiness(params, { enabled: Boolean(submittedRole) });
  const gaps = useSkillGaps(params, { enabled: Boolean(submittedRole) });
  const roadmap = useRoadmap(params, { enabled: false });

  const run = () => setSubmittedRole(targetRole.trim());

  return (
    <div className="flex flex-col gap-6">
      <div><p className="eyebrow flex items-center gap-2"><BrainCircuit size={14}/> AI career intelligence</p><h1 className="mt-2 text-3xl font-black">Job readiness lab</h1><p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Measure your preparedness for a target role, understand the gaps and generate a focused learning plan.</p></div>
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row"><input className="input-field" placeholder="Target role, e.g. Backend Developer" value={targetRole} onChange={e=>setTargetRole(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()}/><button className="btn-primary shrink-0" onClick={run} disabled={!targetRole.trim()}>Assess role <Sparkles size={16}/></button></div>
      </div>
      {readiness.isLoading && <LoadingScreen label="Calculating readiness..." />}
      {submittedRole && readiness.data && <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <div className="card">
          <p className="text-sm font-semibold text-slate-500">Estimated readiness</p>
          <div className="mt-5 flex items-center gap-5">
            <div className="grid h-32 w-32 place-items-center rounded-full bg-[conic-gradient(#8b5cf6_var(--score),rgba(255,255,255,.08)_0)]" style={{'--score':`${readiness.data.score}%`}}><div className="grid h-24 w-24 place-items-center rounded-full bg-[#0c0d12] text-3xl font-black">{readiness.data.score}<span className="text-xs font-semibold text-slate-500">/100</span></div></div>
            <div><p className="font-bold">{readiness.data.targetRole}</p><p className="mt-1 text-xs text-slate-500">Preparedness indicator, not an employment guarantee.</p></div>
          </div>
          <div className="mt-6 space-y-3">{Object.entries(readiness.data.factors || {}).map(([k,v])=><div key={k}><div className="mb-1 flex justify-between text-xs"><span className="capitalize text-slate-500">{k.replace(/([A-Z])/g,' $1')}</span><span className="font-bold">{v}%</span></div><div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{width:`${v}%`}}/></div></div>)}</div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between"><div><p className="eyebrow">Skill gap</p><h2 className="mt-1 text-xl font-black">{gaps.data?.gapCount ?? '—'} skills to close</h2></div><Target className="text-cyan-400"/></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-emerald-500/5 p-4 dark:border-white/10"><p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Matched</p><div className="mt-3 flex flex-wrap gap-2">{(gaps.data?.matchedSkills||[]).map(s=><span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs">{s}</span>)}</div></div>
            <div className="rounded-xl border bg-amber-500/5 p-4 dark:border-white/10"><p className="text-xs font-bold uppercase tracking-wider text-amber-400">Missing</p><div className="mt-3 flex flex-wrap gap-2">{(gaps.data?.missingSkills||[]).map(s=><span key={s} className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs">{s}</span>)}</div></div>
          </div>
          <button className="btn-secondary mt-5" onClick={()=>roadmap.refetch()} disabled={roadmap.isFetching}><Map size={16}/>{roadmap.isFetching?'Generating roadmap...':'Generate learning roadmap'}</button>
          {roadmap.data && <div className="mt-5 space-y-3">{roadmap.data.stages.map((stage,i)=><div key={`${stage.priority}-${i}`} className="flex gap-3 rounded-xl border p-4 dark:border-white/10"><div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-400">{i+1}</div><div><p className="font-semibold">{stage.action}</p><p className="text-xs text-slate-500">{stage.skill} · {stage.outcome}</p></div></div>)}</div>}
        </div>
      </div>}
      {!submittedRole && <div className="card text-center"><CircleAlert className="mx-auto text-violet-400"/><p className="mt-3 font-semibold">Choose a target role to start.</p><p className="mt-1 text-sm text-slate-500">The engine uses your profile, skills and resume signals.</p></div>}
    </div>
  );
}
export default CandidateReadinessPage;
