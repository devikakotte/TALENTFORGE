import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import savedJobService from '../services/savedJobService';

const SAVED_JOBS_KEY = ['savedJobs', 'mine'];

export function useSavedJobs(params = {}, options = {}) {
  return useQuery({
    queryKey: [...SAVED_JOBS_KEY, params],
    queryFn: () => savedJobService.listSavedJobs(params),
    keepPreviousData: true,
    enabled: options.enabled ?? true,
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savedJobService.saveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_JOBS_KEY });
      toast.success('Job saved');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not save job');
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savedJobService.unsaveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_JOBS_KEY });
      toast.success('Job removed from saved list');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not remove job');
    },
  });
}
