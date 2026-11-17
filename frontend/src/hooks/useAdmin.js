import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';

export function usePlatformAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminService.getPlatformAnalytics,
  });
}

export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.listUsers(params),
    keepPreviousData: true,
  });
}

export function useSetUserActiveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }) => adminService.setUserActiveStatus(userId, isActive),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(`${user.fullName} ${user.isActive ? 'activated' : 'deactivated'}`);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not update user'),
  });
}

export function useAdminCompanies(params = {}) {
  return useQuery({
    queryKey: ['admin', 'companies', params],
    queryFn: () => adminService.listCompanies(params),
    keepPreviousData: true,
  });
}

export function useVerifyCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.verifyCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      toast.success('Company verified');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not verify company'),
  });
}

export function useUnverifyCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.unverifyCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      toast.success('Verification revoked');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not update company'),
  });
}

export function useAdminJobs(params = {}) {
  return useQuery({
    queryKey: ['admin', 'jobs', params],
    queryFn: () => adminService.listJobsForModeration(params),
    keepPreviousData: true,
  });
}

export function useModerateCloseJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.moderateCloseJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      toast.success('Job closed');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not close job'),
  });
}

export function useDeleteJobAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      toast.success('Job deleted');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not delete job'),
  });
}
