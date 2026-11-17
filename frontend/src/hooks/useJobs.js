import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import jobService from '../services/jobService';

const MY_JOBS_KEY = ['recruiter', 'jobs'];
const jobKey = (jobId) => ['recruiter', 'jobs', jobId];

export function useMyJobs(params = {}) {
  return useQuery({
    queryKey: [...MY_JOBS_KEY, params],
    queryFn: () => jobService.listMyJobs(params),
    keepPreviousData: true,
  });
}

export function useMyJob(jobId) {
  return useQuery({
    queryKey: jobKey(jobId),
    queryFn: () => jobService.getMyJob(jobId),
    enabled: Boolean(jobId),
  });
}

function useJobMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_JOBS_KEY });
      if (successMessage) toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });
}

export function useMyJobStats() {
  return useQuery({
    queryKey: ['recruiter', 'jobStats'],
    queryFn: jobService.getMyJobStats,
  });
}

export function useCreateJob() {
  return useJobMutation(jobService.createJob, 'Job created as a draft');
}

export function useUpdateJob() {
  return useJobMutation(({ jobId, payload }) => jobService.updateJob(jobId, payload), 'Job updated');
}

export function usePublishJob() {
  return useJobMutation(jobService.publishJob, 'Job published');
}

export function useCloseJob() {
  return useJobMutation(jobService.closeJob, 'Job closed');
}

export function useDeleteJob() {
  return useJobMutation(jobService.deleteJob, 'Job deleted');
}
