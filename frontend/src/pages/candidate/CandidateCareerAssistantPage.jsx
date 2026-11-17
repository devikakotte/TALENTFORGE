import { useState } from 'react';
import { Bot, Send, Sparkles, UserRound } from 'lucide-react';
import { useCareerAssistant } from '../../hooks/useAi';

const prompts = ['Why am I not getting shortlisted?', 'What should I learn for a backend role?', 'Improve my resume summary.', 'Which jobs should I prioritize?'];

function CandidateCareerAssistantPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const assistant = useCareerAssistant();

  const ask = (q = question) => {
    const value = q.trim();
    if (!value || assistant.isPending) return;
    setQuestion('');
    setMessages((m) => [...m, { role: 'user', text: value }]);
    assistant.mutate(value, { onSuccess: (result) => setMessages((m) => [...m, { role: 'assistant', text: result.answer }]) });
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div><p className="eyebrow flex items-center gap-2"><Sparkles size={14}/> TalentForge Copilot</p><h1 className="mt-2 text-3xl font-black">Your AI career assistant</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ask questions about your profile, job search and career direction. Responses are grounded in your authorized TalentForge data.</p></div>
      <div className="glass min-h-[520px] rounded-[2rem] p-4 sm:p-6">
        {messages.length === 0 ? <div className="flex h-[400px] flex-col items-center justify-center text-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/15 text-violet-400"><Bot size={30}/></div><h2 className="mt-5 text-xl font-bold">What are you working toward?</h2><div className="mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-2">{prompts.map(p=><button key={p} onClick={()=>ask(p)} className="rounded-xl border bg-white/50 p-3 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:border-violet-400 dark:bg-white/[.03]">{p}</button>)}</div></div> : <div className="space-y-4">{messages.map((m,i)=><div key={i} className={`flex gap-3 ${m.role==='user'?'justify-end':''}`}><div className={`flex max-w-[85%] gap-3 rounded-2xl p-4 ${m.role==='user'?'bg-violet-600 text-white':'bg-white/[.06] text-slate-200'}`}>{m.role==='assistant'?<Bot size={17} className="mt-0.5 shrink-0 text-cyan-300"/>:<UserRound size={17} className="mt-0.5 shrink-0"/>}<p className="whitespace-pre-line text-sm leading-6">{m.text}</p></div></div>)}{assistant.isPending&&<div className="flex items-center gap-2 text-xs text-slate-500"><Sparkles size={14} className="animate-pulse"/> Thinking with your career context...</div>}</div>}
      </div>
      <div className="sticky bottom-20 rounded-2xl border bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:bg-[#111218]/95 lg:bottom-4"><div className="flex items-end gap-2"><textarea rows="2" value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask();}}} className="input-field resize-none border-0 bg-transparent shadow-none focus:ring-0" placeholder="Ask your career copilot..."/><button className="btn-primary h-11 w-11 shrink-0 p-0" onClick={()=>ask()} disabled={!question.trim()||assistant.isPending} aria-label="Send"><Send size={17}/></button></div></div>
    </div>
  );
}
export default CandidateCareerAssistantPage;
