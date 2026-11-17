import { useNavigate, useParams } from 'react-router-dom';
import JobForm from '../../components/recruiter/JobForm';
import { useMyJob, useUpdateJob } from '../../hooks/useJobs';
import LoadingScreen from '../../components/common/LoadingScreen';
import { ROUTES } from '../../constants';

function RecruiterJobEditPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading } = useMyJob(jobId);
  const updateJob = useUpdateJob();

  if (isLoading) return <LoadingScreen label="Loading job..." />;

  const handleSubmit = (values) => {
    updateJob.mutate(
      { jobId, payload: values },
      { onSuccess: () => navigate(`${ROUTES.RECRUITER_DASHBOARD}/jobs`) },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Edit job</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{job?.title}</p>
      </div>
      <JobForm
        job={job}
        onSubmit={handleSubmit}
        isSubmitting={updateJob.isPending}
        submitLabel="Save changes"
      />
    </div>
  );
}

export default RecruiterJobEditPage;
