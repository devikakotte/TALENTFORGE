import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, BriefcaseBusiness, CheckCircle2, CircleUserRound, Sparkles, Target, Users } from 'lucide-react';
import { useFeaturedJobs, useRecentJobs } from '../../hooks/usePublicJobs';
import JobCard from '../../components/jobs/JobCard';
import LoadingScreen from '../../components/common/LoadingScreen';
import { ROUTES } from '../../constants';

const nodes = [
  { label: 'Candidates', icon: CircleUserRound, pos: 'left-4 top-8' },
  { label: 'AI Match', icon: BrainCircuit, pos: 'right-4 top-8' },
  { label: 'Jobs', icon: BriefcaseBusiness, pos: 'left-10 bottom-8' },
  { label: 'Skills', icon: Target, pos: 'right-10 bottom-8' },
];

function HomePage() {
  const { data: featuredJobs, isLoading: isFeaturedLoading } = useFeaturedJobs(4);
  const { data: recentJobs, isLoading: isRecentLoading } = useRecentJobs(6);

  return (
    <>
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="eyebrow mb-5 flex items-center gap-2"><Sparkles size={14}/> AI-powered career intelligence</div>
            <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-[-.04em] text-slate-950 dark:text-white sm:text-7xl">
              Forge your next <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">opportunity.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              TalentForge connects candidates and recruiters through one intelligent loop: assess, improve, prepare, match, apply and hire.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={ROUTES.JOBS} className="btn-primary px-5 py-3">Explore opportunities <ArrowRight size={17}/></Link>
              <Link to={ROUTES.REGISTER} className="btn-secondary px-5 py-3">I&apos;m hiring</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-400"/> AI resume insights</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-400"/> Smart job matching</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-400"/> Application tracking</span>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0f16] p-8 shadow-2xl shadow-violet-900/20">
            <div className="absolute inset-0 bg-hero-grid bg-[size:36px_36px] opacity-30" />
            <div className="absolute left-1/2 top-1/2 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 shadow-[0_0_90px_rgba(124,58,237,.28)]">
              <div className="text-center"><div className="text-3xl font-black tracking-tight text-white">T</div><div className="mt-1 text-[10px] uppercase tracking-[.25em] text-violet-200">TalentForge</div></div>
            </div>
            <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-[72%] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />
            {nodes.map(({label, icon: Icon, pos}) => <div key={label} className={`absolute ${pos} group rounded-2xl border border-white/10 bg-white/[.06] p-3 text-white backdrop-blur-xl transition duration-300 hover:scale-105 hover:border-violet-400/40`}><div className="flex items-center gap-2 text-xs font-bold"><Icon size={16} className="text-cyan-300"/>{label}</div><div className="mt-1 max-w-28 text-[10px] text-slate-400 group-hover:text-slate-200">{label === 'AI Match' ? 'Explainable fit scores' : 'Connected career signal'}</div></div>)}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 backdrop-blur">Career intelligence graph</div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200/70 bg-white/50 py-16 dark:border-white/10 dark:bg-white/[.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10"><p className="eyebrow">One intelligent loop</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">From profile to placement.</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[['01','Assess','Upload your resume, measure readiness and uncover gaps.'],['02','Improve','Get focused career suggestions and interview preparation.'],['03','Match & Hire','Discover relevant jobs while recruiters screen faster.']].map(([n,t,d]) => <div key={n} className="glass rounded-2xl p-6"><span className="text-sm font-black text-violet-400">{n}</span><h3 className="mt-5 text-xl font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{d}</p></div>)}
          </div>
        </div>
      </section>

      {!isFeaturedLoading && featuredJobs?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between"><div><p className="eyebrow">Opportunity board</p><h2 className="mt-1 text-3xl font-black">Roles worth a look.</h2></div><Link to={ROUTES.JOBS} className="hidden items-center gap-1 text-sm font-semibold text-violet-500 sm:flex">View all <ArrowRight size={15}/></Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featuredJobs.map((job) => <JobCard key={job._id} job={job} />)}</div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-indigo-500/10 to-cyan-400/10 p-8 sm:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div><p className="eyebrow">Built for both sides</p><h2 className="mt-2 text-3xl font-black">Candidates get clarity. Recruiters get signal.</h2><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">AI assistance is grounded in profile and job data, while hiring decisions stay with people.</p></div>
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border bg-white/70 p-4 dark:border-white/10 dark:bg-black/20"><Users className="text-violet-400"/><p className="mt-3 font-bold">Candidate workspace</p><p className="mt-1 text-xs text-slate-500">Resume, readiness, matching and applications.</p></div><div className="rounded-2xl border bg-white/70 p-4 dark:border-white/10 dark:bg-black/20"><Target className="text-cyan-400"/><p className="mt-3 font-bold">Recruiter workspace</p><p className="mt-1 text-xs text-slate-500">Jobs, applicants, talent search and AI screening.</p></div></div>
          </div>
        </div>
      </section>

      {!isRecentLoading && recentJobs?.length > 0 && <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-black">Fresh opportunities</h2><Link to={ROUTES.JOBS} className="text-sm font-semibold text-violet-500">Browse all</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{recentJobs.map((job) => <JobCard key={job._id} job={job}/>)}</div></section>}
      {isRecentLoading && <LoadingScreen label="Loading opportunities..." />}
    </>
  );
}
export default HomePage;
