import { useQuery } from '@tanstack/react-query';
import publicJobService from '../services/publicJobService';

export function useBrowseJobs(filters = {}) {
  return useQuery({
    queryKey: ['jobs', 'browse', filters],
    queryFn: () => publicJobService.browseJobs(filters),
    keepPreviousData: true,
  });
}

export function useFeaturedJobs(limit = 6) {
  return useQuery({
    queryKey: ['jobs', 'featured', limit],
    queryFn: () => publicJobService.getFeaturedJobs(limit),
  });
}

export function useRecentJobs(limit = 6) {
  return useQuery({
    queryKey: ['jobs', 'recent', limit],
    queryFn: () => publicJobService.getRecentJobs(limit),
  });
}

export function useJobDetails(jobId) {
  return useQuery({
    queryKey: ['jobs', 'details', jobId],
    queryFn: () => publicJobService.getJobDetails(jobId),
    enabled: Boolean(jobId),
  });
}
