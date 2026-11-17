import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import applicationService from '../services/applicationService';

const MY_APPLICATIONS_KEY = ['applications', 'mine'];
const applicantsKey = (jobId) => ['applications', 'job', jobId];

export function useMyApplications(params = {}) {
  return useQuery({
    queryKey: [...MY_APPLICATIONS_KEY, params],
    queryFn: () => applicationService.listMyApplications(params),
    keepPreviousData: true,
  });
}

export function useMyApplicationStats() {
  return useQuery({
    queryKey: ['applications', 'stats'],
    queryFn: applicationService.getMyApplicationStats,
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, coverLetter }) => applicationService.applyToJob(jobId, { coverLetter }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_KEY });
      toast.success('Application submitted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not submit application');
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applicationService.withdrawApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_APPLICATIONS_KEY });
      toast.success('Application withdrawn');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not withdraw application');
    },
  });
}

export function useApplicantsForJob(jobId, params = {}) {
  return useQuery({
    queryKey: [...applicantsKey(jobId), params],
    queryFn: () => applicationService.listApplicantsForJob(jobId, params),
    enabled: Boolean(jobId),
    keepPreviousData: true,
  });
}

export function useUpdateApplicationStatus(jobId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, status }) =>
      applicationService.updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantsKey(jobId) });
      toast.success('Applicant status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not update status');
    },
  });
}
