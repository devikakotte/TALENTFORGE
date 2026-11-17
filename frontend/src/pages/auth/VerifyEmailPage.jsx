import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { ROUTES } from '../../constants';

function VerifyEmailPage() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    let active = true;
    apiClient.get(`/auth/verify-email/${token}`).then(() => {
      if (active) setState({ loading: false, success: true, message: 'Your email is verified. You can now continue to TalentForge.' });
    }).catch((error) => {
      if (active) setState({ loading: false, success: false, message: error.response?.data?.message || 'This verification link is invalid or expired.' });
    });
    return () => { active = false; };
  }, [token]);

  return <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4"><div className="glass w-full rounded-3xl p-8 text-center">{state.loading ? <Loader2 className="mx-auto animate-spin text-violet-400" size={32}/> : state.success ? <CheckCircle2 className="mx-auto text-emerald-400" size={40}/> : <CircleAlert className="mx-auto text-amber-400" size={40}/>}<h1 className="mt-5 text-2xl font-black">{state.loading?'Verifying email':state.success?'Email verified':'Verification failed'}</h1><p className="mt-2 text-sm text-slate-500">{state.message}</p>{!state.loading&&<Link to={ROUTES.LOGIN} className="btn-primary mt-6">Continue to login</Link>}</div></div>;
}
export default VerifyEmailPage;
