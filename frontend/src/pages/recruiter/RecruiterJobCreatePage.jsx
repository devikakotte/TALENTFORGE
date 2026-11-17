import { useNavigate } from 'react-router-dom';
import JobForm from '../../components/recruiter/JobForm';
import { useCreateJob } from '../../hooks/useJobs';
import { ROUTES } from '../../constants';

function RecruiterJobCreatePage() {
  const navigate = useNavigate();
  const createJob = useCreateJob();

  const handleSubmit = (values) => {
    createJob.mutate(values, {
      onSuccess: () => navigate(`${ROUTES.RECRUITER_DASHBOARD}/jobs`),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Post a new job</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Jobs are created as drafts — publish when you&apos;re ready to go live.
        </p>
      </div>
      <JobForm onSubmit={handleSubmit} isSubmitting={createJob.isPending} submitLabel="Create job" />
    </div>
  );
}

export default RecruiterJobCreatePage;
